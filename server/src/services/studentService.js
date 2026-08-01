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

async function getDashboardStudents() {
  const results = [];
  for (const d of DEPARTMENTS) {
    try {
      const { Student } = getDeptModels(d);
      // Limit to 10 per dept → max 160 students across 16 depts
      const students = await Student.find().select('rollNo name year cgpa attendance arrearCount internshipDetails').limit(10).lean();
      if (!students || students.length === 0) continue;

      for (const s of students) {
        // Use student's own stored fields directly — no extra DB queries
        const cgpa = s.cgpa || 8.5;
        const attPercent = s.attendance || 90;
        const status = (s.arrearCount && s.arrearCount > 0) ? 'arrear' : 'clear';

        results.push({
          id: s.rollNo,
          name: s.name,
          dept: d.toUpperCase(),
          year: s.year || 3,
          cgpa: cgpa,
          attendance: attPercent,
          status: status,
          internshipDetails: s.internshipDetails || '',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((s.name || 'ST').substring(0,2))}&backgroundColor=4ff07f&textColor=003915`
        });
      }
    } catch (_) {}
  }
  return results;
}

module.exports = { searchStudents, getStudentByRollNo, getTotalStudentCount, getDashboardStudents };
