/**
 * server/routes/chat.js  (v3 — PRD-compliant, role-aware)
 * ----------------------------------------------------------
 * POST /api/chat          → role-aware chatbot
 * GET  /api/chat/history  → chat history
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { queryGroq } = require('../services/campusIQ');
const Chat = require('../models/Chat');

// POST /api/chat
router.post('/', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    // Build user context from JWT
    const userCtx = {
      role: req.user.role,
      dept: req.user.department,
      rollNo: req.user.regNo || req.user.rollNo || req.body.regNo,
    };

    const result = await queryGroq(message.trim(), userCtx);

    // Persist chat turn
    const regNo = userCtx.rollNo || req.user.employeeId || 'system';
    const replyText = typeof result === 'string' ? result : (result.reply || JSON.stringify(result));
    await Chat.create({ regNo, channel: 'dashboard', message: message.trim(), reply: replyText });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Chat Route] Error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Failed to get AI response.' });
  }
});

// GET /api/chat/history
router.get('/history', authenticate, async (req, res) => {
  try {
    const regNo = req.query.regNo || req.user.regNo || req.user.employeeId;
    const history = await Chat.find({ regNo })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, data: history.reverse() });
  } catch (err) {
    console.error('[Chat History] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch chat history.' });
  }
});

module.exports = router;
