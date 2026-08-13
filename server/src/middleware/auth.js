const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Authentication is required.' });

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const user = await User.findById(id).select('-password').lean();
    if (!user) return res.status(401).json({ error: 'User account no longer exists.' });
    req.user = user;
    next();
  } catch (_) {
    res.status(401).json({ error: 'Your session is invalid or has expired.' });
  }
}

function isStudent(req) {
  return req.user?.role === 'student';
}

function isAdmin(req) {
  return ['admin', 'hod'].includes(req.user?.role);
}

module.exports = { requireAuth, isStudent, isAdmin };
