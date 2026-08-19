require('dotenv').config();
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const { pool } = require('../config/postgres');

const workbookPath = process.argv[2];

function text(value) {
  return String(value ?? '').trim();
}

function findHeaderRow(rows) {
  return rows.findIndex(row => row.some(cell => text(cell).toUpperCase() === 'REG NO'));
}

function readRoster(workbook) {
  const students = new Map();

  for (const sheetName of workbook.SheetNames) {
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
    const headerIndex = findHeaderRow(rows);
    if (headerIndex < 0) continue;

    const headers = rows[headerIndex].map(cell => text(cell).toUpperCase());
    for (const row of rows.slice(headerIndex + 1)) {
      const values = Object.fromEntries(headers.map((header, index) => [header, row[index]]));
      const rollNo = text(values['REG NO']);
      const name = text(values.NAME);
      const email = text(values['MAIL ID']).toLowerCase();
      if (!rollNo || !name) continue;

      const existing = students.get(rollNo) || {};
      students.set(rollNo, {
        ...existing,
        rollNo,
        name,
        email: email || existing.email || null,
        dob: text(values.DOB) || existing.dob || null,
        attendance: Number(values['0.12']) || existing.attendance || null,
        cgpa: Number(values.CGPA) || existing.cgpa || null,
        academicStatus: text(values['0.1']) || existing.academicStatus || null,
        nptel: text(values.NPTEL) || existing.nptel || null,
        vac: text(values.VAC) || existing.vac || null,
      });
    }
  }

  return [...students.values()];
}

async function importRoster() {
  if (!workbookPath) throw new Error('Provide the Excel workbook path as the first argument.');
  const students = readRoster(xlsx.readFile(workbookPath));
  if (!students.length) throw new Error('No valid student rows were found in the workbook.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("DELETE FROM users WHERE role = 'student' AND department = 'it'");
    await client.query("DELETE FROM students WHERE department = 'IT'");

    for (const student of students) {
      const inserted = await client.query(
        `INSERT INTO students (
          roll_no, name, email, department, batch, year_of_study, date_of_birth,
          academic_status, cgpa, attendance, nptel, vac
        ) VALUES ($1, $2, $3, 'IT', '2023', 3, NULLIF($4, '')::date, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          student.rollNo,
          student.name,
          student.email,
          student.dob,
          student.academicStatus,
          student.cgpa,
          student.attendance,
          student.nptel,
          student.vac,
        ]
      );

      const loginPassword = student.rollNo.slice(-6);
      const passwordHash = await bcrypt.hash(loginPassword, 10);
      await client.query(
        `INSERT INTO users (username, password_hash, role, name, email, department, student_id)
         VALUES ($1, $2, 'student', $3, $4, 'it', $5)`,
        [student.rollNo, passwordHash, student.name, student.email, student.rollNo]
      );
      if (!inserted.rows[0]) throw new Error(`Could not create student ${student.rollNo}.`);
    }

    await client.query('COMMIT');
    console.log(`Imported ${students.length} IT students.`);
    console.log('Login ID: register number. Password: last six digits of the register number.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importRoster().catch(error => {
  console.error(`Import failed: ${error.message}`);
  process.exit(1);
});
