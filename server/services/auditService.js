/**
 * server/services/auditService.js
 * ----------------------------------
 * Helper to log every data change to audit_logs collection.
 */
const AuditLog = require('../models/AuditLog');

/**
 * Log an action to the audit trail.
 * @param {string} action      — e.g. "UPDATE_STUDENT", "APPROVE_REQUEST", "UPLOAD_EXCEL"
 * @param {string} performedBy — userId (regNo, employeeId, or email)
 * @param {string} role        — student, staff, hod, admin
 * @param {string|null} targetRollNo — affected student's rollNo
 * @param {object} details     — { field, oldValue, newValue, ... }
 */
async function logAudit(action, performedBy, role, targetRollNo = null, details = {}) {
  try {
    await AuditLog.create({
      action,
      performedBy,
      role,
      targetRollNo,
      details,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write audit log:', err.message);
  }
}

module.exports = { logAudit };
