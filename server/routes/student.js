/**
 * server/routes/student.js  (v3 — PRD-compliant)
 * --------------------------------------------------
 * Student's own data endpoints. Enforces student-only access.
 * Student can ONLY see their own data (matched by JWT regNo).
 *
 * GET  /api/student/profile         → own profile
 * GET  /api/student/results         → own results
 * GET  /api/student/attendance      → own attendance
 * GET  /api/student/all             → all own data in one call
 * POST /api/student/upload-photo    → upload profile photo
 * GET  /api/student/update-requests → own pending requests
 * POST /api/student/chatbot         → AI chatbot (student-scoped)
 */
const express    = require('express');
const router     = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const Student    = require('../models/Student');
const Attendance = require('../models/Attendance');
const Result     = require('../models/Result');
const Internship = require('../models/Internship');
const UpdateRequest = require('../models/UpdateRequest');
const { uploadPhoto, cloudinary, CLOUDINARY_ENABLED } = require('../middleware/upload');
const { logAudit } = require('../services/auditService');

// All student routes require student role
const studentOnly = [authenticate, requireRole('student')];

// Helper: get student doc by regNo from JWT
async function getOwnStudent(regNo) {
  const student = await Student.findOne({ regNo }).lean();
  if (!student) throw new Error('Student not found');
  return student;
}

// GET /api/student/profile
router.get('/profile', studentOnly, async (req, res) => {
  try {
    const student = await Student.findOne({ regNo: req.user.regNo }).select('-__v').lean();
    if (!student) return res.status(404).json({ success: false, error: 'Student not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: student });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /api/student/results
router.get('/results', studentOnly, async (req, res) => {
  try {
    const s = await getOwnStudent(req.user.regNo);
    const records = await Result.find({ studentId: s._id }).sort({ semester: -1 }).lean();
    res.json({ success: true, data: records, count: records.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /api/student/attendance
router.get('/attendance', studentOnly, async (req, res) => {
  try {
    const s = await getOwnStudent(req.user.regNo);
    const records = await Attendance.find({ studentId: s._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: records, count: records.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /api/student/internships
router.get('/internships', studentOnly, async (req, res) => {
  try {
    const s = await getOwnStudent(req.user.regNo);
    const records = await Internship.find({ studentId: s._id }).sort({ startDate: -1 }).lean();
    res.json({ success: true, data: records, count: records.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /api/student/all — full dashboard data in one request
router.get('/all', studentOnly, async (req, res) => {
  try {
    const s = await getOwnStudent(req.user.regNo);
    const [attendance, results, internships] = await Promise.all([
      Attendance.find({ studentId: s._id }).lean(),
      Result.find({ studentId: s._id }).sort({ semester: -1 }).lean(),
      Internship.find({ studentId: s._id }).sort({ startDate: -1 }).lean(),
    ]);
    res.json({ success: true, data: { student: s, attendance, results, internships } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// POST /api/student/upload-photo
router.post('/upload-photo', studentOnly, uploadPhoto.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image file provided.', code: 'VALIDATION_ERROR' });

    // Resolve public URL: Cloudinary gives `req.file.path` as CDN URL; local gives absolute path
    let photoUrl, photoId;
    if (CLOUDINARY_ENABLED) {
      photoUrl = req.file.path;      // Cloudinary CDN URL
      photoId  = req.file.filename;  // Cloudinary public_id
    } else {
      // Convert absolute path → /uploads/photos/filename
      const filename = require('path').basename(req.file.path);
      photoUrl = `/uploads/photos/${filename}`;
      photoId  = null;
    }

    // Delete old Cloudinary photo if exists
    if (CLOUDINARY_ENABLED) {
      const existing = await Student.findOne({ regNo: req.user.regNo });
      if (existing?.profilePhotoId) {
        try { await cloudinary.uploader.destroy(existing.profilePhotoId); } catch {}
      }
    }

    const student = await Student.findOneAndUpdate(
      { regNo: req.user.regNo },
      { profilePhoto: photoUrl, profilePhotoId: photoId },
      { new: true }
    ).select('-__v');

    await logAudit('UPLOAD_PHOTO', req.user.regNo, 'student', req.user.regNo, { photoUrl: student.profilePhoto });

    res.json({ success: true, data: { profilePhoto: student.profilePhoto } });
  } catch (err) {
    console.error('[Upload Photo]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/student/update-requests — own pending requests
router.get('/update-requests', studentOnly, async (req, res) => {
  try {
    const requests = await UpdateRequest.find({ rollNo: req.user.regNo })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: requests, count: requests.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// POST /api/student/chatbot — AI chatbot (student-scoped)
router.post('/chatbot', studentOnly, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.', code: 'VALIDATION_ERROR' });
    }

    const { queryGroq } = require('../services/campusIQ');
    const result = await queryGroq(message.trim(), {
      role: 'student',
      dept: req.user.department,
      rollNo: req.user.regNo,
    });

    // Persist to chat history
    const Chat = require('../models/Chat');
    await Chat.create({
      regNo: req.user.regNo,
      channel: 'dashboard',
      message: message.trim(),
      reply: typeof result === 'string' ? result : result.reply,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Student Chatbot]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
