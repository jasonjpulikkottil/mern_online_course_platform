const express = require('express');
const { getDashboardStats, getEnrollmentStats, getParticipationStats, getUserRoleDistribution, getCloudinaryUsage, getCourseStats } = require('../controllers/reportController');
const { authMiddleware: protect, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Admin routes for reporting
router.get('/stats', protect, authorizeRoles('admin', 'instructor'), getDashboardStats);
router.get('/enrollment-stats', protect, authorizeRoles('admin'), getEnrollmentStats);
router.get('/participation-stats', protect, authorizeRoles('admin'), getParticipationStats);
router.get('/user-role-distribution', protect, authorizeRoles('admin'), getUserRoleDistribution);
router.get('/cloudinary-usage', protect, authorizeRoles('admin'), getCloudinaryUsage);
router.get('/course-stats', protect, authorizeRoles('admin'), getCourseStats);

module.exports = router;

