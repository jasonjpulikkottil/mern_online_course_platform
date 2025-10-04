const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');

// @desc    Get notifications for authenticated user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user.userId })
    .sort({ createdAt: -1 })
    .select('-recipient'); // Don't send recipient ID back to client

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.userId });

  if (!notification) {
    return next(new AppError('Notification not found or you are not authorized to access this notification', 404));
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
  });
});

// @desc    Clear all notifications for authenticated user
// @route   DELETE /api/notifications
// @access  Private
const clearAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ recipient: req.user.userId });

  res.status(200).json({
    success: true,
    message: 'All notifications cleared',
  });
});

// @desc    Create a new notification (internal use, e.g., by other controllers)
const createNotification = async (req, recipientId, message, type = 'admin_message') => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      message,
      type,
    });
    await notification.save();

    // Emit a socket event to the specific user
    const io = req.app.get('io');
    if (io) {
      io.to(recipientId.toString()).emit('new_notification', {
        _id: notification._id,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
      });
      console.log(`Notification event emitted to ${recipientId}`);
    }
    
    console.log(`Notification created for ${recipientId}: ${message}`);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  clearAllNotifications,
  createNotification,
};
