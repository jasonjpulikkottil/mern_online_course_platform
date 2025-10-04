
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// @desc    Get analytics for admin/instructor
// @route   GET /api/dashboard/analytics
// @access  Private/Admin, Private/Instructor
const getAnalytics = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    let analytics = {};

    if (role === 'admin') {
      const totalUsers = await User.countDocuments();
      const totalCourses = await Course.countDocuments();
      const totalEnrollments = await Enrollment.countDocuments();
      const totalReviews = await Review.countDocuments();

      analytics = {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalReviews,
      };
    } else if (role === 'instructor') {
      const courses = await Course.find({ instructor: userId });
      const courseIds = courses.map(course => course._id);

      const totalCourses = courseIds.length;
      const totalEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds } });
      const totalReviews = await Review.countDocuments({ course: { $in: courseIds } });

      const courseEnrollments = await Enrollment.find({ course: { $in: courseIds } }).populate('course', 'price');
      const totalRevenue = courseEnrollments.reduce((acc, enrollment) => acc + (enrollment.course.price || 0), 0);


      analytics = {
        totalCourses,
        totalEnrollments,
        totalReviews,
        totalRevenue,
      };
    }

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    next(new AppError('Could not fetch analytics', 500));
  }
};

module.exports = {
  getAnalytics,
};
