/**
 * server/routes/staff.js  (v3 — PRD-compliant)
 * ------------------------------------------------
 * Staff/HoD portal routes. Department-isolated.
 *
 * GET  /api/staff/dashboard              → dept overview stats
 * GET  /api/staff/students               → search students (own dept only)
 * GET  /api/staff/students/:regNo        → full student profile
 * POST /api/staff/students/:regNo/photo  → upload photo for student
 * POST /api/staff/upload-excel           → bulk import students
 * POST /api/staff/attendance             → add/update attendance
 * POST /api/staff/results                → add/update results
 * GET  /api/staff/update-requests        → pending student requests
 * POST /api/staff/update-requests/:id/approve
 * POST /api/staff/update-requests/:id/reject
 * GET  /api/staff/profile                → own staff profile
 */
const express    = require('express');
const router     = express.Router();
const { authenticate, requireRole, requireSameDept } = require('../middleware/auth');
const { uploadExcel, uploadPhoto, cloudinary, CLOUDINARY_ENABLED } = require('../middleware/upload');
const Student    = require('../models/Student');
const Staff      = require('../models/Staff');
const Attendance = require('../models/Attendance');
const Result     = require('../models/Result');
const Internship = require('../models/Internship');
const UpdateRequest = require('../models/UpdateRequest');
const { parseAndImport } = require('../services/excelImportService');
const { logAudit } = require('../services/auditService');

// Staff/HoD guard with department isolation
const staffOnly = [authenticate, requireRole('staff', 'hod'), requireSameDept];

