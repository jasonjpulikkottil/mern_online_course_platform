const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const AppError = require('../utils/AppError');

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mern-online-course-platform',
    format: async (req, file) => file.originalname.split('.').pop().toLowerCase(),
    public_id: (req, file) => `lesson-${Date.now()}-${file.originalname.split('.')[0]}`, // Unique public ID
    resource_type: 'auto',
  },
});

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 50 }, // 50 MB file size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only images and videos are allowed.', 400), false);
    }
  },
});

module.exports = upload;
