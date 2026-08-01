const { parseQuery, INTENTS } = require('../ai/queryParser');
const resultService  = require('../services/resultService');
const studentService = require('../services/studentService');
const { getCache, setCache } = require('../services/cacheService');

// Intents that benefit from caching (stable data)
const CACHEABLE = new Set([
  INTENTS.TOPPER, INTENTS.ARREARS, INTENTS.CGPA_RANKING,
  INTENTS.CGPA_FILTER, INTENTS.PASS_FAIL, INTENTS.ATTENDANCE
]);

const handleAiQuery = async (req, res) => {
  try {
    const { query, userRole, studentId, userDept } = req.body;
    if (!query) return res.status(400).json({ error: "Provide { query: '...' } in request body" });

    const parsed  = parseQuery(query);
    const { intent, params } = parsed;

    // For HOD/Faculty: restrict dept to their own department
    if ((userRole === 'hod' || userRole === 'faculty') && userDept) {
      if (!params.dept) params.dept = userDept;
    }

    let data    = [];
    let message = '';

    // ── Check Cache First (for cacheable intents) ─────────────────
    if (CACHEABLE.has(intent)) {
      const cached = await getCache(intent, params);
      if (cached.hit) {
        return res.json({ intent, query, message: cached.message, count: Array.isArray(cached.data) ? cached.data.length : 1, data: cached.data, parsed, fromCache: true });
      }
    }

    // ── Compute from DB ───────────────────────────────────────────
    switch (intent) {
      case INTENTS.TOPPER:
        data    = await resultService.getTopperBySemester(params.semester || 5, params.dept);
        message = `Topper(s) for Semester ${params.semester || 5}${params.dept ? ' in ' + params.dept.toUpperCase() : ''}`;
        break;

      case INTENTS.ARREARS:
        data    = await resultService.getStudentsWithArrears(params.dept);
        message = `Students with arrears${params.dept ? ' in ' + params.dept.toUpperCase() : ''}`;
        break;

      case INTENTS.CGPA_RANKING:
        data    = await resultService.getCgpaRanking(params.dept);
        message = `CGPA ranking${params.dept ? ' for ' + params.dept.toUpperCase() : ' (all departments)'}`;
        break;

      case INTENTS.CGPA_FILTER: {
        const allRanked = await resultService.getCgpaRanking(params.dept);
        data    = allRanked.filter(r => params.op === '>=' ? r.cgpa >= params.val : r.cgpa <= params.val);
        message = `Students with CGPA ${params.op} ${params.val}`;
        break;
      }

      case INTENTS.PASS_FAIL:
        data    = await resultService.getPassFailStats(params.semester, params.dept);
        message = `Pass/Fail statistics${params.semester ? ' for Semester ' + params.semester : ''}`;
        break;

      case INTENTS.ATTENDANCE: {
        const allStudents = await studentService.getDashboardStudents();
        if (query.toLowerCase().includes('below') || query.toLowerCase().includes('low')) {
          data    = allStudents.filter(s => s.attendance < 75);
          message = `Students with attendance below 75%`;
        } else {
          data    = params.name ? allStudents.filter(s => s.name.toLowerCase().includes(params.name.toLowerCase())) : allStudents.slice(0, 10);
          message = params.name ? `Attendance records for "${params.name}"` : `Recent attendance records`;
        }
        break;
      }

      case INTENTS.MY_INFO: {
        const rollNo  = studentId || 'CS001';
        const student = await studentService.getStudentByRollNo(rollNo);
        if (!student) {
          message = "I couldn't find your record. Please verify your ID.";
          break;
        }
        const sub = params.subType;
        if (sub === 'attendance') {
          message = `Your current attendance is **${student.attendance || 0}%**.`;
          data    = [student];
        } else if (sub === 'results') {
          const resultsList = await resultService.getResultsByRollNo(rollNo);
          message = `Your semester results. Latest CGPA: **${student.cgpa || 8.5}**.`;
          data    = resultsList || [];
        } else if (sub === 'internship') {
          const count = student.internships?.length || 0;
          message = count > 0 ? `Found **${count} internship(s)** in your registry.` : 'No internship data yet.';
          data    = student.internships || [];
        } else {
          message = `Hello ${student.name}! Here is your academic profile.`;
          data    = [student];
        }
        break;
      }

      case INTENTS.SEARCH:
        if (params.name) {
          data    = await studentService.searchStudents({ name: params.name, dept: params.dept });
          message = `Search results for "${params.name}"`;
        } else if (params.dept || params.year) {
          const allStudents = await studentService.getDashboardStudents();
          data    = allStudents.filter(s => {
            if (params.dept && s.dept.toLowerCase() !== params.dept) return false;
            if (params.year && s.year !== params.year) return false;
            return true;
          });
          message = `Students${params.year ? ' in Year ' + params.year : ''}${params.dept ? ' — ' + params.dept.toUpperCase() : ''}`;
        } else {
          return res.json({ intent, message: 'Who are you looking for? Try: "find Arjun" or "CSE students"', data: [] });
        }
        break;

      default:
        return res.json({
          intent,
          message: 'Try: "topper in sem 5", "students with arrears", "cgpa above 8", "attendance below 75", "pass fail stats"',
          data: [],
          parsed,
        });
    }

    // ── Store result in cache (for cacheable intents) ──────────────
    if (CACHEABLE.has(intent)) {
      await setCache(intent, params, data, message);
    }

    const formattedData = Array.isArray(data)
      ? data.map(item => ({ ...item, rollNo: item.rollNo || item.id }))
      : data;

    res.json({ intent, query, message, count: Array.isArray(formattedData) ? formattedData.length : 1, data: formattedData, parsed, fromCache: false });

  } catch (e) {
    console.error('AI query error:', e);
    res.status(500).json({ error: 'AI query failed', message: e.message });
  }
};

module.exports = { handleAiQuery };
