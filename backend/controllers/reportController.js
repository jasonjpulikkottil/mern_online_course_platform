const Enrollment = require('../models/Enrollment');
const Participation = require('../models/Participation');
const Course = require('../models/Course');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

// Get Cloudinary usage statistics
const getCloudinaryUsage = async (req, res) => {
  try {
    const usage = await cloudinary.api.usage();
    res.status(200).json(usage);
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();

    res.status(200).json({ totalUsers, totalCourses, totalEnrollments });
  } catch (error) {
    next(error);
  }
};

// Get enrollment statistics
const getEnrollmentStats = async (req, res) => {
  try {
    const totalEnrollments = await Enrollment.countDocuments();
    const enrollmentsByCourse = await Enrollment.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'courseInfo' } },
      { $unwind: '$courseInfo' },
      { $project: { _id: 0, courseTitle: '$courseInfo.title', count: 1 } },
    ]);

    res.status(200).json({ totalEnrollments, enrollmentsByCourse });
  } catch (error) {
    next(error);
  }
};

// Get participation statistics
const getParticipationStats = async (req, res) => {
  try {
    const totalCompletedLessons = await Participation.countDocuments({ completed: true });
    const totalParticipations = await Participation.countDocuments();

    const participationRateByCourse = await Participation.aggregate([
      { $match: { completed: true } },
      { $lookup: { from: 'lessons', localField: 'lesson', foreignField: '_id', as: 'lessonInfo' } },
      { $unwind: '$lessonInfo' },
      { $lookup: { from: 'courses', localField: 'lessonInfo.course', foreignField: '_id', as: 'courseInfo' } },
      { $unwind: '$courseInfo' },
      { $group: { _id: '$courseInfo._id', courseTitle: { $first: '$courseInfo.title' }, completedLessons: { $sum: 1 } } },
      { $lookup: { from: 'lessons', localField: '_id', foreignField: 'course', as: 'allLessons' } },
      { $project: { courseTitle: 1, completedLessons: 1, totalLessons: { $size: '$allLessons' } } },
      { $project: { courseTitle: 1, completionRate: { $cond: { if: { $eq: ['$totalLessons', 0] }, then: 0, else: { $multiply: [{ $divide: ['$completedLessons', '$totalLessons'] }, 100] } } } } },
    ]);

    res.status(200).json({ totalCompletedLessons, totalParticipations, participationRateByCourse });
  } catch (error) {
    next(error);
  }
};

// Get user role distribution
const getUserRoleDistribution = async (req, res) => {
  try {
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    res.status(200).json(roleDistribution);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getEnrollmentStats, getParticipationStats, getUserRoleDistribution, getCloudinaryUsage };

