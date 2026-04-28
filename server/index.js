/**
 * server/index.js  (v3 — PRD-compliant)
 * ----------------------------------------
 * Main server entry. Serves API routes + static uploads.
 */
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const app = express();

// ─── Ensure directories exist ──────────────────────────────────────────────────
['uploads/photos', 'outputs'].forEach(dir => {
  const full = path.join(__dirname, '..', dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const chatRoutes      = require('./routes/chat');
const studentRoutes   = require('./routes/student');
const staffRoutes     = require('./routes/staff');
const adminRoutes     = require('./routes/admin');
const importRoutes    = require('./routes/import');
const whatsappRoutes  = require('./routes/whatsapp');

// ─── Route Mounting ────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/chat',         chatRoutes);
app.use('/api/student',      studentRoutes);
app.use('/api/staff',        staffRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/import',       importRoutes);
app.use('/webhook/whatsapp', whatsappRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() }));

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}`, code: 'UPLOAD_FAILED' });
  }
  res.status(500).json({ success: false, error: err.message || 'Internal server error.' });
});

// ─── Database + Server Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const DB_NAME = 'college_db';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const fullUri = MONGO_URI.includes(DB_NAME) ? MONGO_URI : `${MONGO_URI}/${DB_NAME}`;

mongoose.connect(fullUri)
  .then(() => {
    console.log(`✅ Connected to MongoDB (${DB_NAME})`);
    app.listen(PORT, () => {
      console.log(`🚀 StudentVault server running on http://localhost:${PORT}`);
      console.log(`   Health: GET http://localhost:${PORT}/health`);
      console.log(`   WhatsApp: POST http://localhost:${PORT}/webhook/whatsapp`);
    });
  })
  .catch(err => { console.error('❌ MongoDB connection failed:', err.message); process.exit(1); });
