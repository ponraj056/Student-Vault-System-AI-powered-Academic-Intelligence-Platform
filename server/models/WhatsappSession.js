/**
 * server/models/WhatsappSession.js
 * ---------------------------------
 * Mongoose model for tracking verified WhatsApp user sessions.
 * Maps a WhatsApp phone number to a student register number after verification.
 */

const mongoose = require('mongoose');

const whatsappSessionSchema = new mongoose.Schema(
  {
    phone:     { type: String, required: true, unique: true, trim: true }, // e.g. "whatsapp:+919876543210"
    regNo:     { type: String, trim: true, default: null },                // null until verified
    verified:  { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('WhatsappSession', whatsappSessionSchema);
