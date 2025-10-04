const logger = require('../utils/logger');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { createNotification } = require('./notificationController');

// @desc    Check if a student is enrolled in a course
// @route   GET /api/enrollments/:courseId/status
// @access  Private (Student)
exports.checkEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.userId;

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: studentId,
    });

    res.status(200).json({
      isEnrolled: !!enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students enrolled in a course
// @route   GET /api/courses/:courseId/enrollments
// @access  Private (Instructor, Admin)
exports.getEnrolledStudents = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({ course: courseId }).populate({
      path: 'student',
      select: 'username email',
    });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll a student in a course
// @route   POST /api/enrollments
// @access  Private (Student)
exports.createEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user?.userId;

    if (!studentId) {
      return next(new AppError('User not found. Please log in again.', 401));
    }

    // Check if the user exists
    const user = await User.findById(studentId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if the course exists
    const course = await Course.findById(courseId).populate('instructor');
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    if (user.role !== 'student') {
      return next(new AppError('Only students can enroll in courses', 403));
    }

    // Check if the student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      course: courseId,
      student: studentId,
    });

    if (existingEnrollment) {
      logger.warn(`User ${studentId} is already enrolled in course ${courseId}.`);
      return next(new AppError('You are already enrolled in this course', 400));
    }

    if (course.price > 0) {
      return res.status(200).json({
        success: false,
        message: 'Please proceed with payment to enroll in this course.',
      });
    }

    const enrollment = await Enrollment.create({
      course: courseId,
      student: studentId,
    });

    await createNotification(
      req,
      studentId,
      `You have successfully enrolled in ${course.title}.`,
      'enrollment'
    );

    if (course.instructor && course.instructor._id) {
      await createNotification(
        req,
        course.instructor._id,
        `${user.username} has enrolled in your course, ${course.title}.`,
        'enrollment'
      );
    }

    res.status(201).json({
      success: true,
      message: 'You have successfully enrolled in this course.',
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enrollments for a student
// @route   GET /api/enrollments/my-courses
// @access  Private (Student)
exports.getEnrollmentsForStudent = async (req, res, next) => {
  try {
    const studentId = req.user?.userId;

    if (!studentId) {
      return next(new AppError('User not found. Please log in again.', 401));
    }

    const enrollments = await Enrollment.find({ student: studentId }).populate({
      path: 'course',
      select: 'title description instructor',
      populate: {
        path: 'instructor',
        select: 'username',
      },
    });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    logger.error('Error in getEnrollmentsForStudent:', error);
    next(error);
  }
};
