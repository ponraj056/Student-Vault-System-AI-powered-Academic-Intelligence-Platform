/**
 * server/services/otp.js  (v3 — PRD-compliant)
 * ------------------------------------------------
 * OTP generation, storage, verification, and email delivery.
 * Integrates with brute-force protection from rateLimiter.
 */
const nodemailer = require('nodemailer');
const OTP        = require('../models/OTP');
const { checkOtpAttempts, recordFailedAttempt, clearAttempts } = require('../middleware/rateLimiter');

// ── Transporter ────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Generate 6-digit OTP ───────────────────────────────────────────────────────
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Save OTP to DB (replacing any old one for same target) ────────────────────
async function saveOTP(target, code, type = 'email', purpose = 'login') {
  await OTP.deleteMany({ target, purpose });
  await OTP.create({ target, code, type, purpose, used: false, attempts: 0 });
}

// ── Verify OTP with brute-force protection ─────────────────────────────────────
async function verifyOTP(target, code, purpose = 'login') {
  // Check lockout
  const lockCheck = checkOtpAttempts(target);
  if (lockCheck.locked) {
    return { valid: false, reason: `Too many wrong attempts. Try again in ${lockCheck.retryAfter} seconds.` };
  }

  const record = await OTP.findOne({ target, purpose, used: false });
  if (!record) return { valid: false, reason: 'OTP not found or expired.' };

  if (record.code !== code) {
    // Increment attempts
    record.attempts = (record.attempts || 0) + 1;
    await record.save();
    recordFailedAttempt(target);

    if (record.attempts >= 5) {
      return { valid: false, reason: 'Too many wrong attempts. OTP is now locked. Request a new one.' };
    }
    return { valid: false, reason: 'Incorrect OTP.' };
  }

  // Success — mark used and clear attempts
  record.used = true;
  await record.save();
  clearAttempts(target);
  return { valid: true };
}

// ── Send Email OTP ─────────────────────────────────────────────────────────────
async function sendEmailOTP(email, code, recipientName = 'User') {
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#0d0f1a;color:#f1f5f9;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#6c63ff,#22d3ee);padding:28px 32px">
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff">StudentVault</h1>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75)">V.S.B. Engineering College — Academic Intelligence Platform</p>
      </div>
      <div style="padding:32px">
        <p style="font-size:15px;color:#94a3b8;margin-top:0">Hello <strong style="color:#f1f5f9">${recipientName}</strong>,</p>
        <p style="font-size:14px;color:#94a3b8">Your one-time login code is:</p>
        <div style="background:rgba(108,99,255,0.12);border:1px solid rgba(108,99,255,0.3);border-radius:12px;padding:20px;text-align:center;margin:20px 0">
          <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#a5b4fc">${code}</span>
        </div>
        <p style="font-size:13px;color:#64748b">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0">
        <p style="font-size:12px;color:#475569;margin:0">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || `"StudentVault" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: `${code} — Your StudentVault Login OTP`,
    html,
  });
}

// ── Main: Generate + Save + Send Email OTP ────────────────────────────────────
async function requestEmailOTP(email, name = 'User', purpose = 'login') {
  const code = generateCode();
  await saveOTP(email, code, 'email', purpose);

  // Dev mode: if email is not configured, skip sending and log OTP to console
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail@gmail.com') {
    console.log(`\n📨 [DEV MODE] OTP for ${email}: \x1b[33m${code}\x1b[0m (purpose: ${purpose})\n`);
    return code;
  }

  await sendEmailOTP(email, code, name);
  return code; // returned for testing only — don't expose to client
}

module.exports = { requestEmailOTP, verifyOTP, generateCode };
