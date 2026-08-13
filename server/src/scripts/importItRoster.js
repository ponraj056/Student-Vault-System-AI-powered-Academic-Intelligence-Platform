/*
 * Replaces IT student and student-login data with the supplied workbook.
 * Usage: node src/scripts/importItRoster.js "C:\\path\\to\\IT_students_2023-email.xlsx"
 */
require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const User = require('../models/userModel');
const { getDeptModels } = require('../models/deptModels');

const workbookPath = process.argv[2];
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const defaultPassword = process.env.DEFAULT_STUDENT_PASSWORD || 'ChangeMe123!';

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
      if (!rollNo || !name || !email) continue;
      const existing = students.get(rollNo) || {};
      students.set(rollNo, {
        ...existing,
        rollNo,
        name,
        email,
        dob: text(values.DOB) || existing.dob,
        attendance: Number(values['0.12']) || existing.attendance || 0,
        cgpa: Number(values.CGPA) || existing.cgpa || 0,
        academicStatus: text(values['0.1']) || existing.academicStatus || '',
        nptel: text(values.NPTEL) || existing.nptel || '',
        vac: text(values.VAC) || existing.vac || '',
        department: 'IT',
        batch: '2023',
        year: 3,
      });
    }
  }
  return [...students.values()];
}

async function run() {
  if (!workbookPath) throw new Error('Provide the workbook path as the first argument.');
  const workbook = xlsx.readFile(workbookPath);
  const students = readRoster(workbook);
  if (!students.length) throw new Error('No students with REG NO, NAME, and MAIL ID were found.');

  await mongoose.connect(mongoUri, { dbName: 'college_db' });
  const { Student, Result, Attendance } = getDeptModels('it');
  const existingRollNos = (await Student.find({}, { rollNo: 1, _id: 0 }).lean()).map(student => student.rollNo);

  await Promise.all([
    Student.deleteMany({}),
    Result.deleteMany({}),
    Attendance.deleteMany({}),
    User.deleteMany({ role: 'student', department: 'it' }),
    User.deleteMany({ role: 'student', studentId: { $in: existingRollNos } }),
  ]);

  await Student.insertMany(students);
  for (const student of students) {
    await User.create({
      username: student.email,
      password: defaultPassword,
      role: 'student',
      department: 'it',
      studentId: student.rollNo,
      name: student.name,
    });
  }

  console.log(`Imported ${students.length} IT students and created ${students.length} student logins.`);
  console.log('Students sign in with their register number or email and the DEFAULT_STUDENT_PASSWORD.');
}

run()
  .catch(error => { console.error(`Import failed: ${error.message}`); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
