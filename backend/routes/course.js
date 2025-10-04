const express = require('express');
const { createCourse, getCourses, getCourseById, updateCourse, deleteCourse } = require('../controllers/courseController');
const { getEnrolledStudents } = require('../controllers/enrollmentController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');
const lessonRouter = require('./lesson');
const reviewRouter = require('./review');

const router = express.Router();

router.use('/:courseId/lessons', lessonRouter);
router.use('/:courseId/reviews', reviewRouter);

router.route('/')
  .post(authMiddleware, authorizeRoles('instructor', 'admin'), createCourse)
  .get(getCourses);

router.route('/:id')
  .get(getCourseById)
  .put(authMiddleware, authorizeRoles('instructor', 'admin'), updateCourse)
  .delete(authMiddleware, authorizeRoles('instructor', 'admin'), deleteCourse);

router.route('/:courseId/enrollments')
  .get(authMiddleware, authorizeRoles('instructor', 'admin'), getEnrolledStudents);

module.exports = router;
