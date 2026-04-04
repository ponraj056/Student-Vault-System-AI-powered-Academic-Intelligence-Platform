const { parseQuery, INTENTS } = require('../ai/queryParser');
const resultService  = require('../services/resultService');
const studentService = require('../services/studentService');

const handleAiQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Provide { query: '...' } in request body" });

    const parsed = parseQuery(query);
    const { intent, params } = parsed;
    let data = [];
    let message = '';

    switch (intent) {
      case INTENTS.TOPPER:
        if (!params.semester) return res.json({ intent, message: 'Which semester? e.g. "topper in sem 5"', data: [] });
        data = await resultService.getTopperBySemester(params.semester, params.dept);
        message = `Topper(s) for Semester ${params.semester}`;
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

      case INTENTS.SEARCH:
        if (params.name) {
          data = await studentService.searchStudents({ name: params.name, dept: params.dept });
          message = `Search results for "${params.name}"`;
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

    res.json({ intent, query, message, count: Array.isArray(data) ? data.length : 1, data, parsed });
  } catch (e) {
    res.status(500).json({ error: 'AI query failed', message: e.message });
  }
};

module.exports = { handleAiQuery };
