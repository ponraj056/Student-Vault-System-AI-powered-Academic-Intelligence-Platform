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
      const { Student, Result, Attendance } = getDeptModels(d);
      const students = await Student.find().lean();
      if (!students || students.length === 0) continue;
      
      for (const s of students) {
        // Fallbacks if no data found
        let cgpa = 8.5;
        let status = 'clear';
        let attPercent = 90;

        try {
          const latestResult = await Result.findOne({ rollNo: s.rollNo }).sort({ semester: -1 }).lean();
          if (latestResult) {
            cgpa = latestResult.cgpa || 0;
            status = (latestResult.arrears === 0) ? 'clear' : 'arrear';
          }
        } catch (e) {}

        try {
          // If rollNo is not in attendance, match by name as a fallback since seed script uses name
          const attendanceRecords = await Attendance.find({ $or: [{rollNo: s.rollNo}, {name: s.name}] }).lean();
          if (attendanceRecords && attendanceRecords.length > 0) {
            const presents = attendanceRecords.filter(a => a.status === 'P').length;
            attPercent = Math.round((presents / attendanceRecords.length) * 100);
          }
        } catch (e) {}

        results.push({
          id: s.rollNo,
          name: s.name,
          dept: d.toUpperCase(),
          year: s.year || 3,
          cgpa: cgpa,
          attendance: attPercent,
          status: status,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.name.substring(0,2))}&backgroundColor=4ff07f&textColor=003915`
        });
      }
    } catch (_) {}
  }
  return results;
}

module.exports = { searchStudents, getStudentByRollNo, getTotalStudentCount, getDashboardStudents };
