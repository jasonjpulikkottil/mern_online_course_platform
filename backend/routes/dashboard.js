
const express = require('express');
const { getAnalytics } = require('../controllers/dashboardController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/analytics')
  .get(authMiddleware, authorizeRoles('admin', 'instructor'), getAnalytics);

module.exports = router;
