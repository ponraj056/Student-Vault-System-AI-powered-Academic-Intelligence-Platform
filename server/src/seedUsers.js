/**
 * VSB Engineering College — User Seed
 * Students: email + register number as password
 * Faculty:  email + FAC ID
 * HOD:      email + HOD ID (dept-locked)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/userModel');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

const users = [
  // ── STUDENTS (email = username, register number = password) ──────
  { username: 'adhinarayanan.s@vsb.edu.in',  password: '23CS001',  role: 'student', name: 'Adhinarayanan S',   studentId: '23CS001', department: 'cse', email: 'adhinarayanan.s@vsb.edu.in' },
  { username: 'priya.mehta@vsb.edu.in',       password: '23CS002',  role: 'student', name: 'Priya Mehta',       studentId: '23CS002', department: 'cse', email: 'priya.mehta@vsb.edu.in' },
  { username: 'rahul.nair@vsb.edu.in',        password: '23CS003',  role: 'student', name: 'Rahul Nair',        studentId: '23CS003', department: 'cse', email: 'rahul.nair@vsb.edu.in' },
  { username: 'kavya.reddy@vsb.edu.in',       password: '22CS001',  role: 'student', name: 'Kavya Reddy',       studentId: '22CS001', department: 'cse', email: 'kavya.reddy@vsb.edu.in' },
  { username: 'rohan.verma@vsb.edu.in',       password: '22CS004',  role: 'student', name: 'Rohan Verma',       studentId: '22CS004', department: 'cse', email: 'rohan.verma@vsb.edu.in' },
  { username: 'anjali.nair@vsb.edu.in',       password: '21CS002',  role: 'student', name: 'Anjali Nair',       studentId: '21CS002', department: 'cse', email: 'anjali.nair@vsb.edu.in' },
  // Personal Gmail format also works (for demo)
  { username: 'adhinarayanan.stm@gmail.com',  password: '23CS001',  role: 'student', name: 'Adhinarayanan S',   studentId: '23CS001', department: 'cse', email: 'adhinarayanan.stm@gmail.com' },

  // ── FACULTY (email + FAC ID) ─────────────────────────────────────
  { username: 'kumar.cse@vsb.edu.in',         password: 'FAC001',   role: 'faculty', name: 'Dr. Kumar R',       department: 'cse',   email: 'kumar.cse@vsb.edu.in' },
  { username: 'pradeep.it@vsb.edu.in',        password: 'FAC002',   role: 'faculty', name: 'Prof. Pradeep K',   department: 'it',    email: 'pradeep.it@vsb.edu.in' },
  { username: 'meena.ece@vsb.edu.in',         password: 'FAC003',   role: 'faculty', name: 'Dr. Meena S',       department: 'ece',   email: 'meena.ece@vsb.edu.in' },

  // ── HOD (dept-locked login) ───────────────────────────────────────
  { username: 'hod.cse@vsb.edu.in',           password: 'HOD001',   role: 'hod',     name: 'Dr. Rajesh K (HOD CSE)', department: 'cse', email: 'hod.cse@vsb.edu.in' },
  { username: 'hod.it@vsb.edu.in',            password: 'HOD002',   role: 'hod',     name: 'Dr. Anitha M (HOD IT)',  department: 'it',  email: 'hod.it@vsb.edu.in' },
  { username: 'hod.ece@vsb.edu.in',           password: 'HOD003',   role: 'hod',     name: 'Dr. Senthil P (HOD ECE)',department: 'ece', email: 'hod.ece@vsb.edu.in' },

  // ── ADMIN ────────────────────────────────────────────────────────
  { username: 'admin@vsb.edu.in',             password: 'Admin@2024', role: 'admin',   name: 'System Admin',    department: null,    email: 'admin@vsb.edu.in' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'college_db' });
    console.log('✅ Connected to MongoDB → college_db');

    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    for (const u of users) {
      await User.create(u);
      console.log(`   ✓ ${u.role.padEnd(8)} — ${u.username}`);
    }

    console.log(`\n✅ Seeded ${users.length} users across all roles.`);
    console.log('\n📋 Login Credentials:');
    console.log('─'.repeat(55));
    console.log('STUDENT   | adhinarayanan.stm@gmail.com  | 23CS001');
    console.log('STUDENT   | adhinarayanan.s@vsb.edu.in   | 23CS001');
    console.log('FACULTY   | kumar.cse@vsb.edu.in         | FAC001');
    console.log('HOD(CSE)  | hod.cse@vsb.edu.in           | HOD001');
    console.log('HOD(IT)   | hod.it@vsb.edu.in            | HOD002');
    console.log('ADMIN     | admin@vsb.edu.in              | Admin@2024');
    console.log('─'.repeat(55));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

seed();
