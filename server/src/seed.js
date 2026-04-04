/**
 * Seed script — run with: node src/seed.js
 * Populates college_db with sample data for all departments
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { getDeptModels } = require('./models/deptModels');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

const sampleStudents = [
  { rollNo: 'CS001', name: 'Arjun Sharma',   year: 3, section: 'A', email: 'arjun@vsb.edu',   phone: '9876543210', batch: '2022-26' },
  { rollNo: 'CS002', name: 'Priya Mehta',    year: 3, section: 'A', email: 'priya@vsb.edu',   phone: '9876543211', batch: '2022-26' },
  { rollNo: 'CS003', name: 'Rahul Nair',     year: 3, section: 'B', email: 'rahul@vsb.edu',   phone: '9876543212', batch: '2022-26' },
  { rollNo: 'CS004', name: 'Sneha Iyer',     year: 3, section: 'B', email: 'sneha@vsb.edu',   phone: '9876543213', batch: '2022-26' },
  { rollNo: 'CS005', name: 'Vikram Patel',   year: 3, section: 'A', email: 'vikram@vsb.edu',  phone: '9876543214', batch: '2022-26' },
];

const sampleResults = [
  { rollNo: 'CS001', name: 'Arjun Sharma', semester: 5, subject: 'Data Structures', subCode: 'CS501', grade: 'O',  gp: 10, cgpa: 9.5, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: 'CS002', name: 'Priya Mehta',  semester: 5, subject: 'Data Structures', subCode: 'CS501', grade: 'A+', gp: 9,  cgpa: 8.8, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: 'CS003', name: 'Rahul Nair',   semester: 5, subject: 'Data Structures', subCode: 'CS501', grade: 'B+', gp: 7,  cgpa: 7.2, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: 'CS004', name: 'Sneha Iyer',   semester: 5, subject: 'Data Structures', subCode: 'CS501', grade: 'RA', gp: 0,  cgpa: 5.5, arrears: 2, result: 'Fail', status: 'Fail' },
  { rollNo: 'CS005', name: 'Vikram Patel', semester: 5, subject: 'Data Structures', subCode: 'CS501', grade: 'RA', gp: 0,  cgpa: 4.8, arrears: 3, result: 'Fail', status: 'Fail' },
];

const sampleAttendance = [
  { rollNo: 'CS001', name: 'Arjun Sharma', date: '01-Apr', status: 'P' },
  { rollNo: 'CS002', name: 'Priya Mehta',  date: '01-Apr', status: 'P' },
  { rollNo: 'CS003', name: 'Rahul Nair',   date: '01-Apr', status: 'A' },
  { rollNo: 'CS004', name: 'Sneha Iyer',   date: '01-Apr', status: 'P' },
  { rollNo: 'CS005', name: 'Vikram Patel', date: '01-Apr', status: 'A' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'college_db' });
    console.log('Connected to MongoDB → college_db');

    const { Student, Result, Attendance } = getDeptModels('cse');

    await Student.deleteMany({});
    await Result.deleteMany({});
    await Attendance.deleteMany({});

    await Student.insertMany(sampleStudents);
    await Result.insertMany(sampleResults);
    await Attendance.insertMany(sampleAttendance);

    console.log(`✅ Seeded ${sampleStudents.length} students, ${sampleResults.length} results, ${sampleAttendance.length} attendance records into CSE`);
    console.log('\n🎉 Seed complete! Run: npm run dev');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

seed();
