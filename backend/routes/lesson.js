const express = require('express');
const { createLesson, getLessonsByCourse, getLessonById, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload'); // Import the upload middleware

const router = express.Router({ mergeParams: true }); // mergeParams to get courseId from parent route

// Routes for lessons within a specific course
router.route('/')
  .post(authMiddleware, authorizeRoles('instructor', 'admin'), upload.single('media'), createLesson) // Create lesson for a course with media upload
  .get(getLessonsByCourse); // Get all lessons for a course

// Routes for individual lessons
router.route('/:id')
  .get(getLessonById)
  .put(authMiddleware, authorizeRoles('instructor', 'admin'), upload.single('media'), updateLesson) // Update lesson with media upload
  .delete(authMiddleware, authorizeRoles('instructor', 'admin'), deleteLesson);

module.exports = router;
