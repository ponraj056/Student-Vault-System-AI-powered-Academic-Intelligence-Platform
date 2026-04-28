/**
 * server/routes/import.js  (v3 — PRD-compliant)
 * -------------------------------------------------
 * Excel/CSV bulk import for student data, attendance, results.
 * Uses ExcelJS-compatible parsing via xlsx + flexible column mapping.
 *
 * POST /api/import/students   — upsert students from Excel
 * POST /api/import/attendance — bulk attendance
 * POST /api/import/results    — bulk results
 */
const express   = require('express');
const router    = express.Router();
const XLSX      = require('xlsx');
const { authenticate, requireRole, requireSameDept } = require('../middleware/auth');
const { uploadExcel }  = require('../middleware/upload');
const Student   = require('../models/Student');
const Attendance = require('../models/Attendance');
const Result    = require('../models/Result');
const { parseAndImport } = require('../services/excelImportService');
const { logAudit } = require('../services/auditService');

// Staff/HoD/Admin can import
const importGuard = [authenticate, requireRole('staff', 'hod', 'admin'), requireSameDept];

// Helper: parse buffer to array of row objects
function parseBuffer(buffer) {
  const wb   = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const ws   = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
}

// ─── Import Students (uses new excelImportService) ────────────────────────────
router.post('/students', importGuard, uploadExcel.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });

    const dept = req.deptFilter || req.body.department || req.user.department;
    const result = await parseAndImport(req.file.buffer, dept);

    await logAudit('IMPORT_STUDENTS', req.user.employeeId || req.user.regNo, req.user.role, null, {
      department: dept, ...result, filename: req.file.originalname,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Import/students]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Import Attendance ────────────────────────────────────────────────────────
router.post('/attendance', importGuard, uploadExcel.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });
    const rows = parseBuffer(req.file.buffer);
    let saved = 0, skipped = 0;
    const errors = [];

    for (const row of rows) {
      try {
        const regNo      = String(row['RegNo'] || row['REGNO'] || row['Roll No'] || '').trim().toUpperCase();
        const subject    = String(row['Subject'] || row['SUBJECT'] || '').trim();
        const percentage = Number(row['Percentage'] || row['PERCENTAGE'] || row['Attendance'] || 0);
        const month      = String(row['Month'] || row['MONTH'] || '').trim();

        if (!regNo || !subject || !month) { skipped++; continue; }
        const student = await Student.findOne({ regNo });
        if (!student) { errors.push(`Student not found: ${regNo}`); continue; }

        await Attendance.findOneAndUpdate(
          { studentId: student._id, subject, month },
          { studentId: student._id, subject, percentage, month },
          { upsert: true }
        );
        saved++;
      } catch (err) { errors.push(err.message); }
    }

    res.json({ success: true, data: { saved, skipped, errors, total: rows.length } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── Import Results ───────────────────────────────────────────────────────────
router.post('/results', importGuard, uploadExcel.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });
    const rows = parseBuffer(req.file.buffer);
    let saved = 0, skipped = 0;
    const errors = [];

    for (const row of rows) {
      try {
        const regNo    = String(row['RegNo'] || row['Roll No'] || '').trim().toUpperCase();
        const semester = Number(row['Semester'] || row['Sem'] || 0);
        const subject  = String(row['Subject'] || '').trim();
        const marks    = Number(row['Marks'] || row['Total'] || 0);
        const grade    = String(row['Grade'] || '').trim();

        if (!regNo || !semester || !subject || !grade) { skipped++; continue; }
        const student = await Student.findOne({ regNo });
        if (!student) { errors.push(`Student not found: ${regNo}`); continue; }

        await Result.findOneAndUpdate(
          { studentId: student._id, semester, subject },
          { studentId: student._id, semester, subject, marks, grade },
          { upsert: true }
        );
        saved++;
      } catch (err) { errors.push(err.message); }
    }

    res.json({ success: true, data: { saved, skipped, errors, total: rows.length } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
