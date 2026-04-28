/**
 * server/models/Chat.js
 * ----------------------
 * Mongoose model for persisting every conversation turn between a student
 * and Campus IQ, regardless of channel (dashboard or WhatsApp).
 */

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    regNo:   { type: String, required: true, trim: true },
    channel: { type: String, enum: ['dashboard', 'whatsapp'], default: 'dashboard' },
    message: { type: String, required: true },  // student's input
    reply:   { type: String, required: true },  // AI response
  },
  { timestamps: true }
);

// Index for fast history retrieval per student
chatSchema.index({ regNo: 1, createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
