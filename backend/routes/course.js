const express = require('express');
const { createCourse, getCourses, getCourseById, updateCourse, deleteCourse } = require('../controllers/courseController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');
const { validateCourse } = require('../middlewares/courseValidators');

const router = express.Router();

router.post('/', authMiddleware, authorizeRoles('instructor', 'admin'), validateCourse, createCourse);
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.put('/:id', authMiddleware, authorizeRoles('instructor', 'admin'), validateCourse, updateCourse);
router.delete('/:id', authMiddleware, authorizeRoles('instructor', 'admin'), deleteCourse);

module.exports = router;