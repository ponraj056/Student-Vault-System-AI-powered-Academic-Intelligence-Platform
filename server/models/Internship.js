/**
 * server/models/Internship.js
 * ----------------------------
 * Mongoose model for student internship records.
 */

const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    company:   { type: String, required: true, trim: true },
    role:      { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    status:    { type: String, enum: ['ongoing', 'completed', 'upcoming'], default: 'ongoing' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Internship', internshipSchema);
