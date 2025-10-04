const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceByLesson,
  getAttendanceByUser,
} = require('../controllers/attendanceController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

// Mark attendance for a lesson
router.post(
  '/courses/:courseId/lessons/:lessonId/attendance',
  authMiddleware,
  authorizeRoles('instructor', 'admin'),
  markAttendance
);

// Get attendance for a lesson
router.get(
  '/courses/:courseId/lessons/:lessonId/attendance',
  authMiddleware,
  authorizeRoles('instructor', 'admin'),
  getAttendanceByLesson
);

// Get attendance for a user
router.get(
  '/attendance/my',
  authMiddleware,
  authorizeRoles('student'),
  getAttendanceByUser
);

module.exports = router;
