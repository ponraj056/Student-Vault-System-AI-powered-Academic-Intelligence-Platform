/**
 * server/models/AuditLog.js
 * ---------------------------
 * Full audit trail for all data changes in the system.
 */
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action:       { type: String, required: true },           // e.g. "UPDATE_STUDENT", "APPROVE_REQUEST"
    performedBy:  { type: String, required: true },           // userId (regNo, employeeId, or email)
    role:         { type: String, required: true },           // student, staff, hod, admin
    targetRollNo: { type: String, default: null },
    details:      { type: mongoose.Schema.Types.Mixed, default: {} }, // { field, oldValue, newValue, ... }
    timestamp:    { type: Date, default: Date.now },
  },
  { timestamps: false }
);

auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ targetRollNo: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
