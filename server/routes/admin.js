/**
 * server/routes/admin.js  (v3 — PRD-compliant)
 * ------------------------------------------------
 * Admin super-routes — ALL departments, staff management, audit logs.
 * No department restriction.
 *
 * GET  /api/admin/dashboard       → system-wide stats
 * GET  /api/admin/students        → search across ALL depts
 * GET  /api/admin/students/:regNo → full student profile
 * GET  /api/admin/departments     → list dept codes + counts
 * POST /api/admin/upload-excel    → cross-dept excel import
 * GET  /api/admin/staff           → list all staff
 * POST /api/admin/staff           → create new staff account
 * PUT  /api/admin/staff/:id       → update staff
 * GET  /api/admin/update-requests → all pending requests
 * POST /api/admin/update-requests/:id/approve
 * POST /api/admin/update-requests/:id/reject
 * GET  /api/admin/audit-logs      → full audit trail
 * DELETE /api/admin/students/:regNo → delete student
 */
const express    = require('express');
const router     = express.Router();
const bcrypt     = require('bcryptjs');
const { authenticate, requireRole } = require('../middleware/auth');
const { uploadExcel } = require('../middleware/upload');
const Student    = require('../models/Student');
const Staff      = require('../models/Staff');
const Attendance = require('../models/Attendance');
const Result     = require('../models/Result');
const Internship = require('../models/Internship');
const UpdateRequest = require('../models/UpdateRequest');
const AuditLog   = require('../models/AuditLog');
const { parseAndImport } = require('../services/excelImportService');
const { logAudit } = require('../services/auditService');

