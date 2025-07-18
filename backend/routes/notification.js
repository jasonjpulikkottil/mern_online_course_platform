const express = require('express');
const { authMiddleware } = require('../middlewares/auth');
const { getNotifications, markNotificationAsRead, clearAllNotifications } = require('../controllers/notificationController');

const router = express.Router();

router.route('/').get(authMiddleware, getNotifications).delete(authMiddleware, clearAllNotifications);
router.route('/:id/read').put(authMiddleware, markNotificationAsRead);

module.exports = router;
