const express = require('express');
const router  = express.Router();
const { searchStudents, getStudentProfile } = require('../controllers/studentController');

router.get('/', searchStudents);
router.get('/:rollNo', getStudentProfile);

module.exports = router;
