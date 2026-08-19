const express = require('express');
const webhookRouter = require('./webhook');

const router = express.Router();

router.use('/', webhookRouter);

module.exports = router;
