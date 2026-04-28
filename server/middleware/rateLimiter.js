/**
 * server/middleware/rateLimiter.js
 * ----------------------------------
 * Rate limiting for OTP endpoints to prevent abuse.
 * - Max 3 OTP requests per userId per 15 minutes
 * - Max 5 wrong OTP attempts → 15-min lockout
 */

// In-memory store (use Redis in production)
const otpRequestStore = new Map();   // key: userId → { count, resetAt }
const otpAttemptStore = new Map();   // key: userId → { count, lockedUntil }

const OTP_REQUEST_LIMIT = 3;
const OTP_REQUEST_WINDOW_MS = 15 * 60 * 1000;  // 15 minutes
const OTP_ATTEMPT_LIMIT = 5;
const OTP_LOCKOUT_MS = 15 * 60 * 1000;         // 15 minutes

/**
 * Rate-limit OTP send requests.
 * Key by req.body.registerId || req.body.regNo || req.body.facultyId || req.body.employeeId
 */
function limitOtpRequests(req, res, next) {
  const userId = (
    req.body.registerId || req.body.regNo || req.body.facultyId || req.body.employeeId || ''
  ).toString().toUpperCase();

  if (!userId) return next();

  const now = Date.now();
  let entry = otpRequestStore.get(userId);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + OTP_REQUEST_WINDOW_MS };
    otpRequestStore.set(userId, entry);
  }

  entry.count++;

  if (entry.count > OTP_REQUEST_LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Too many OTP requests. Try again in ${retryAfter} seconds.`,
      code: 'OTP_RATE_LIMITED',
    });
  }

  next();
}

/**
 * Check if userId is locked out from OTP verification attempts.
 */
function checkOtpAttempts(userId) {
  const entry = otpAttemptStore.get(userId);
  if (!entry) return { locked: false };
  if (Date.now() > entry.lockedUntil) {
    otpAttemptStore.delete(userId);
    return { locked: false };
  }
  if (entry.count >= OTP_ATTEMPT_LIMIT) {
    const retryAfter = Math.ceil((entry.lockedUntil - Date.now()) / 1000);
    return { locked: true, retryAfter };
  }
  return { locked: false };
}

/**
 * Record a wrong OTP attempt.
 */
function recordFailedAttempt(userId) {
  let entry = otpAttemptStore.get(userId);
  if (!entry) {
    entry = { count: 0, lockedUntil: Date.now() + OTP_LOCKOUT_MS };
    otpAttemptStore.set(userId, entry);
  }
  entry.count++;
  if (entry.count >= OTP_ATTEMPT_LIMIT) {
    entry.lockedUntil = Date.now() + OTP_LOCKOUT_MS;
  }
}

/**
 * Clear attempts on successful verification.
 */
function clearAttempts(userId) {
  otpAttemptStore.delete(userId);
}

module.exports = { limitOtpRequests, checkOtpAttempts, recordFailedAttempt, clearAttempts };
