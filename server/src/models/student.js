// Unified student model (used for global queries)
// Per-dept models are in deptModels.js
const mongoose = require('mongoose');
const { getDeptModels } = require('./deptModels');
module.exports = { getDeptModels };
