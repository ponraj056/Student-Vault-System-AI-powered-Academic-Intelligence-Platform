/**
 * server/routes/auth.js  (v3 — PRD-compliant)
 * -----------------------------------------------
 * NO registration endpoints. All users pre-exist.
 *
 * POST /api/auth/detect-role         → detect user type by ID
 * POST /api/auth/student/send-otp    → send OTP to student email
 * POST /api/auth/student/verify-otp  → verify student OTP + issue JWT
 * POST /api/auth/staff/send-otp      → send OTP to staff email
 * POST /api/auth/staff/verify-otp    → verify staff OTP + issue JWT
 * POST /api/auth/admin/login         → email + password login (no OTP)
 * POST /api/auth/logout              → clear JWT cookie
 */
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Student = require('../models/Student');
const Staff   = require('../models/Staff');
const { requestEmailOTP, verifyOTP } = require('../services/otp');
const { limitOtpRequests } = require('../middleware/rateLimiter');
const { logAudit } = require('../services/auditService');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
}

function maskEmail(email) {
  if (!email) return '***';
  return email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
}

// ─── DETECT ROLE ───────────────────────────────────────────────────────────────
// Looks up the ID in both Student and Staff collections to detect role.
router.post('/detect-role', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || !id.trim()) {
      return res.status(400).json({ success: false, error: 'Please enter your ID.', code: 'VALIDATION_ERROR' });
    }

    const trimmed = id.trim();

    // Check if it looks like an email (admin login)
    if (trimmed.includes('@')) {
      const admin = await Staff.findOne({ email: trimmed.toLowerCase(), role: 'admin', isActive: true });
      if (admin) {
        return res.json({ success: true, role: 'admin', name: admin.name, maskedEmail: maskEmail(admin.email) });
      }
      return res.status(404).json({ success: false, error: 'No admin account found with this email.', code: 'NOT_FOUND' });
    }

    const upper = trimmed.toUpperCase();

    // Check student
    const student = await Student.findOne({ regNo: upper, isActive: true });
    if (student) {
      return res.json({ success: true, role: 'student', name: student.name, maskedEmail: maskEmail(student.email) });
    }

    // Check staff/hod
    const staff = await Staff.findOne({ employeeId: upper, isActive: true });
    if (staff) {
      return res.json({ success: true, role: staff.role, name: staff.name, maskedEmail: maskEmail(staff.email) });
    }

    return res.status(404).json({ success: false, error: 'ID not found. Please check and try again.', code: 'NOT_FOUND' });
  } catch (err) {
    console.error('[Auth] detect-role:', err.message);
    res.status(500).json({ success: false, error: 'Server error.', code: 'INTERNAL_ERROR' });
  }
});

// ─── STUDENT: SEND OTP ─────────────────────────────────────────────────────────
router.post('/student/send-otp', limitOtpRequests, async (req, res) => {
  try {
    const regNo = (req.body.regNo || req.body.registerId || '').trim().toUpperCase();
    if (!regNo) return res.status(400).json({ success: false, error: 'Register number is required.', code: 'VALIDATION_ERROR' });

    const student = await Student.findOne({ regNo, isActive: true });
    if (!student) return res.status(404).json({ success: false, error: 'Student not registered.', code: 'NOT_FOUND' });
    if (!student.email) return res.status(400).json({ success: false, error: 'No email on record. Contact admin.', code: 'VALIDATION_ERROR' });

    await requestEmailOTP(student.email, student.name, 'login');

    res.json({ success: true, maskedEmail: maskEmail(student.email), name: student.name, message: 'OTP sent' });
  } catch (err) {
    console.error('[Auth] student send-otp:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send OTP. Check email config.', code: 'INTERNAL_ERROR' });
  }
});

// ─── STUDENT: VERIFY OTP ──────────────────────────────────────────────────────
router.post('/student/verify-otp', async (req, res) => {
  try {
    const regNo = (req.body.regNo || req.body.registerId || '').trim().toUpperCase();
    const otp = req.body.otp;
    if (!regNo || !otp) return res.status(400).json({ success: false, error: 'Register number and OTP are required.', code: 'VALIDATION_ERROR' });

    const student = await Student.findOne({ regNo, isActive: true });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found.', code: 'NOT_FOUND' });

    const result = await verifyOTP(student.email, otp, 'login');
    if (!result.valid) {
      const code = result.reason.includes('expired') ? 'OTP_EXPIRED' : 'OTP_INVALID';
      return res.status(401).json({ success: false, error: result.reason, code });
    }

    const token = signToken({
      userId: student._id,
      regNo: student.regNo,
      rollNo: student.regNo,
      role: 'student',
      name: student.name,
      department: student.department,
      portal: 'student',
    });

    await logAudit('LOGIN', student.regNo, 'student', student.regNo, { method: 'OTP' });

    res.json({
      success: true,
      token,
      redirect: '/student/dashboard',
      user: {
        id: student._id, name: student.name, regNo: student.regNo, role: 'student',
        department: student.department, email: student.email,
        profilePhoto: student.profilePhoto || null, portal: 'student',
      },
    });
  } catch (err) {
    console.error('[Auth] student verify-otp:', err.message);
    res.status(500).json({ success: false, error: 'Verification failed.', code: 'INTERNAL_ERROR' });
  }
});

