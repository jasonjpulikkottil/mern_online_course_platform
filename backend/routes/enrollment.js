const express = require('express');
const router = express.Router();
const {
  createEnrollment,
  getEnrollmentsForStudent,
  checkEnrollment,
} = require('../controllers/enrollmentController');
const { authMiddleware: protect, authorizeRoles } = require('../middlewares/auth');

// @route   POST /api/enrollments
// @desc    Enroll a student in a course
// @access  Private (Student)
router.post('/', protect, authorizeRoles('student'), createEnrollment);

// @route   GET /api/enrollments/my-courses
// @desc    Get all enrollments for a student
// @access  Private (Student)
router.get('/my-courses', protect, authorizeRoles('student'), getEnrollmentsForStudent);

// @route   GET /api/enrollments/:courseId/status
// @desc    Check if a student is enrolled in a course
// @access  Private (Student)
router.get('/:courseId/status', protect, authorizeRoles('student'), checkEnrollment);

module.exports = router;
