/**
 * server/models/Result.js
 * ------------------------
 * Mongoose model for student academic results.
 * Each document represents a result for one subject in one semester.
 */

const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    semester:  { type: Number, required: true },
    subject:   { type: String, required: true, trim: true },
    grade:     { type: String, required: true, trim: true }, // e.g. "A+", "B"
    marks:     { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
