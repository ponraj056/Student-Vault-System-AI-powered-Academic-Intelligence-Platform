require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

const users = [
  {
    username: 'cs001',
    password: 'password123',
    role: 'student',
    name: 'Arjun Sharma',
    studentId: 'CS001',
    department: 'cse'
  },
  {
    username: 'faculty',
    password: 'password123',
    role: 'faculty',
    name: 'Faculty User',
    department: 'cse'
  },
  {
    username: 'hod',
    password: 'password123',
    role: 'hod',
    name: 'HOD User',
    department: 'cse'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'college_db' });
    console.log('Connected to MongoDB → college_db');

    await User.deleteMany({});
    
    // Using for...of to handle async password hashing in pre-save hook
    for (const u of users) {
      await User.create(u);
    }

    console.log(`✅ Seeded ${users.length} users with roles.`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

seed();
