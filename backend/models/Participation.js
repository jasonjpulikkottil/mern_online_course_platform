const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
});

// Add a pre-save hook to set completedAt when completed becomes true
participationSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed) {
    this.completedAt = Date.now();
  }
  next();
});

const Participation = mongoose.model('Participation', participationSchema);

module.exports = Participation;
