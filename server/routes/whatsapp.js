/**
 * server/routes/whatsapp.js
 * --------------------------
 * Twilio WhatsApp webhook route.
 * Handles inbound WhatsApp messages:
 *   1. Unverified user  → ask for register number
 *   2. Pending verification → validate regNo against Student model, save session
 *   3. Verified user    → query Campus IQ and reply
 * All conversation turns are saved to the Chat collection.
 */

const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { queryGroq } = require('../services/campusIQ');
const Student = require('../models/Student');
const WhatsappSession = require('../models/WhatsappSession');
const Chat = require('../models/Chat');

const MessagingResponse = twilio.twiml.MessagingResponse;

/**
 * Sends a TwiML text reply back to Twilio
 */
function twimlReply(res, text) {
  const twiml = new MessagingResponse();
  twiml.message(text);
  res.type('text/xml');
  res.send(twiml.toString());
}

// POST /webhook/whatsapp
router.post('/', async (req, res) => {
  try {
    const phone = req.body.From;        // e.g. "whatsapp:+919876543210"
    const incomingMsg = (req.body.Body || '').trim();

    if (!phone || !incomingMsg) {
      return twimlReply(res, 'Hi! Send a message to get started with Campus IQ.');
    }

    // --- Find or create session ---
    let session = await WhatsappSession.findOne({ phone });

    // Brand new user
    if (!session) {
      await WhatsappSession.create({ phone, verified: false, regNo: null });
      return twimlReply(
        res,
        `👋 Welcome to *Campus IQ* — your AI academic assistant!\n\nPlease reply with your *Student Register Number* to get started.`
      );
    }

    // Session exists but not yet verified → treat this message as the regNo
    if (!session.verified) {
      const regNo = incomingMsg.toUpperCase();
      const student = await Student.findOne({ regNo });

      if (!student) {
        return twimlReply(
          res,
          `❌ No student found with register number *${regNo}*.\n\nPlease check and resend your correct register number.`
        );
      }

      // Mark as verified
      session.regNo = student.regNo;
      session.verified = true;
      await session.save();

      return twimlReply(
        res,
        `✅ Verified! Welcome, *${student.name}*!\n\nYou can now ask me anything about your:\n📊 Attendance\n📝 Results\n💼 Internships\n\nHow can I help you today?`
      );
    }

    // --- Verified user: query Campus IQ ---
    const regNo = session.regNo;
    let reply;
    try {
      reply = await queryGroq(incomingMsg, regNo);
    } catch (aiErr) {
      reply = '⚠️ Campus IQ is temporarily unavailable. Please try again in a moment.';
    }

    // Persist conversation turn
    await Chat.create({ regNo, channel: 'whatsapp', message: incomingMsg, reply });

    return twimlReply(res, reply);
  } catch (err) {
    console.error('[WhatsApp Webhook] Error:', err.message);
    return twimlReply(res, '⚠️ Something went wrong. Please try again.');
  }
});

module.exports = router;
