const express = require('express');
const { uploadMedia } = require('../controllers/mediaController');
const upload = require('../middlewares/upload');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Route for media upload
// Only instructors or admins should be able to upload media
router.post('/upload', authMiddleware, upload.single('file'), uploadMedia);

module.exports = router;
