/**
 * /api/* — Unified dashboard API
 * Used by the Stitch frontend pages (fetch-based)
 */
const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const { getDeptModels, DEPARTMENTS } = require('../models/deptModels');
const studentService = require('../services/studentService');
const resultService  = require('../services/resultService');
const { parseQuery }  = require('../ai/queryParser');
const { handleAiQuery } = require('../controllers/aiController');
const multer = require('multer');
const xlsx = require('xlsx');

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// GET /api/stats — dashboard summary cards
router.get('/stats', async (req, res) => {
  try {
    const { total, breakdown } = await studentService.getTotalStudentCount();
    const arrears  = await resultService.getStudentsWithArrears();
    const passFail = await resultService.getPassFailStats();
    res.json({
      totalStudents:  total,
      deptBreakdown:  breakdown,
      totalArrears:   arrears.length,
      passRate:       passFail.passRate,
      failRate:       passFail.failRate,
      departments:    DEPARTMENTS.length,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/students?name=&rollNo=&dept=&page=1&limit=20
router.get('/students', async (req, res) => {
  try {
    const { name, rollNo, dept } = req.query;
    const data = await studentService.searchStudents({ name: name || '', rollNo, dept });
    res.json({ count: data.length, data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/students/:dept/:rollNo
router.get('/students/:dept/:rollNo', async (req, res) => {
  try {
    const { dept, rollNo } = req.params;
    const student = await studentService.getStudentByRollNo(rollNo, dept);
    if (!student) return res.status(404).json({ error: 'Not found' });
    const results = await resultService.getResultsByRollNo(rollNo, dept);
    res.json({ data: student, results });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/results/topper?semester=5&dept=cse
router.get('/results/topper', async (req, res) => {
  try {
    const { semester, dept } = req.query;
    const data = await resultService.getTopperBySemester(semester || 5, dept);
    res.json({ count: data.length, data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/results/arrears?dept=cse
router.get('/results/arrears', async (req, res) => {
  try {
    const data = await resultService.getStudentsWithArrears(req.query.dept);
    res.json({ count: data.length, data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/results/ranking?dept=cse
router.get('/results/ranking', async (req, res) => {
  try {
    const data = await resultService.getCgpaRanking(req.query.dept);
    res.json({ count: data.length, data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/results/stats?semester=5&dept=cse
router.get('/results/stats', async (req, res) => {
  try {
    const { semester, dept } = req.query;
    const data = await resultService.getPassFailStats(semester, dept);
    res.json({ data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/attendance/:dept?name=
router.get('/attendance/:dept', async (req, res) => {
  try {
    const { dept } = req.params;
    const { name } = req.query;
    const { Attendance } = getDeptModels(dept.toLowerCase());
    const query = name ? { name: { $regex: name, $options: 'i' } } : {};
    const data = await Attendance.find(query).sort({ date: -1 }).limit(200).lean();
    res.json({ count: data.length, data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/departments
router.get('/departments', (req, res) => {
  res.json({ data: DEPARTMENTS.map(d => d.toUpperCase()) });
});

// GET /api/dashboard/all-students
router.get('/dashboard/all-students', async (req, res) => {
  try {
    const data = await studentService.getDashboardStudents();
    res.json({ count: data.length, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/ai/query
router.post('/ai/query', handleAiQuery);

// POST /api/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { type } = req.body;
    
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const User = require('../models/userModel');

    // Simple mapping for hackathon: iterate through students and update
    for (const row of data) {
      const rollNo = row.RollNo || row.rollNo || row['Roll No'];
      if (!rollNo) continue;

      const { Student } = getDeptModels('cse'); // Default to CSE for demo
      
      // 1. Update/Create Student Profile
      await Student.findOneAndUpdate(
        { rollNo: { $regex: `^${rollNo}$`, $options: 'i' } },
        { 
          $set: { 
            name: row.Name || row.name || 'New Student',
            internships: [
               { 
                  company: row.Internship || row.internshipDetails || row['Internship Details'] || 'TBD', 
                  role: row.Role || 'Intern', 
                  duration: row.Duration || '3 Months' 
               }
            ],
            cgpa: parseFloat(row.CGPA || row.cgpa || 8.5),
            attendance: parseInt(row.Attendance || row.attendance || 90)
          } 
        },
        { upsert: true }
      );

      // 2. Provision User Login if doesn't exist
      const username = (row.Email || row.email || `${rollNo}@vsb.edu.in`).toLowerCase();
      const userExists = await User.findOne({ username });
      if (!userExists) {
        await User.create({
          username,
          password: 'password123', // Default password for new uploads
          role: type === 'faculty' ? 'faculty' : 'student',
          name: row.Name || row.name || 'New User',
          studentId: rollNo,
          department: 'cse'
        });
      }
    }

    res.json({ success: true, message: `Successfully updated ${data.length} records.`, count: data.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
