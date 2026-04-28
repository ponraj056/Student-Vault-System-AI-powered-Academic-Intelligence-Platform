const mongoose = require('mongoose');

const sharedOptions = {
  timestamps: true,
  versionKey: false,
};

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    regNo: { type: String, required: true, trim: true, uppercase: true },
    email: { type: String, trim: true, lowercase: true },
    year: { type: Number, min: 1, max: 6 },
    semester: { type: Number, min: 1, max: 12 },
    section: { type: String, trim: true },
  },
  sharedOptions
);

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'studentModel' },
    studentModel: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true },
    subject: { type: String, trim: true },
    period: { type: Number, min: 1 },
  },
  sharedOptions
);

const resultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'studentModel' },
    studentModel: { type: String, required: true },
    exam: { type: String, required: true, trim: true },
    semester: { type: Number, min: 1, max: 12 },
    subject: { type: String, required: true, trim: true },
    marks: { type: Number, min: 0, max: 100 },
    grade: { type: String, trim: true },
  },
  sharedOptions
);

function sanitizeDepartmentCode(code) {
  return String(code || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');
}

function getDepartmentModels(departmentCode) {
  const dept = sanitizeDepartmentCode(departmentCode);

  if (!dept) {
    throw new Error('Valid department code is required');
  }

  const modelPrefix = dept.toUpperCase();
  const Student =
    mongoose.models[`${modelPrefix}_Student`] ||
    mongoose.model(`${modelPrefix}_Student`, studentSchema, `${dept}_students`);

  const Attendance =
    mongoose.models[`${modelPrefix}_Attendance`] ||
    mongoose.model(`${modelPrefix}_Attendance`, attendanceSchema, `${dept}_attendance`);

  const Result =
    mongoose.models[`${modelPrefix}_Result`] ||
    mongoose.model(`${modelPrefix}_Result`, resultSchema, `${dept}_results`);

  return { dept, Student, Attendance, Result };
}

module.exports = { getDepartmentModels, sanitizeDepartmentCode };
