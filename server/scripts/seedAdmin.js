/**
 * server/scripts/seedAdmin.js
 * -----------------------------
 * Creates the initial admin account.
 * Usage: node scripts/seedAdmin.js
 *
 * Admin login: admin@vsb.edu / Admin@1234
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Staff    = require('../models/Staff');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const adminEmail = 'admin@vsb.edu';
  const existing = await Staff.findOne({ email: adminEmail });

  if (existing) {
    console.log('⏭  Admin account already exists — updating password hash.');
    existing.passwordHash = await bcrypt.hash('Admin@1234', 12);
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    console.log('✅ Admin password updated.');
  } else {
    const passwordHash = await bcrypt.hash('Admin@1234', 12);
    await Staff.create({
      employeeId: 'ADM001',
      name: 'System Administrator',
      email: adminEmail,
      department: 'Administration',
      role: 'admin',
      passwordHash,
      isActive: true,
      phone: '+919876543000',
    });
    console.log('✅ Admin account created!');
  }

  console.log('\n🔐 Admin Login Credentials:');
  console.log('   Email:    admin@vsb.edu');
  console.log('   Password: Admin@1234');
  console.log('   (No OTP required — direct email + password login)\n');

  await mongoose.disconnect();
}

seedAdmin().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
