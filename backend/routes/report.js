const express = require('express');
const { getDashboardStats, getEnrollmentStats, getParticipationStats, getUserRoleDistribution, getCloudinaryUsage } = require('../controllers/reportController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Admin routes for reporting
router.get('/stats', authMiddleware, authorizeRoles('admin', 'instructor'), getDashboardStats);
router.get('/enrollment-stats', authMiddleware, authorizeRoles('admin'), getEnrollmentStats);
router.get('/participation-stats', authMiddleware, authorizeRoles('admin'), getParticipationStats);
router.get('/user-role-distribution', authMiddleware, authorizeRoles('admin'), getUserRoleDistribution);
router.get('/cloudinary-usage', authMiddleware, authorizeRoles('admin'), getCloudinaryUsage);

module.exports = router;

