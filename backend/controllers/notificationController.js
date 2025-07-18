const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');

// @desc    Get notifications for authenticated user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user.id })
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
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });

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
  await Notification.deleteMany({ recipient: req.user.id });

  res.status(200).json({
    success: true,
    message: 'All notifications cleared',
  });
});

// @desc    Create a new notification (internal use, e.g., by other controllers)
const createNotification = async (recipientId, message, type = 'admin_message') => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      message,
      type,
    });
    await notification.save();
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
