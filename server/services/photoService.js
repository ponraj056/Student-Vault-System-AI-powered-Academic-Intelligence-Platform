/**
 * server/services/photoService.js
 * ----------------------------------
 * Handles student profile photo upload.
 * Uses Cloudinary if configured, otherwise saves locally.
 */
const fs   = require('fs');
const path = require('path');
const Student = require('../models/Student');

/**
 * Save photo locally (fallback when Cloudinary is not configured).
 * @param {Object} file     — multer file object
 * @param {string} regNo    — student register number
 * @param {string} dept     — department name
 * @returns {string} — URL path to the saved photo
 */
function saveLocally(file, regNo, dept) {
  const deptDir = path.join(__dirname, '..', '..', 'uploads', 'photos', dept.toLowerCase().replace(/\s+/g, '_'));
  if (!fs.existsSync(deptDir)) {
    fs.mkdirSync(deptDir, { recursive: true });
  }

  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${regNo}${ext}`;
  const filePath = path.join(deptDir, filename);
  fs.writeFileSync(filePath, file.buffer);

  return `/uploads/photos/${dept.toLowerCase().replace(/\s+/g, '_')}/${filename}`;
}

/**
 * Upload photo and update student record.
 * If Cloudinary is configured (via multer-storage-cloudinary), file.path contains the URL.
 * Otherwise save to local disk.
 */
async function uploadStudentPhoto(file, regNo, dept) {
  let photoUrl;

  // If multer-storage-cloudinary was used, file.path is the Cloudinary URL
  if (file.path && file.path.startsWith('http')) {
    photoUrl = file.path;
    await Student.findOneAndUpdate(
      { regNo },
      { profilePhoto: photoUrl, profilePhotoId: file.filename || null }
    );
  } else {
    // Local storage fallback
    photoUrl = saveLocally(file, regNo, dept);
    await Student.findOneAndUpdate(
      { regNo },
      { profilePhoto: photoUrl, profilePhotoId: null }
    );
  }

  return { url: photoUrl };
}

module.exports = { uploadStudentPhoto };
