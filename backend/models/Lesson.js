const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  content: { type: String },
  media: [{ type: { type: String }, url: String, public_id: String }],
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lesson', lessonSchema);