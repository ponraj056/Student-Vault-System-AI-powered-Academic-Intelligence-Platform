const { getDeptModels, DEPARTMENTS } = require('../models/deptModels');

/**
 * Search students across all departments by name (partial, case-insensitive) or rollNo
 */
async function searchStudents({ name, rollNo, dept }) {
  const depts = dept ? [dept.toLowerCase()] : DEPARTMENTS;
  const results = [];

  for (const d of depts) {
    try {
      const { Student } = getDeptModels(d);
      const query = {};
      if (rollNo) {
        query.rollNo = { $regex: rollNo, $options: 'i' };
      } else if (name) {
        query.name = { $regex: name, $options: 'i' };
      }
      const found = await Student.find(query).select('-__v').limit(20).lean();
      found.forEach(s => results.push({ ...s, _dept: d.toUpperCase() }));
    } catch (_) { /* dept may not have data */ }
  }

  return results;
}

/**
 * Get full student profile by rollNo from a specific dept, or search all depts
 */
async function getStudentByRollNo(rollNo, dept) {
  const depts = dept ? [dept.toLowerCase()] : DEPARTMENTS;
  for (const d of depts) {
    try {
      const { Student } = getDeptModels(d);
      const student = await Student.findOne({ rollNo: { $regex: `^${rollNo}$`, $options: 'i' } }).lean();
      if (student) return { ...student, _dept: d.toUpperCase() };
    } catch (_) {}
  }
  return null;
}

/**
 * Count total students across all departments (or one dept)
 */
async function getTotalStudentCount(dept) {
  const depts = dept ? [dept.toLowerCase()] : DEPARTMENTS;
  let total = 0;
  const breakdown = {};
  for (const d of depts) {
    try {
      const { Student } = getDeptModels(d);
      const c = await Student.countDocuments();
      breakdown[d.toUpperCase()] = c;
      total += c;
    } catch { breakdown[d.toUpperCase()] = 0; }
  }
  return { total, breakdown };
}

module.exports = { searchStudents, getStudentByRollNo, getTotalStudentCount };
