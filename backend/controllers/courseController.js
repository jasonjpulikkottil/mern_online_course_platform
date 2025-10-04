const Course = require('../models/Course');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Instructor
const createCourse = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return next(new AppError('Please provide title and description for the course', 400));
    }

    const course = await Course.create({
      title,
      description,
      instructor: req.user.userId, // Instructor ID from authenticated user
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error('Error creating course:', error);
    next(new AppError('Could not create course', 500));
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate('instructor', 'username email');
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    logger.error('Error fetching courses:', error);
    next(new AppError('Could not fetch courses', 500));
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username email')
      .populate('lessons'); // Populate lessons as well

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error('Error fetching course by ID:', error);
    next(new AppError('Could not fetch course', 500));
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Make sure user is course owner
    if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      logger.warn(`Authorization failed: User ${req.user.userId} is not authorized to update course ${req.params.id}`);
      return next(new AppError(`User ${req.user.userId} is not authorized to update this course`, 403));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error('Error updating course:', error);
    next(new AppError('Could not update course', 500));
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor/Admin
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Make sure user is course owner or admin
    if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      logger.warn(`Authorization failed: User ${req.user.userId} is not authorized to delete course ${req.params.id}`);
      return next(new AppError(`User ${req.user.userId} is not authorized to delete this course`, 403));
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error('Error deleting course:', error);
    next(new AppError('Could not delete course', 500));
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
