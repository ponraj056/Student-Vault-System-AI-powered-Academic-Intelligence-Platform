const { getDeptModels, DEPARTMENTS } = require('../models/deptModels');

/**
 * Get topper(s) for a given semester, optionally filtered by dept
 */
async function getTopperBySemester(semester, dept) {
  const sem = parseInt(semester);
  const depts = dept ? [dept.toLowerCase()] : DEPARTMENTS;
  const allResults = [];

  for (const d of depts) {
    try {
      const { Result } = getDeptModels(d);
      const rows = await Result.find({ semester: sem }).sort({ cgpa: -1 }).limit(5).lean();
      rows.forEach(r => allResults.push({ ...r, _dept: d.toUpperCase() }));
    } catch (_) {}
  }

  if (allResults.length === 0) return [];
  allResults.sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0));
  const topCgpa = allResults[0].cgpa;
  return allResults.filter(r => r.cgpa === topCgpa);
}

/**
 * Get all students with arrears > 0
 */
async function getStudentsWithArrears(dept) {
  const depts = dept ? [dept.toLowerCase()] : DEPARTMENTS;
  const results = [];
  for (const d of depts) {
    try {
      const { Result } = getDeptModels(d);
      const rows = await Result.find({ arrears: { $gt: 0 } })
        .select('rollNo name semester subject arrears result -_id')
        .sort({ arrears: -1 })
        .lean();
      rows.forEach(r => results.push({ ...r, _dept: d.toUpperCase() }));
    } catch (_) {}
  }
  return results;
}

/**
 * Get all students ranked by CGPA across all depts
 */
async function getCgpaRanking(dept) {
  const depts = dept ? [dept.toLowerCase()] : DEPARTMENTS;
  const all = [];
  for (const d of depts) {
    try {
      const { Result } = getDeptModels(d);
      const rows = await Result.aggregate([
        { $group: { _id: '$rollNo', name: { $first: '$name' }, cgpa: { $max: '$cgpa' }, semester: { $max: '$semester' } } },
        { $sort: { cgpa: -1 } },
        { $limit: 100 },
      ]);
      rows.forEach(r => all.push({ rollNo: r._id, name: r.name, cgpa: r.cgpa, semester: r.semester, dept: d.toUpperCase() }));
    } catch (_) {}
  }
  all.sort((a, b) => b.cgpa - a.cgpa);
  return all.slice(0, 100).map((r, i) => ({ rank: i + 1, ...r }));
}

/**
 * Get pass/fail statistics
 */
async function getPassFailStats(semester, dept) {
  const depts = dept ? [dept.toLowerCase()] : DEPARTMENTS;
  const stats = { total: 0, pass: 0, fail: 0, deptBreakdown: {} };

  for (const d of depts) {
    try {
      const { Result } = getDeptModels(d);
      const query = semester ? { semester: parseInt(semester) } : {};
      const rows = await Result.find(query).select('result arrears cgpa').lean();
      let p = 0, f = 0;
      rows.forEach(r => {
        const passed = (r.result === 'Pass' || r.result === 'PASS') || (r.arrears === 0 && r.cgpa >= 5);
        passed ? p++ : f++;
      });
      stats.pass += p;
      stats.fail += f;
      stats.total += rows.length;
      stats.deptBreakdown[d.toUpperCase()] = { pass: p, fail: f, total: rows.length };
    } catch (_) {}
  }

  stats.passRate = stats.total > 0 ? ((stats.pass / stats.total) * 100).toFixed(2) : '0.00';
  stats.failRate = stats.total > 0 ? ((stats.fail / stats.total) * 100).toFixed(2) : '0.00';
  return stats;
}

/**
 * Get results for a specific student rollNo
 */
async function getResultsByRollNo(rollNo, dept) {
  const depts = dept ? [dept.toLowerCase()] : DEPARTMENTS;
  for (const d of depts) {
    try {
      const { Result } = getDeptModels(d);
      const rows = await Result.find({ rollNo: { $regex: `^${rollNo}$`, $options: 'i' } }).lean();
      if (rows.length > 0) return rows.map(r => ({ ...r, _dept: d.toUpperCase() }));
    } catch (_) {}
  }
  return [];
}

module.exports = { getTopperBySemester, getStudentsWithArrears, getCgpaRanking, getPassFailStats, getResultsByRollNo };
