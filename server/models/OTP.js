/**
 * server/models/OTP.js  (v3 — PRD-compliant)
 * ---------------------------------------------
 * OTP model with brute-force protection (attempts counter)
 * and used flag. TTL auto-deletes after 10 min.
 */
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  target:    { type: String, required: true },       // email or phone
  code:      { type: String, required: true },       // 6-digit string
  type:      { type: String, enum: ['email', 'sms'], default: 'email' },
  purpose:   { type: String, enum: ['login', 'verify'], default: 'login' },
  used:      { type: Boolean, default: false },
  attempts:  { type: Number, default: 0 },           // wrong attempts counter
  createdAt: { type: Date, default: Date.now, expires: 600 }, // 10 min TTL
});

otpSchema.index({ target: 1, purpose: 1 });
module.exports = mongoose.model('OTP', otpSchema);
