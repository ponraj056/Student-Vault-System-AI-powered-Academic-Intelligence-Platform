const express = require('express');
const router  = express.Router();
const { getTopper, getArrears, getCgpaRanking, getStudentResults } = require('../controllers/resultController');

router.get('/topper',       getTopper);
router.get('/arrears',      getArrears);
router.get('/cgpa-ranking', getCgpaRanking);
router.get('/:rollNo',      getStudentResults);

module.exports = router;
