/**
 * server/models/Staff.js  (v3 — PRD-compliant)
 * -----------------------------------------------
 * Staff model for faculty, HoD, and admin users.
 * Admin uses passwordHash for login; staff/hod use OTP.
 */
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    employeeId:   { type: String, required: true, unique: true, trim: true, uppercase: true },
    department:   { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },   // admin only — bcrypt hash
    role:         { type: String, enum: ['staff', 'hod', 'admin'], default: 'staff' },
    phone:        { type: String, trim: true },
    subject:      { type: String, trim: true },
    isActive:     { type: Boolean, default: true },
    lastLogin:    { type: Date, default: null },
  },
  { timestamps: true }
);

staffSchema.index({ department: 1 });
staffSchema.index({ role: 1 });

module.exports = mongoose.model('Staff', staffSchema);
