/**
 * server/models/Student.js  (v3 — PRD-compliant)
 * -------------------------------------------------
 * Extended with: section, year, batch, cgpa, address, parentName,
 * parentPhone, bloodGroup, dob, isActive.
 * Password removed — OTP-only login for students.
 */
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name:               { type: String, required: true, trim: true },
    regNo:              { type: String, required: true, unique: true, trim: true, uppercase: true },
    department:         { type: String, required: true, trim: true },
    email:              { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:              { type: String, trim: true },
    role:               { type: String, enum: ['student'], default: 'student' },
    section:            { type: String, trim: true },
    year:               { type: Number, min: 1, max: 4 },
    semester:           { type: Number, min: 1, max: 8 },
    batch:              { type: String, trim: true },          // e.g. "2022-26"
    cgpa:               { type: Number, min: 0, max: 10 },
    profilePhoto:       { type: String, default: null },       // Cloudinary URL or local path
    profilePhotoId:     { type: String, default: null },       // Cloudinary public_id
    address:            { type: String, trim: true },
    parentName:         { type: String, trim: true },
    parentPhone:        { type: String, trim: true },
    bloodGroup:         { type: String, trim: true },
    dob:                { type: Date },
    isActive:           { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for search
studentSchema.index({ name: 'text', regNo: 'text' });
studentSchema.index({ department: 1 });
studentSchema.index({ regNo: 1, department: 1 });

module.exports = mongoose.model('Student', studentSchema);
