const { parseQuery, INTENTS } = require('../ai/queryParser');
const resultService  = require('../services/resultService');
const studentService = require('../services/studentService');

const handleAiQuery = async (req, res) => {
  try {
    const { query, userRole, studentId } = req.body;
    if (!query) return res.status(400).json({ error: "Provide { query: '...' } in request body" });

    const parsed = parseQuery(query);
    const { intent, params } = parsed;
    let data = [];
    let message = '';

    switch (intent) {
      case INTENTS.TOPPER:
        data = await resultService.getTopperBySemester(params.semester || 5, params.dept);
        message = `Topper(s) for Semester ${params.semester || 5}${params.dept ? ' in ' + params.dept.toUpperCase() : ''}`;
        break;

      case INTENTS.ARREARS:
        data = await resultService.getStudentsWithArrears(params.dept);
        message = `Students with arrears${params.dept ? ' in ' + params.dept.toUpperCase() : ''}`;
        break;

      case INTENTS.CGPA_RANKING:
        data = await resultService.getCgpaRanking(params.dept);
        message = `CGPA ranking${params.dept ? ' for ' + params.dept.toUpperCase() : ' (all departments)'}`;
        break;

      case INTENTS.CGPA_FILTER:
        const allRanked = await resultService.getCgpaRanking(params.dept);
        data = allRanked.filter(r =>
          params.op === '>=' ? r.cgpa >= params.val : r.cgpa <= params.val
        );
        message = `Students with CGPA ${params.op} ${params.val}`;
        break;

      case INTENTS.PASS_FAIL:
        data = await resultService.getPassFailStats(params.semester, params.dept);
        message = `Pass/Fail statistics${params.semester ? ' for Semester ' + params.semester : ''}`;
        break;
        
      case INTENTS.ATTENDANCE:
        const allStudents = await studentService.getDashboardStudents();
        if (query.toLowerCase().includes('below') || query.toLowerCase().includes('low')) {
          data = allStudents.filter(s => s.attendance < 75);
          message = `Students with attendance below 75%`;
        } else {
          data = params.name ? allStudents.filter(s => s.name.toLowerCase().includes(params.name.toLowerCase())) : allStudents.slice(0, 5);
          message = params.name ? `Attendance records for "${params.name}"` : `Recent attendance records`;
        }
        break;

      case INTENTS.MY_INFO: {
        const rollNo = studentId || 'CS001';
        const student = await studentService.getStudentByRollNo(rollNo);
        if (!student) {
          message = "I couldn't find your record in the vault. Please verify your ID.";
          break;
        }

        const sub = params.subType;
        if (sub === 'attendance') {
           const all = await studentService.getDashboardStudents();
           const me = all.find(s => s.id === rollNo);
           message = `Your current attendance is **${me?.attendance || student.attendance || 0}%**. Keep it up!`;
           data = [me || student];
        } else if (sub === 'results') {
           const resultsList = await resultService.getResultsByRollNo(rollNo);
           message = `Here are your semester results. Your latest CGPA is **${student.cgpa || 8.5}**.`;
           data = resultsList || [];
        } else if (sub === 'internship') {
           const count = student.internships?.length || 0;
           message = count > 0 
              ? `I found **${count} internship placement(s)** in your institutional registry.`
              : 'No internship data available yet.';
           data = student.internships || [];
        } else {
           message = `Hello ${student.name}! I've synced with your personal academic vault.`;
           data = [student];
        }
        break;
      }

      case INTENTS.SEARCH:
        if (params.name) {
          data = await studentService.searchStudents({ name: params.name, dept: params.dept });
          message = `Search results for "${params.name}"`;
        } else if (params.dept || params.year) {
          const allStudents = await studentService.getDashboardStudents();
          data = allStudents.filter(s => {
            if (params.dept && s.dept.toLowerCase() !== params.dept) return false;
            if (params.year && s.year !== params.year) return false;
            return true;
          });
          message = `List of students${params.year ? ' in Year ' + params.year : ''}${params.dept ? ' for ' + params.dept.toUpperCase() : ''}`;
        } else {
          return res.json({ intent, message: 'Who are you looking for?', data: [] });
        }
        break;

      default:
        return res.json({
          intent,
          message: 'Query not understood. Try: "topper in sem 5", "students with arrears", "cgpa ranking", "pass fail stats"',
          data: [],
          parsed,
        });
    }

    // Format data to ensure rollNo is mapped properly for frontend if missing
    const formattedData = Array.isArray(data) ? data.map(item => ({
      ...item,
      rollNo: item.rollNo || item.id, // For frontend parsing backwards compatibility
    })) : data;

    res.json({ intent, query, message, count: Array.isArray(formattedData) ? formattedData.length : 1, data: formattedData, parsed });
  } catch (e) {
    res.status(500).json({ error: 'AI query failed', message: e.message });
  }
};

module.exports = { handleAiQuery };
