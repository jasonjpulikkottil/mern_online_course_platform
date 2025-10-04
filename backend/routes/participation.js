const express = require('express');
const router = express.Router();
const {
  logLessonCompletion,
  getStudentCourseProgress,
  getOverallProgress,
} = require('../controllers/participationController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

// Log lesson completion
router.post('/lessons/completion', authMiddleware, authorizeRoles('student'), logLessonCompletion);

// Get a student's progress in a specific course
router.get(
  '/courses/:courseId/progress',
  authMiddleware,
  authorizeRoles('student'),
  getStudentCourseProgress
);

// Get a student's overall progress
router.get('/progress/overall', authMiddleware, authorizeRoles('student'), getOverallProgress);

module.exports = router;
