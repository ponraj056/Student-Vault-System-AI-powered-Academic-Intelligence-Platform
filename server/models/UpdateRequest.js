/**
 * server/models/UpdateRequest.js
 * --------------------------------
 * Chatbot-initiated profile correction requests.
 * Students request → staff/admin approve → DB updated.
 */
const mongoose = require('mongoose');

const updateRequestSchema = new mongoose.Schema(
  {
    rollNo:      { type: String, required: true, trim: true, uppercase: true },
    department:  { type: String, required: true, trim: true },
    field:       { type: String, required: true, trim: true },
    oldValue:    { type: String, default: '' },
    newValue:    { type: String, required: true },
    status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy:  { type: String, default: null },         // staff employeeId or admin email
    rejectedBy:  { type: String, default: null },
    reviewedAt:  { type: Date, default: null },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

updateRequestSchema.index({ rollNo: 1, status: 1 });
updateRequestSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('UpdateRequest', updateRequestSchema);