// ─── STAFF: SEND OTP ──────────────────────────────────────────────────────────
router.post('/staff/send-otp', limitOtpRequests, async (req, res) => {
  try {
    const employeeId = (req.body.employeeId || req.body.facultyId || '').trim().toUpperCase();
    if (!employeeId) return res.status(400).json({ success: false, error: 'Employee ID is required.', code: 'VALIDATION_ERROR' });

    const staff = await Staff.findOne({ employeeId, role: { $in: ['staff', 'hod'] }, isActive: true });
    if (!staff) return res.status(404).json({ success: false, error: 'No staff found with this ID.', code: 'NOT_FOUND' });
    if (!staff.email) return res.status(400).json({ success: false, error: 'No email on record. Contact admin.', code: 'VALIDATION_ERROR' });

    await requestEmailOTP(staff.email, staff.name, 'login');
    res.json({ success: true, maskedEmail: maskEmail(staff.email), name: staff.name, message: 'OTP sent' });
  } catch (err) {
    console.error('[Auth] staff send-otp:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send OTP.', code: 'INTERNAL_ERROR' });
  }
});

// ─── STAFF: VERIFY OTP ────────────────────────────────────────────────────────
router.post('/staff/verify-otp', async (req, res) => {
  try {
    const employeeId = (req.body.employeeId || req.body.facultyId || '').trim().toUpperCase();
    const otp = req.body.otp;
    if (!employeeId || !otp) return res.status(400).json({ success: false, error: 'Employee ID and OTP are required.', code: 'VALIDATION_ERROR' });

    const staff = await Staff.findOne({ employeeId, role: { $in: ['staff', 'hod'] }, isActive: true });
    if (!staff) return res.status(404).json({ success: false, error: 'Staff not found.', code: 'NOT_FOUND' });

    const result = await verifyOTP(staff.email, otp, 'login');
    if (!result.valid) {
      const code = result.reason.includes('expired') ? 'OTP_EXPIRED' : 'OTP_INVALID';
      return res.status(401).json({ success: false, error: result.reason, code });
    }

    // Update last login
    await Staff.findByIdAndUpdate(staff._id, { lastLogin: new Date() });

    const token = signToken({
      userId: staff._id,
      employeeId: staff.employeeId,
      role: staff.role,
      name: staff.name,
      department: staff.department,
      portal: 'staff',
    });

    await logAudit('LOGIN', staff.employeeId, staff.role, null, { method: 'OTP' });

    res.json({
      success: true,
      token,
      redirect: '/staff/dashboard',
      user: {
        id: staff._id, name: staff.name, employeeId: staff.employeeId,
        role: staff.role, department: staff.department, portal: 'staff',
      },
    });
  } catch (err) {
    console.error('[Auth] staff verify-otp:', err.message);
    res.status(500).json({ success: false, error: 'Verification failed.', code: 'INTERNAL_ERROR' });
  }
});

// ─── ADMIN LOGIN (Email + Password, NO OTP) ──────────────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.', code: 'VALIDATION_ERROR' });
    }

    const admin = await Staff.findOne({ email: email.toLowerCase(), role: 'admin', isActive: true });
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin account not found.', code: 'NOT_FOUND' });
    }

    if (!admin.passwordHash) {
      return res.status(401).json({ success: false, error: 'Password not configured. Contact system administrator.', code: 'UNAUTHORIZED' });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid password.', code: 'UNAUTHORIZED' });
    }

    // Update last login
    await Staff.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

    const token = signToken({
      userId: admin._id,
      employeeId: admin.employeeId,
      role: 'admin',
      name: admin.name,
      department: admin.department,
      portal: 'admin',
    });

    await logAudit('LOGIN', admin.email, 'admin', null, { method: 'password' });

    res.json({
      success: true,
      token,
      redirect: '/admin/dashboard',
      user: {
        id: admin._id, name: admin.name, email: admin.email,
        employeeId: admin.employeeId, role: 'admin',
        department: admin.department, portal: 'admin',
      },
    });
  } catch (err) {
    console.error('[Auth] admin login:', err.message);
    res.status(500).json({ success: false, error: 'Login failed.', code: 'INTERNAL_ERROR' });
  }
});

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('sv_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
