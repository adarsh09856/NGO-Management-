const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Strictly allowlisted extensions and corresponding MIME types
const ALLOWED_EXTENSIONS = new Set([
  // Images
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
  // Videos
  '.mp4', '.webm', '.ogg',
  // Documents
  '.pdf', '.doc', '.docx', '.txt'
]);

const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]);

// Storage configuration with 16-byte random hex naming to eliminate directory traversal / collisions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.bin';
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${randomName}${safeExt}`);
  }
});

// File filter enforcing both MIME and extension validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Block executable or script extensions immediately
  const BLOCKED_EXTENSIONS = ['.exe', '.sh', '.bat', '.cmd', '.php', '.js', '.py', '.rb', '.pl', '.cgi', '.jar', '.vbs'];
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Security Error: Uploading executable or script files is strictly prohibited.'), false);
  }

  if (ALLOWED_EXTENSIONS.has(ext) && ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${file.mimetype}). Only safe images, videos, PDF, and office documents are permitted.`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB maximum payload
  },
  fileFilter: fileFilter
});

module.exports = {
  upload,
  uploadDir,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES
};
