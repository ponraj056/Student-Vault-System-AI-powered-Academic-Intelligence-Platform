/**
 * server/middleware/auth.js  (v3 — PRD-compliant)
 * --------------------------------------------------
 * JWT authentication + role-based + department-scoped + student-scoped guards.
 *
 * Exports:
 *   authenticate         — verify JWT from Bearer header or cookie
 *   requireRole(...roles) — check req.user.role is in allowed list
 *   requireSameDept      — staff/hod can only access their own department
 *   requireSameStudent   — student can only access their own data
 */
const jwt = require('jsonwebtoken');

/**
 * Verify JWT from Authorization header (Bearer) or sv_token cookie.
 */
const authenticate = (req, res, next) => {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Fallback: check cookie
  if (!token && req.cookies?.sv_token) {
    token = req.cookies.sv_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.', code: 'UNAUTHORIZED' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.', code: 'UNAUTHORIZED' });
  }
};

/**
 * Require specific roles.
 * Usage: requireRole('staff', 'hod', 'admin')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions.', code: 'FORBIDDEN' });
    }
    next();
  };
};

/**
 * Ensure staff/hod can only see students from their own department.
 * Admin bypasses this check entirely.
 * Expects req.user.department to be set from JWT.
 */
const requireSameDept = (req, res, next) => {
  if (req.user.role === 'admin') return next(); // admin sees everything

  const userDept = req.user.department;
  if (!userDept) {
    return res.status(403).json({ success: false, error: 'No department assigned.', code: 'FORBIDDEN' });
  }

  // Inject department filter for downstream queries
  req.deptFilter = userDept;
  next();
};

/**
 * Ensure student can only see their own data.
 * Checks req.params.regNo or req.params.rollNo against JWT regNo.
 */
const requireSameStudent = (req, res, next) => {
  if (['staff', 'hod', 'admin'].includes(req.user.role)) return next();

  const paramRegNo = (req.params.regNo || req.params.rollNo || '').toUpperCase();
  if (paramRegNo && paramRegNo !== req.user.regNo) {
    return res.status(403).json({ success: false, error: 'You can only view your own data.', code: 'FORBIDDEN' });
  }
  next();
};

// Legacy export name for backward compat
const authorize = requireRole;

module.exports = { authenticate, authorize, requireRole, requireSameDept, requireSameStudent };