const adminOnly = [authenticate, requireRole('admin')];

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
router.get('/dashboard', adminOnly, async (req, res) => {
  try {
    const [students, staffList, allResults, pendingRequests] = await Promise.all([
      Student.find({}).lean(),
      Staff.find({}).select('-passwordHash').lean(),
      Result.find({}).lean(),
      UpdateRequest.find({ status: 'pending' }).lean(),
    ]);

    // Department breakdown
    const deptMap = {};
    students.forEach(s => {
      if (!deptMap[s.department]) deptMap[s.department] = 0;
      deptMap[s.department]++;
    });

    // Arrears count
    const studentArrears = {};
    allResults.forEach(r => {
      if (r.grade === 'U') {
        const sid = r.studentId.toString();
        studentArrears[sid] = (studentArrears[sid] || 0) + 1;
      }
    });

    // Pass rate
    const passResults = allResults.filter(r => r.grade !== 'U').length;
    const passRate = allResults.length > 0 ? Math.round((passResults / allResults.length) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalStudents: students.length,
        totalStaff: staffList.length,
        totalResults: allResults.length,
        arrearsCount: Object.keys(studentArrears).length,
        passRate,
        pendingRequests: pendingRequests.length,
        departments: Object.entries(deptMap).map(([dept, count]) => ({ dept, count })),
        staffList: staffList.map(s => ({
          _id: s._id, name: s.name, employeeId: s.employeeId,
          department: s.department, role: s.role, email: s.email,
          isActive: s.isActive, lastLogin: s.lastLogin,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── SEARCH STUDENTS (all depts) ────────────────────────────────────────────
router.get('/students', adminOnly, async (req, res) => {
  try {
    const { search, dept, page = 1, limit = 20 } = req.query;
    const query = {};
    if (dept) query.department = { $regex: dept, $options: 'i' };
    if (search && search.trim()) {
      const s = search.trim();
      if (/^\d/.test(s)) {
        query.regNo = { $regex: `^${s}`, $options: 'i' };
      } else {
        query.$or = [
          { name: { $regex: s, $options: 'i' } },
          { regNo: { $regex: s, $options: 'i' } },
        ];
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const students = await Student.find(query)
      .select('-__v')
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Student.countDocuments(query);
    res.json({ success: true, data: students, count: total, page: Number(page), limit: Number(limit) });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── SINGLE STUDENT PROFILE ────────────────────────────────────────────────
router.get('/students/:regNo', adminOnly, async (req, res) => {
  try {
    const student = await Student.findOne({ regNo: req.params.regNo.toUpperCase() }).select('-__v').lean();
    if (!student) return res.status(404).json({ success: false, error: 'Student not found.', code: 'NOT_FOUND' });

    const [attendance, results, internships] = await Promise.all([
      Attendance.find({ studentId: student._id }).lean(),
      Result.find({ studentId: student._id }).sort({ semester: -1 }).lean(),
      Internship.find({ studentId: student._id }).sort({ startDate: -1 }).lean(),
    ]);

    res.json({ success: true, data: { student, attendance, results, internships } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── DELETE STUDENT ─────────────────────────────────────────────────────────
router.delete('/students/:regNo', adminOnly, async (req, res) => {
  try {
    const student = await Student.findOne({ regNo: req.params.regNo.toUpperCase() });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found.', code: 'NOT_FOUND' });

    await Promise.all([
      Student.deleteOne({ _id: student._id }),
      Attendance.deleteMany({ studentId: student._id }),
      Result.deleteMany({ studentId: student._id }),
      Internship.deleteMany({ studentId: student._id }),
    ]);

    await logAudit('DELETE_STUDENT', req.user.employeeId || req.user.email, 'admin', student.regNo, { name: student.name });
    res.json({ success: true, message: 'Student and all related data deleted.' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── DEPARTMENTS LIST ──────────────────────────────────────────────────────
router.get('/departments', adminOnly, async (req, res) => {
  try {
    const depts = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data: depts.map(d => ({ dept: d._id, count: d.count })) });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── EXCEL IMPORT (cross-dept) ──────────────────────────────────────────────
router.post('/upload-excel', adminOnly, uploadExcel.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.', code: 'VALIDATION_ERROR' });

    const dept = req.body.dept || req.body.department;
    if (!dept) return res.status(400).json({ success: false, error: 'Department is required for admin upload.', code: 'VALIDATION_ERROR' });

    const result = await parseAndImport(req.file.buffer, dept);
    await logAudit('ADMIN_UPLOAD_EXCEL', req.user.employeeId || 'admin', 'admin', null, { department: dept, ...result });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── STAFF MANAGEMENT ──────────────────────────────────────────────────────
router.get('/staff', adminOnly, async (req, res) => {
  try {
    const staff = await Staff.find({}).select('-passwordHash').sort({ name: 1 }).lean();
    res.json({ success: true, data: staff, count: staff.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/staff', adminOnly, async (req, res) => {
  try {
    const { employeeId, name, email, department, role, phone, subject } = req.body;
    if (!employeeId || !name || !email || !department) {
      return res.status(400).json({ success: false, error: 'employeeId, name, email, and department are required.', code: 'VALIDATION_ERROR' });
    }

    const existing = await Staff.findOne({ $or: [{ email: email.toLowerCase() }, { employeeId: employeeId.toUpperCase() }] });
    if (existing) return res.status(409).json({ success: false, error: 'Staff with this email or ID already exists.' });

    const staff = await Staff.create({
      employeeId: employeeId.toUpperCase(),
      name,
      email: email.toLowerCase(),
      department,
      role: role || 'staff',
      phone,
      subject,
      isActive: true,
    });

    await logAudit('CREATE_STAFF', req.user.employeeId || 'admin', 'admin', null, { employeeId, name, department, role });

    res.status(201).json({ success: true, data: staff, message: 'Staff account created.' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put('/staff/:id', adminOnly, async (req, res) => {
  try {
    const { name, email, department, role, phone, subject, isActive } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email.toLowerCase();
    if (department !== undefined) updates.department = department;
    if (role !== undefined) updates.role = role;
    if (phone !== undefined) updates.phone = phone;
    if (subject !== undefined) updates.subject = subject;
    if (isActive !== undefined) updates.isActive = isActive;

    const staff = await Staff.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    if (!staff) return res.status(404).json({ success: false, error: 'Staff not found.', code: 'NOT_FOUND' });

    await logAudit('UPDATE_STAFF', req.user.employeeId || 'admin', 'admin', null, { staffId: staff.employeeId, updates });

    res.json({ success: true, data: staff });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Legacy endpoint
router.patch('/staff/:id/status', adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    const staff = await Staff.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-passwordHash');
    res.json({ success: true, data: staff });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── UPDATE REQUESTS (all depts) ────────────────────────────────────────────
router.get('/update-requests', adminOnly, async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const requests = await UpdateRequest.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: requests, count: requests.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/update-requests/:id/approve', adminOnly, async (req, res) => {
  try {
    const request = await UpdateRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, error: 'Already processed.' });

    await Student.findOneAndUpdate({ regNo: request.rollNo }, { [request.field]: request.newValue });
    request.status = 'approved';
    request.approvedBy = req.user.employeeId || req.user.email;
    request.reviewedAt = new Date();
    await request.save();

    await logAudit('APPROVE_UPDATE_REQUEST', req.user.employeeId || 'admin', 'admin', request.rollNo, {
      field: request.field, oldValue: request.oldValue, newValue: request.newValue
    });

    res.json({ success: true, data: request });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/update-requests/:id/reject', adminOnly, async (req, res) => {
  try {
    const request = await UpdateRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: 'Request not found.' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, error: 'Already processed.' });

    request.status = 'rejected';
    request.rejectedBy = req.user.employeeId || req.user.email;
    request.reviewedAt = new Date();
    await request.save();

    res.json({ success: true, data: request });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── CSV EXPORT ─────────────────────────────────────────────────────────────
router.get('/export-csv', adminOnly, async (req, res) => {
  try {
    const { dept } = req.query;
    const query = dept ? { department: { $regex: dept, $options: 'i' } } : {};
    const students = await Student.find(query).select('-__v -profilePhoto -profilePhotoId -passwordHash').sort({ department: 1, name: 1 }).lean();

    const studentIds = students.map(s => s._id);
    const [allAttendance, allResults] = await Promise.all([
      Attendance.find({ studentId: { $in: studentIds } }).lean(),
      Result.find({ studentId: { $in: studentIds } }).lean(),
    ]);

    // Group by studentId
    const attMap = {};
    allAttendance.forEach(a => {
      const id = a.studentId.toString();
      if (!attMap[id]) attMap[id] = [];
      attMap[id].push(a.percentage);
    });
    const resultMap = {};
    allResults.forEach(r => {
      const id = r.studentId.toString();
      if (!resultMap[id]) resultMap[id] = [];
      resultMap[id].push(r);
    });

    // Build CSV
    const headers = ['Reg No','Name','Department','Section','Year','Semester','Batch','CGPA','Avg Attendance (%)','Arrears','Email','Phone','Blood Group'];
    const rows = students.map(s => {
      const id = s._id.toString();
      const recs = attMap[id] || [];
      const results = resultMap[id] || [];
      const avgAtt = recs.length ? Math.round(recs.reduce((a, b) => a + b, 0) / recs.length) : '';
      const arrears = results.filter(r => r.grade === 'U').length;
      return [
        s.regNo, s.name, s.department, s.section || '', s.year || '', s.semester || '',
        s.batch || '', s.cgpa || '', avgAtt, arrears, s.email, s.phone || '', s.bloodGroup || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\r\n');
    const filename = `studentvault_export_${dept || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;

    await logAudit('EXPORT_CSV', req.user.employeeId || 'admin', 'admin', null, { dept: dept || 'all', count: students.length });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─── AUDIT LOGS ─────────────────────────────────────────────────────────────
router.get('/audit-logs', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const logs = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    const total = await AuditLog.countDocuments();
    res.json({ success: true, data: logs, count: total });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;



