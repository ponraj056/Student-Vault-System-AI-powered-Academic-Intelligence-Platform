/**
 * server/scripts/seedStaff.js  (v3 — PRD-compliant)
 * -----------------------------------------------------
 * Creates sample staff for CSE, IT, ECE departments.
 * Role enum: staff, hod, admin (NOT "faculty").
 * No password for staff/hod — they use OTP.
 *
 * Usage: node scripts/seedStaff.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Staff    = require('../models/Staff');

const staffMembers = [
  // CSE Department
  { employeeId: 'FAC001', name: 'Dr. Ramesh Kumar',    email: 'ramesh@vsb.edu',    department: 'CSE', role: 'hod',   subject: 'Software Engineering', phone: '+919876543001' },
  { employeeId: 'FAC002', name: 'Prof. Meena Devi',    email: 'meena@vsb.edu',     department: 'CSE', role: 'staff', subject: 'Data Structures',      phone: '+919876543002' },
  { employeeId: 'FAC003', name: 'Prof. Ravi Shankar',  email: 'ravi@vsb.edu',      department: 'CSE', role: 'staff', subject: 'Database Management',  phone: '+919876543003' },

  // IT Department
  { employeeId: 'FAC004', name: 'Dr. Priya Nair',      email: 'priya@vsb.edu',     department: 'IT',  role: 'hod',   subject: 'Computer Networks',    phone: '+919876543004' },
  { employeeId: 'FAC005', name: 'Prof. Suresh Babu',   email: 'suresh@vsb.edu',    department: 'IT',  role: 'staff', subject: 'Web Technologies',     phone: '+919876543005' },

  // ECE Department
  { employeeId: 'FAC006', name: 'Dr. Arun Prakash',    email: 'arun@vsb.edu',      department: 'ECE', role: 'hod',   subject: 'Digital Electronics',  phone: '+919876543006' },
  { employeeId: 'FAC007', name: 'Prof. Lakshmi Devi',  email: 'lakshmi@vsb.edu',   department: 'ECE', role: 'staff', subject: 'Signal Processing',    phone: '+919876543007' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  for (const s of staffMembers) {
    const existing = await Staff.findOne({ employeeId: s.employeeId });
    if (existing) {
      // Update role and other fields
      await Staff.updateOne({ employeeId: s.employeeId }, {
        ...s,
        isActive: true,
      });
      console.log(`  ♻️  ${s.employeeId} updated — ${s.name} (${s.role})`);
    } else {
      await Staff.create({ ...s, isActive: true });
      console.log(`  ✅ Created: ${s.name} (${s.employeeId}) — ${s.role}, ${s.department}`);
    }
  }

  console.log('\n🎉 Staff seeding complete!');
  console.log('\n── Staff Login Credentials (OTP-based) ──');
  console.log('   Staff login is via Employee ID + OTP to registered email.');
  console.log('   In DEV mode, OTP is printed to server console.\n');
  staffMembers.forEach(s => {
    console.log(`   ${s.role.toUpperCase().padEnd(5)} : ${s.employeeId} → ${s.email} (${s.department})`);
  });
  console.log('');

  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
