const express = require('express');
const User    = require('../models/userModel');
const jwt     = require('jsonwebtoken');

const router = express.Router();

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'vsb_secret_2024', { expiresIn: '30d' });
};

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

    console.log(`🔐 Login attempt: ${username}`);

    // Find user by username (email) OR studentId (register number as username)
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase().trim() },
        { studentId: username.trim() }
      ]
    });

    if (!user) {
      console.log(`❌ User not found: ${username}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`❌ Wrong password for: ${username}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    console.log(`✅ Login success: ${username} (${user.role}) dept: ${user.department || 'all'}`);

    const tokenPayload = {
      id:         user._id,
      role:       user.role,
      department: user.department || null,
    };

    res.json({
      _id:        user._id,
      username:   user.username,
      name:       user.name,
      role:       user.role,
      department: user.department || null,
      studentId:  user.studentId  || null,
      email:      user.email      || user.username,
      token:      generateToken(tokenPayload),
    });

  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ message: 'Server error during authentication' });
  }
});

// @route   POST /api/auth/register  (admin use only)
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role, department, studentId, email } = req.body;
    const userExists = await User.findOne({ username: username.toLowerCase() });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ username, password, name, role, department, studentId, email });
    res.status(201).json({
      _id:      user._id,
      name:     user.name,
      username: user.username,
      role:     user.role,
      token:    generateToken({ id: user._id, role: user.role, department: user.department }),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
