const express = require('express');
const { logLessonCompletion, getStudentCourseProgress } = require('../controllers/participationController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Log lesson completion (Student only)
router.post('/', authMiddleware, authorizeRoles('student'), logLessonCompletion);

// Get a student's progress in a specific course (Student only)
router.get('/course/:courseId', authMiddleware, authorizeRoles('student'), getStudentCourseProgress);

module.exports = router;