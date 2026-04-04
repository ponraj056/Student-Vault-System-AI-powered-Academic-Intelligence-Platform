require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs-extra');
const mongoose = require('mongoose');

const studentRoutes = require('./routes/studentRoutes');
const resultRoutes  = require('./routes/resultRoutes');
const aiRoutes      = require('./routes/aiRoutes');
const apiRoutes     = require('./routes/apiRoutes');
const authRoutes    = require('./routes/authRoutes');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Connect MongoDB ────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017', { dbName: 'college_db' })
  .then(() => console.log('✅ MongoDB Connected → college_db'))
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });

// ── Middleware ─────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static: serve frontend pages ──────────
const FRONTEND = path.join(__dirname, '../../client/pages');
app.use(express.static(FRONTEND));

// ── Static: outputs (Excel/PDF downloads) ─
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(__dirname, '../../outputs');
fs.ensureDirSync(OUTPUT_DIR);
fs.ensureDirSync(path.join(__dirname, '../../uploads'));
app.use('/outputs', express.static(OUTPUT_DIR));

// ── REST API Routes ────────────────────────
app.use('/students', studentRoutes);
app.use('/results',  resultRoutes);
app.use('/ai',       aiRoutes);
app.use('/api',      apiRoutes);
app.use('/api/auth', authRoutes);

// ── WhatsApp Webhook (optional) ───────────
try {
  const { handleWebhook, verifyWebhook } = require('./whatsapp/receiver');
  app.get('/webhook',  verifyWebhook);
  app.post('/webhook', handleWebhook);
  console.log('📱 WhatsApp webhook mounted');
} catch (e) {
  console.warn('⚠️  WhatsApp webhook skipped:', e.message);
}

// ── Frontend page routes ───────────────────
const pages = {
  '/':           'admin_login/index.html',
  '/login':      'admin_login/index.html',
  '/dashboard':  'admin_dashboard_overview_1/index.html',
  '/attendance': 'attendance_management_1/index.html',
  '/results':    'results_management_1/index.html',
  '/reports':    'reports_management_1/index.html',
  '/upload':     'data_upload_management_1/index.html',
  '/profile':    'admin_profile_settings_1/index.html',
};
Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => res.sendFile(path.join(FRONTEND, file)));
});

// ── Health check ───────────────────────────
app.get('/health', async (req, res) => {
  const { getDeptModels, DEPARTMENTS } = require('./models/deptModels');
  const counts = {};
  for (const dept of DEPARTMENTS) {
    try { const { Student } = getDeptModels(dept); counts[dept] = await Student.countDocuments(); }
    catch { counts[dept] = 0; }
  }
  res.json({ status: 'ok', mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', db: 'college_db', studentCounts: counts });
});

// ── Global error handler ───────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(55));
  console.log('  StudentVault — Academic Intelligence Platform');
  console.log('='.repeat(55));
  console.log(`  Server   : http://localhost:${PORT}`);
  console.log(`  Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`  API      : http://localhost:${PORT}/api`);
  console.log(`  Health   : http://localhost:${PORT}/health`);
  console.log('='.repeat(55) + '\n');
});
