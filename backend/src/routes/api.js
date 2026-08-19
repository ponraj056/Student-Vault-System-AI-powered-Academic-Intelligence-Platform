const express = require('express');
const mongoose = require('mongoose');
const { getDepartmentModels, sanitizeDepartmentCode } = require('../models/departmentModels');
const { toCsv } = require('../utils/csv');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongoState: mongoose.connection.readyState,
  });
});

router.get('/departments', async (req, res, next) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const departmentSet = new Set();

    for (const { name } of collections) {
      const match = name.match(/^(.*)_(students|attendance|results)$/);
      if (match?.[1]) departmentSet.add(match[1]);
    }

    res.json({ departments: Array.from(departmentSet).sort() });
  } catch (error) {
    next(error);
  }
});

router.get('/students', async (req, res, next) => {
  try {
    const dept = sanitizeDepartmentCode(req.query.dept);
    if (!dept) return res.status(400).json({ message: 'Query param "dept" is required' });

    const { Student } = getDepartmentModels(dept);
    const students = await Student.find().lean();
    res.json({ dept, count: students.length, students });
  } catch (error) {
    next(error);
  }
});

router.get('/students/:dept/:id', async (req, res, next) => {
  try {
    const { dept, id } = req.params;
    const { Student } = getDepartmentModels(dept);

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { regNo: id.toUpperCase() };
    const student = await Student.findOne(query).lean();

    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    next(error);
  }
});

router.get('/attendance/:dept', async (req, res, next) => {
  try {
    const { dept } = req.params;
    const { Attendance, Student } = getDepartmentModels(dept);

    const attendance = await Attendance.find()
      .populate({ path: 'studentId', model: Student.modelName, select: 'name regNo' })
      .sort({ date: -1 })
      .lean();

    res.json({ dept: sanitizeDepartmentCode(dept), count: attendance.length, attendance });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const dept = sanitizeDepartmentCode(req.query.dept);
    if (!dept) return res.status(400).json({ message: 'Query param "dept" is required' });

    const { Student, Attendance, Result } = getDepartmentModels(dept);
    const [students, attendance, results] = await Promise.all([
      Student.countDocuments(),
      Attendance.countDocuments(),
      Result.countDocuments(),
    ]);

    res.json({ dept, students, attendance, results });
  } catch (error) {
    next(error);
  }
});

router.post('/export/attendance', async (req, res, next) => {
  try {
    const dept = sanitizeDepartmentCode(req.body.dept);
    if (!dept) return res.status(400).json({ message: 'Body field "dept" is required' });

    const { Attendance } = getDepartmentModels(dept);
    const rows = await Attendance.find().lean();
    const csv = toCsv(rows.map((row) => ({
      id: row._id,
      studentId: row.studentId,
      date: row.date,
      status: row.status,
      subject: row.subject,
      period: row.period,
    })));

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${dept}-attendance.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

router.post('/export/results', async (req, res, next) => {
  try {
    const dept = sanitizeDepartmentCode(req.body.dept);
    if (!dept) return res.status(400).json({ message: 'Body field "dept" is required' });

    const { Result } = getDepartmentModels(dept);
    const rows = await Result.find().lean();
    const csv = toCsv(rows.map((row) => ({
      id: row._id,
      studentId: row.studentId,
      exam: row.exam,
      semester: row.semester,
      subject: row.subject,
      marks: row.marks,
      grade: row.grade,
    })));

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${dept}-results.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
