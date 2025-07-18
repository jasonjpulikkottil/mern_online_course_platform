const mongoose = require('mongoose');

const mediaAssetSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document'], // Expanded types based on common media assets
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const MediaAsset = mongoose.model('MediaAsset', mediaAssetSchema);

module.exports = MediaAsset;
