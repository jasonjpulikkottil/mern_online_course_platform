const express = require('express');
const { getAllUsers, getAllInstructors, getUserById, updateUser, deleteUser, updateProfile, createUser } = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Public route to get all instructors
router.get('/instructors', getAllInstructors);

// Admin routes for user management
router.post('/', authMiddleware, authorizeRoles('admin'), createUser);
router.get('/', authMiddleware, authorizeRoles('admin'), getAllUsers);
router.get('/:id', authMiddleware, authorizeRoles('admin'), getUserById);
// User profile management (logged-in user can update their own profile)
router.put('/profile', authMiddleware, updateProfile);

router.put('/:id', authMiddleware, authorizeRoles('admin'), updateUser);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteUser);

module.exports = router;
