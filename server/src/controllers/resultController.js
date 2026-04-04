const resultService = require('../services/resultService');

const getTopper = async (req, res) => {
  try {
    const { semester, dept } = req.query;
    if (!semester) return res.status(400).json({ error: "Provide 'semester' query param" });
    const toppers = await resultService.getTopperBySemester(semester, dept);
    if (!toppers.length) return res.status(404).json({ message: 'No data for this semester', data: [] });
    res.json({ semester: parseInt(semester), count: toppers.length, data: toppers });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getArrears = async (req, res) => {
  try {
    const { dept } = req.query;
    const results = await resultService.getStudentsWithArrears(dept);
    res.json({ count: results.length, data: results });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getCgpaRanking = async (req, res) => {
  try {
    const { dept } = req.query;
    const rankings = await resultService.getCgpaRanking(dept);
    res.json({ count: rankings.length, data: rankings });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getStudentResults = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { dept } = req.query;
    const results = await resultService.getResultsByRollNo(rollNo, dept);
    if (!results.length) return res.status(404).json({ message: 'No results found', data: [] });
    res.json({ rollNo, count: results.length, data: results });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { getTopper, getArrears, getCgpaRanking, getStudentResults };
