const studentService = require('../services/studentService');
const resultService  = require('../services/resultService');

const searchStudents = async (req, res) => {
  try {
    const { name, rollNo, dept } = req.query;
    if (!name && !rollNo) return res.status(400).json({ error: "Provide 'name' or 'rollNo' query param" });
    const students = await studentService.searchStudents({ name, rollNo, dept });
    if (!students.length) return res.status(404).json({ message: 'No students found', data: [] });
    res.json({ count: students.length, data: students });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getStudentProfile = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { dept } = req.query;
    const student = await studentService.getStudentByRollNo(rollNo, dept);
    if (!student) return res.status(404).json({ error: `Student '${rollNo}' not found` });
    // Also fetch results
    const results = await resultService.getResultsByRollNo(rollNo, dept);
    res.json({ data: student, results });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { searchStudents, getStudentProfile };
