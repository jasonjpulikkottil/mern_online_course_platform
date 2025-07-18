const express = require('express');
const { enrollCourse, getStudentEnrollments, getCourseEnrollments, checkEnrollment } = require('../controllers/enrollmentController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Check enrollment status
router.get('/status/:courseId', authMiddleware, authorizeRoles('student'), checkEnrollment);

// Enroll a student in a course (Student only)
router.post('/', authMiddleware, authorizeRoles('student'), enrollCourse);

// Get all courses a student is enrolled in (Student only)
router.get('/my-enrollments', authMiddleware, authorizeRoles('student'), getStudentEnrollments);

// Get all students enrolled in a specific course (Instructor/Admin only)
router.get('/course/:courseId', authMiddleware, authorizeRoles('instructor', 'admin'), getCourseEnrollments);

module.exports = router;