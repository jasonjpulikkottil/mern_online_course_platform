const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const { createNotification } = require('./notificationController');

const createCourse = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, instructor } = req.body;
    const courseInstructor = (req.user.role === 'admin' && instructor) ? instructor : req.user.userId;
    const course = new Course({ title, description, instructor: courseInstructor });
    await course.save();

    // Notify the instructor about course creation
    await createNotification(courseInstructor, `You have successfully created a new course: ${course.title}`, 'new_course');

    res.status(201).json({ message: 'Course created', courseId: course._id });
  } catch (error) {
    next(error);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyword;
    const instructorId = req.query.instructor;

    let query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (instructorId) {
      query.instructor = instructorId;
    }

    const courses = await Course.find(query)
      .populate('instructor', 'username')
      .skip(skip)
      .limit(limit);

    const totalCourses = await Course.countDocuments(query);
    const totalPages = Math.ceil(totalCourses / limit);

    res.json({
      courses,
      page,
      totalPages,
      totalCourses,
    });
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'username _id').populate('lessons');
    if (!course) return next(new AppError('Course not found', 404));
    res.json(course);
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, instructor } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Check if the user is the instructor or an admin
    if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      return next(new AppError('Forbidden: You are not authorized to update this course', 403));
    }

    course.title = title || course.title;
    course.description = description || course.description;
    if (req.user.role === 'admin' && instructor) {
      course.instructor = instructor;
    }
    course.updatedAt = Date.now();

    await course.save();
    res.json({ message: 'Course updated', course });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Check if the user is the instructor or an admin
    if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      return next(new AppError('Forbidden: You are not authorized to delete this course', 403));
    }

    // Delete associated lessons first
    await Lesson.deleteMany({ course: course._id });

    await Course.deleteOne({ _id: req.params.id });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCourse, getCourses, getCourseById, updateCourse, deleteCourse };