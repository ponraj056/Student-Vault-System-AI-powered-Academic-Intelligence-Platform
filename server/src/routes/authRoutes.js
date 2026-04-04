const express = require('express');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '30d' });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔐 Login attempt: ${username}`);
  const user = await User.findOne({ 
    $or: [
       { username: username }, // Email or Username
       { studentId: username }  // Register Number
    ]
  });

  if (user && (await user.comparePassword(password))) {
    console.log(`✅ Login success: ${username} (${user.role})`);
    res.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password, name, role, department, studentId } = req.body;

  const userExists = await User.findOne({ username });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ username, password, name, role, department, studentId });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

module.exports = router;
