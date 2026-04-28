/**
 * server/services/excelImportService.js
 * ----------------------------------------
 * Parse Excel/CSV files and bulk upsert student data.
 * Flexible column detection, formula injection prevention.
 * Uses xlsx library (already installed).
 */
const XLSX = require('xlsx');
const Student = require('../models/Student');

// ── Column name mapping (flexible header detection) ───────────────────────────
const COLUMN_MAP = {
  rollno: 'regNo', 'roll no': 'regNo', 'register number': 'regNo', 'reg no': 'regNo',
  'registration number': 'regNo', 'regno': 'regNo', regNo: 'regNo',
  name: 'name', 'student name': 'name', 'full name': 'name',
  email: 'email', 'email id': 'email', 'email address': 'email',
  phone: 'phone', mobile: 'phone', 'phone number': 'phone', 'mobile number': 'phone',
  section: 'section',
  year: 'year',
  semester: 'semester', sem: 'semester',
  batch: 'batch',
  cgpa: 'cgpa', gpa: 'cgpa',
  'blood group': 'bloodGroup', bloodgroup: 'bloodGroup',
  dob: 'dob', 'date of birth': 'dob',
  address: 'address',
  'parent name': 'parentName', parentname: 'parentName', 'father name': 'parentName',
  'parent phone': 'parentPhone', parentphone: 'parentPhone', 'father phone': 'parentPhone',
  department: 'department', dept: 'department',
};

/**
 * Detect dangerous formula injection in cell values.
 */
function isMaliciousValue(val) {
  if (typeof val !== 'string') return false;
  return /^[=+\-@]/.test(val.trim());
}

/**
 * Sanitize a cell value — trim, detect injection.
 */
function sanitize(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (isMaliciousValue(str)) return ''; // strip malicious formulas
  return str;
}

/**
 * Map raw Excel headers to our schema field names.
 */
function mapHeaders(rawHeaders) {
  const mapped = {};
  for (const header of rawHeaders) {
    const normalized = header.toString().trim().toLowerCase();
    if (COLUMN_MAP[normalized]) {
      mapped[header] = COLUMN_MAP[normalized];
    }
  }
  return mapped;
}

/**
 * Parse an Excel/CSV buffer and bulk upsert into the Student collection.
 * @param {Buffer} buffer   — file buffer
 * @param {string} dept     — department name (used as default if not in sheet)
 * @returns {{ total, inserted, updated, skipped, errors }}
 */
async function parseAndImport(buffer, dept) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

  if (!rows.length) {
    return { total: 0, inserted: 0, updated: 0, skipped: 0, errors: ['File is empty or has no data rows.'] };
  }

  // Map headers
  const rawHeaders = Object.keys(rows[0]);
  const headerMap = mapHeaders(rawHeaders);

  let inserted = 0, updated = 0, skipped = 0;
  const errors = [];
  const bulkOps = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed + header

    try {
      // Build mapped object
      const mapped = {};
      for (const [rawHeader, schemaField] of Object.entries(headerMap)) {
        mapped[schemaField] = sanitize(row[rawHeader]);
      }

      // Also try direct field names (if headers exactly match schema)
      for (const key of Object.keys(row)) {
        const normalized = key.trim().toLowerCase();
        if (COLUMN_MAP[normalized] && !mapped[COLUMN_MAP[normalized]]) {
          mapped[COLUMN_MAP[normalized]] = sanitize(row[key]);
        }
      }

      // regNo is mandatory
      const regNo = (mapped.regNo || '').toUpperCase();
      if (!regNo) {
        errors.push(`Row ${rowNum}: Missing register number — skipped.`);
        skipped++;
        continue;
      }

      // Build update document
      const updateDoc = { regNo };
      if (mapped.name) updateDoc.name = mapped.name;
      if (mapped.email) updateDoc.email = mapped.email.toLowerCase();
      if (mapped.phone) updateDoc.phone = mapped.phone;
      if (mapped.section) updateDoc.section = mapped.section;
      if (mapped.year) updateDoc.year = Number(mapped.year) || undefined;
      if (mapped.semester) updateDoc.semester = Number(mapped.semester) || undefined;
      if (mapped.batch) updateDoc.batch = mapped.batch;
      if (mapped.cgpa) updateDoc.cgpa = Number(mapped.cgpa) || undefined;
      if (mapped.bloodGroup) updateDoc.bloodGroup = mapped.bloodGroup;
      if (mapped.address) updateDoc.address = mapped.address;
      if (mapped.parentName) updateDoc.parentName = mapped.parentName;
      if (mapped.parentPhone) updateDoc.parentPhone = mapped.parentPhone;
      if (mapped.department) updateDoc.department = mapped.department;

      // DOB handling
      if (mapped.dob) {
        const d = new Date(mapped.dob);
        if (!isNaN(d.getTime())) updateDoc.dob = d;
      }

      // Default department from request
      if (!updateDoc.department) updateDoc.department = dept;
      if (!updateDoc.department) {
        errors.push(`Row ${rowNum} (${regNo}): No department — skipped.`);
        skipped++;
        continue;
      }

      // Must have a name for new records
      if (!mapped.name) {
        // Check if student exists (update case)
        const existing = await Student.findOne({ regNo });
        if (!existing) {
          errors.push(`Row ${rowNum} (${regNo}): Missing name for new student — skipped.`);
          skipped++;
          continue;
        }
      }

      bulkOps.push({
        updateOne: {
          filter: { regNo },
          update: { $set: { ...updateDoc, role: 'student', isActive: true } },
          upsert: true,
        },
      });

    } catch (err) {
      errors.push(`Row ${rowNum}: ${err.message}`);
      skipped++;
    }
  }

  // Execute bulk write
  if (bulkOps.length > 0) {
    const result = await Student.bulkWrite(bulkOps, { ordered: false });
    inserted = result.upsertedCount || 0;
    updated = result.modifiedCount || 0;
  }

  return {
    total: rows.length,
    inserted,
    updated,
    skipped,
    errors,
  };
}

module.exports = { parseAndImport };
