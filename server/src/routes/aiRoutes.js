const express = require('express');
const router  = express.Router();
const { handleAiQuery } = require('../controllers/aiController');

router.post('/query', handleAiQuery);

module.exports = router;
