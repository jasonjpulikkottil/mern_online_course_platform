const logger = require('../utils/logger');

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Multer-Cloudinary stores the Cloudinary response in req.file.path (secure_url) and req.file.filename (public_id)
    const { path, filename } = req.file;

    logger.info('Media uploaded successfully:', { url: path, public_id: filename });
    res.status(200).json({ url: path, public_id: filename });
  } catch (error) {
    logger.error('Error uploading media:', error);
    res.status(500).json({ message: 'Server error during media upload.', error: error.message });
  }
};

module.exports = { uploadMedia };
