const express = require('express');
const { createLesson, getLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Route to create a new lesson (Instructor only)
router.post('/', authMiddleware, authorizeRoles('instructor', 'admin'), createLesson);

// Route to get a single lesson by ID
router.get('/:id', authMiddleware, getLesson);

// Route to update a lesson (Instructor only)
router.put('/:id', authMiddleware, authorizeRoles('instructor', 'admin'), updateLesson);

// Route to delete a lesson (Instructor only)
router.delete('/:id', authMiddleware, authorizeRoles('instructor', 'admin'), deleteLesson);

module.exports = router;