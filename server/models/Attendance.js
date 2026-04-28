/**
 * server/models/Attendance.js
 * ----------------------------
 * Mongoose model for student attendance records.
 * Each document represents a student's attendance for one subject in one month.
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject:    { type: String, required: true, trim: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    month:      { type: String, required: true, trim: true }, // e.g. "March 2025"
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
