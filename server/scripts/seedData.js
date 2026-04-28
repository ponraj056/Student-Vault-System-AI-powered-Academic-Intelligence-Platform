/**
 * server/scripts/seedData.js
 * ---------------------------
 * Run this once to populate MongoDB with demo data for the test student 21CS101.
 * Usage: node scripts/seedData.js
 */

require('dotenv').config();
const mongoose   = require('mongoose');
const Student    = require('../models/Student');
const Attendance = require('../models/Attendance');
const Result     = require('../models/Result');
const Internship = require('../models/Internship');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find the test student
  const student = await Student.findOne({ regNo: '21CS101' });
  if (!student) {
    console.error('Student 21CS101 not found. Register via the app first, then run this seed.');
    process.exit(1);
  }
  const sid = student._id;

  // Clear existing records
  await Attendance.deleteMany({ studentId: sid });
  await Result.deleteMany({ studentId: sid });
  await Internship.deleteMany({ studentId: sid });

  // Attendance records
  await Attendance.insertMany([
    { studentId: sid, subject: 'Data Structures',        percentage: 82, month: 'March 2025' },
    { studentId: sid, subject: 'Operating Systems',      percentage: 71, month: 'March 2025' },
    { studentId: sid, subject: 'Database Management',    percentage: 91, month: 'March 2025' },
    { studentId: sid, subject: 'Computer Networks',      percentage: 65, month: 'March 2025' },
    { studentId: sid, subject: 'Software Engineering',   percentage: 88, month: 'March 2025' },
  ]);

  // Result records
  await Result.insertMany([
    { studentId: sid, semester: 4, subject: 'Data Structures',      marks: 89, grade: 'A+' },
    { studentId: sid, semester: 4, subject: 'Operating Systems',     marks: 74, grade: 'B+' },
    { studentId: sid, semester: 4, subject: 'Database Management',   marks: 92, grade: 'A+' },
    { studentId: sid, semester: 3, subject: 'Computer Networks',     marks: 78, grade: 'A'  },
    { studentId: sid, semester: 3, subject: 'Software Engineering',  marks: 85, grade: 'A'  },
    { studentId: sid, semester: 3, subject: 'Discrete Mathematics',  marks: 69, grade: 'B'  },
  ]);

  // Internship records
  await Internship.insertMany([
    {
      studentId: sid,
      company:   'TCS',
      role:      'Software Developer Intern',
      startDate: new Date('2024-12-01'),
      endDate:   new Date('2025-02-28'),
      status:    'completed',
    },
    {
      studentId: sid,
      company:   'Infosys',
      role:      'Data Science Intern',
      startDate: new Date('2025-05-01'),
      endDate:   new Date('2025-07-31'),
      status:    'upcoming',
    },
  ]);

  console.log('✅ Demo data seeded successfully for student 21CS101!');
  console.log('   Attendance : 5 records');
  console.log('   Results    : 6 records (Semesters 3 & 4)');
  console.log('   Internships: 2 records');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