// ─── DASHBOARD / OVERVIEW ──────────────────────────────────────────────────────
router.get('/dashboard', staffOnly, async (req, res) => {
  try {
    const dept = req.deptFilter;
    const deptQuery = dept ? { department: { $regex: `^${dept}$`, $options: 'i' } } : {};

    const students = await Student.find(deptQuery).lean();
    const studentIds = students.map(s => s._id);

    const [allResults, pendingRequests] = await Promise.all([
      Result.find({ studentId: { $in: studentIds } }).lean(),
      UpdateRequest.find({ department: { $regex: `^${dept}$`, $options: 'i' }, status: 'pending' }).lean(),
    ]);

    // Arrears count (students with grade 'U')
    const studentArrears = {};
    allResults.forEach(r => {
      if (r.grade === 'U') {
        const sid = r.studentId.toString();
        studentArrears[sid] = (studentArrears[sid] || 0) + 1;
      }
    });
    const arrearsCount = Object.keys(studentArrears).length;

    // Pass rate
    const passResults = allResults.filter(r => r.grade !== 'U').length;
    const passRate = allResults.length > 0 ? Math.round((passResults / allResults.length) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalStudents: students.length,
        arrearsCount,
        passRate,
        pendingRequests: pendingRequests.length,
        department: dept,
      },
    });
  } catch (err) {
    console.error('[Staff] Dashboard error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── OVERVIEW (legacy compat) ──────────────────────────────────────────────────
router.get('/overview', staffOnly, async (req, res) => {
  try {
    const dept = req.deptFilter || req.query.department;
    const deptQuery = dept ? { department: { $regex: `^${dept}$`, $options: 'i' } } : {};

    const students = await Student.find(deptQuery).lean();
    const studentIds = students.map(s => s._id);

    const [allAttendance, allResults, allInternships] = await Promise.all([
      Attendance.find({ studentId: { $in: studentIds } }).lean(),
      Result.find({ studentId: { $in: studentIds } }).lean(),
      Internship.find({ studentId: { $in: studentIds } }).lean(),
    ]);

    // Average attendance per subject
    const subjectMap = {};
    allAttendance.forEach(a => {
      if (!subjectMap[a.subject]) subjectMap[a.subject] = { total: 0, count: 0 };
      subjectMap[a.subject].total += a.percentage;
      subjectMap[a.subject].count += 1;
    });
    const subjectAverages = Object.entries(subjectMap).map(([subject, { total, count }]) => ({
      subject, average: Math.round(total / count)
    })).sort((a, b) => b.average - a.average);

    // Students below 75%
    const lowAttendance = [];
    const studentAttMap = {};
    allAttendance.forEach(a => {
      const sid = a.studentId.toString();
      if (!studentAttMap[sid]) studentAttMap[sid] = [];
      studentAttMap[sid].push(a.percentage);
    });
    students.forEach(s => {
      const records = studentAttMap[s._id.toString()] || [];
      if (records.length > 0) {
        const avg = Math.round(records.reduce((sum, p) => sum + p, 0) / records.length);
        if (avg < 75) lowAttendance.push({ name: s.name, regNo: s.regNo, avg });
      }
    });

    const activeInternships = allInternships.filter(i => i.status === 'ongoing').length;

    res.json({
      success: true,
      data: {
        totalStudents: students.length,
        totalSubjects: Object.keys(subjectMap).length,
        subjectAverages,
        lowAttendanceCount: lowAttendance.length,
        lowAttendanceStudents: lowAttendance.slice(0, 10),
        activeInternships,
        totalResults: allResults.length,
      },
    });
  } catch (err) {
    console.error('[Staff] Overview error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── LIST / SEARCH STUDENTS (own dept only) ─────────────────────────────────
router.get('/students', staffOnly, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const dept = req.deptFilter;
    const query = {};

    // Department filter (enforced by middleware)
    if (dept) query.department = { $regex: `^${dept}$`, $options: 'i' };

    // Search logic: if starts with digit → rollNo prefix, else → name regex
    if (search && search.trim()) {
      const s = search.trim();
      if (/^\d/.test(s)) {
        query.regNo = { $regex: `^${s}`, $options: 'i' };
      } else {
        query.name = { $regex: s, $options: 'i' };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const students = await Student.find(query)
      .select('name regNo department section year batch cgpa profilePhoto email phone')
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Student.countDocuments(query);

    res.json({ success: true, data: students, count: total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET SINGLE STUDENT FULL PROFILE ────────────────────────────────────────
router.get('/students/:regNo', staffOnly, async (req, res) => {
  try {
    const student = await Student.findOne({ regNo: req.params.regNo.toUpperCase() }).select('-__v').lean();
    if (!student) return res.status(404).json({ success: false, error: 'Student not found.', code: 'NOT_FOUND' });

    // Department check
    if (req.deptFilter && student.department.toLowerCase() !== req.deptFilter.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Student not in your department.', code: 'STUDENT_NOT_IN_DEPT' });
    }

    const [attendance, results, internships] = await Promise.all([
      Attendance.find({ studentId: student._id }).lean(),
      Result.find({ studentId: student._id }).sort({ semester: -1 }).lean(),
      Internship.find({ studentId: student._id }).sort({ startDate: -1 }).lean(),
    ]);

    res.json({ success: true, data: { student, attendance, results, internships } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── UPLOAD PHOTO FOR STUDENT ──────────────────────────────────────────────
router.post('/students/:regNo/photo', staffOnly, uploadPhoto.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image file provided.', code: 'VALIDATION_ERROR' });

    const regNo = req.params.regNo.toUpperCase();
    const existing = await Student.findOne({ regNo });
    if (!existing) return res.status(404).json({ success: false, error: 'Student not found.', code: 'NOT_FOUND' });

    // Department check
    if (req.deptFilter && existing.department.toLowerCase() !== req.deptFilter.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Student not in your department.', code: 'STUDENT_NOT_IN_DEPT' });
    }

    // Resolve public URL
    let photoUrl, photoId;
    if (CLOUDINARY_ENABLED) {
      // Delete old Cloudinary photo
      if (existing.profilePhotoId) {
        try { await cloudinary.uploader.destroy(existing.profilePhotoId); } catch {}
      }
      photoUrl = req.file.path;
      photoId  = req.file.filename;
    } else {
      const filename = require('path').basename(req.file.path);
      photoUrl = `/uploads/photos/${filename}`;
      photoId  = null;
    }

    const student = await Student.findOneAndUpdate(
      { regNo },
      { profilePhoto: photoUrl, profilePhotoId: photoId },
      { new: true }
    );

    await logAudit('UPLOAD_PHOTO', req.user.employeeId, req.user.role, regNo, { photoUrl: student.profilePhoto });
    res.json({ success: true, data: { profilePhoto: student.profilePhoto } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── EXCEL IMPORT ──────────────────────────────────────────────────────────
router.post('/upload-excel', staffOnly, uploadExcel.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.', code: 'VALIDATION_ERROR' });

    const dept = req.deptFilter || req.user.department;
    const result = await parseAndImport(req.file.buffer, dept);

    await logAudit('UPLOAD_EXCEL', req.user.employeeId, req.user.role, null, {
      department: dept, ...result, filename: req.file.originalname
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Staff] Excel import:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── ADD / UPDATE ATTENDANCE ──────────────────────────────────────────────────
router.post('/attendance', staffOnly, async (req, res) => {
  try {
    const { regNo, subject, percentage, month } = req.body;
    if (!regNo || !subject || percentage === undefined || !month)
      return res.status(400).json({ success: false, error: 'regNo, subject, percentage, and month are required.', code: 'VALIDATION_ERROR' });

    const student = await Student.findOne({ regNo: regNo.toUpperCase() });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found.', code: 'NOT_FOUND' });

    // Department check
    if (req.deptFilter && student.department.toLowerCase() !== req.deptFilter.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Student not in your department.', code: 'STUDENT_NOT_IN_DEPT' });
    }

    const record = await Attendance.findOneAndUpdate(
      { studentId: student._id, subject, month },
      { studentId: student._id, subject, percentage: Number(percentage), month },
      { upsert: true, new: true }
    );

    await logAudit('MARK_ATTENDANCE', req.user.employeeId, req.user.role, regNo.toUpperCase(), { subject, percentage, month });

    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── ADD / UPDATE RESULTS ───────────────────────────────────────────────────
router.post('/results', staffOnly, async (req, res) => {
  try {
    const { regNo, semester, subject, marks, grade } = req.body;
    if (!regNo || !semester || !subject || marks === undefined || !grade)
      return res.status(400).json({ success: false, error: 'All fields are required.', code: 'VALIDATION_ERROR' });

    const student = await Student.findOne({ regNo: regNo.toUpperCase() });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found.', code: 'NOT_FOUND' });

    if (req.deptFilter && student.department.toLowerCase() !== req.deptFilter.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Student not in your department.', code: 'STUDENT_NOT_IN_DEPT' });
    }

    const record = await Result.findOneAndUpdate(
      { studentId: student._id, semester: Number(semester), subject },
      { studentId: student._id, semester: Number(semester), subject, marks: Number(marks), grade },
      { upsert: true, new: true }
    );

    // ── Auto-recalculate CGPA ──────────────────────────────────────────────────
    // Grade-point map (Anna University scale)
    const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'U': 0 };
    const allResults = await Result.find({ studentId: student._id }).lean();
    if (allResults.length > 0) {
      const total = allResults.reduce((sum, r) => sum + (GRADE_POINTS[r.grade] ?? 0), 0);
      const newCgpa = parseFloat((total / allResults.length).toFixed(2));
      await Student.findByIdAndUpdate(student._id, { cgpa: newCgpa });
    }
    // ──────────────────────────────────────────────────────────────────────────

    await logAudit('UPDATE_RESULT', req.user.employeeId, req.user.role, regNo.toUpperCase(), { semester, subject, marks, grade });

    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── INTERNSHIPS ────────────────────────────────────────────────────────────
router.post('/internships', staffOnly, async (req, res) => {
  try {
    const { regNo, company, role, startDate, endDate, status } = req.body;
    if (!regNo || !company || !role || !startDate || !endDate)
      return res.status(400).json({ success: false, error: 'All fields are required.', code: 'VALIDATION_ERROR' });

    const student = await Student.findOne({ regNo: regNo.toUpperCase() });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found.', code: 'NOT_FOUND' });

    if (req.deptFilter && student.department.toLowerCase() !== req.deptFilter.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Student not in your department.', code: 'STUDENT_NOT_IN_DEPT' });
    }

    const record = await Internship.create({
      studentId: student._id, company, role,
      startDate: new Date(startDate), endDate: new Date(endDate),
      status: status || 'ongoing',
    });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/internships/:id', staffOnly, async (req, res) => {
  try {
    const record = await Internship.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: record });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.delete('/attendance/:id', staffOnly, async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── UPDATE REQUESTS (student corrections) ──────────────────────────────────
router.get('/update-requests', staffOnly, async (req, res) => {
  try {
    const dept = req.deptFilter;
    const query = { status: req.query.status || 'pending' };
    if (dept) query.department = { $regex: `^${dept}$`, $options: 'i' };

    const requests = await UpdateRequest.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: requests, count: requests.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/update-requests/:id/approve', staffOnly, async (req, res) => {
  try {
    const request = await UpdateRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.', code: 'NOT_FOUND' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, error: 'Request already processed.' });

    // Apply the change
    await Student.findOneAndUpdate(
      { regNo: request.rollNo },
      { [request.field]: request.newValue }
    );

    // Update request status
    request.status = 'approved';
    request.approvedBy = req.user.employeeId;
    request.reviewedAt = new Date();
    await request.save();

    await logAudit('APPROVE_UPDATE_REQUEST', req.user.employeeId, req.user.role, request.rollNo, {
      field: request.field, oldValue: request.oldValue, newValue: request.newValue
    });

    res.json({ success: true, message: 'Request approved and applied.', data: request });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/update-requests/:id/reject', staffOnly, async (req, res) => {
  try {
    const request = await UpdateRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.', code: 'NOT_FOUND' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, error: 'Request already processed.' });

    request.status = 'rejected';
    request.rejectedBy = req.user.employeeId;
    request.reviewedAt = new Date();
    await request.save();

    await logAudit('REJECT_UPDATE_REQUEST', req.user.employeeId, req.user.role, request.rollNo, {
      field: request.field, reason: req.body.reason || 'No reason given'
    });

    res.json({ success: true, message: 'Request rejected.', data: request });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── STAFF PROFILE ─────────────────────────────────────────────────────────
router.get('/profile', [authenticate, requireRole('staff', 'hod')], async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.userId).select('-passwordHash -__v').lean();
    if (!staff) return res.status(404).json({ success: false, error: 'Staff not found.', code: 'NOT_FOUND' });
    res.json({ success: true, data: staff });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
