/**
 * server/middleware/upload.js
 * ----------------------------
 * Multer + Cloudinary storage for profile photo uploads.
 * Falls back to local disk storage when Cloudinary is not configured.
 * Also exports uploadExcel (memory) for Excel file handling.
 */
const multer          = require('multer');
const path            = require('path');
const fs              = require('fs');
const cloudinary      = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Detect whether Cloudinary is properly configured ──────────────────────────
const CLOUDINARY_ENABLED =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_cloudinary_api_key';

// ── Profile Photo Storage ─────────────────────────────────────────────────────
let profileStorage;

if (CLOUDINARY_ENABLED) {
  // Cloudinary storage
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:           'studentvault/profiles',
      allowed_formats:  ['jpg', 'jpeg', 'png', 'webp'],
      transformation:   [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
    },
  });
  console.log('[Upload] ☁️  Photo storage: Cloudinary');
} else {
  // Local disk storage fallback — store inside the project root uploads/photos
  // Note: we use a lazy mkdir in the destination callback (NOT at module load time)
  //       so nodemon doesn't get triggered by directory creation.
  const uploadDir = path.join(__dirname, '../../uploads/photos');

  profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Create directory on first upload if it doesn't exist
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const regNo = (req.user?.regNo || req.user?.employeeId || 'unknown').replace(/[^a-z0-9]/gi, '_');
      const ext   = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${regNo}_${Date.now()}${ext}`);
    },
  });
  console.log('[Upload] 💾 Photo storage: Local disk (Cloudinary not configured)');
}

const uploadPhoto = multer({
  storage: profileStorage,
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'), false);
  },
});

// ── Excel/CSV Storage (Memory — parsed in-flight) ─────────────────────────────
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const ok = file.originalname.match(/\.(xlsx|xls|csv)$/i);
    if (ok) cb(null, true);
    else cb(new Error('Only .xlsx / .xls / .csv files are allowed.'), false);
  },
});

module.exports = { uploadPhoto, uploadExcel, cloudinary, CLOUDINARY_ENABLED };
