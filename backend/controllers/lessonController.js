const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const MediaAsset = require('../models/MediaAsset'); // Import MediaAsset model
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { createNotification } = require('./notificationController');
const cloudinary = require('../config/cloudinary');

// @desc    Create new lesson for a course
// @route   POST /api/courses/:courseId/lessons
// @access  Private/Instructor
const createLesson = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, content, order } = req.body;

    if (!title || !order) {
      return next(new AppError('Please provide title and order for the lesson', 400));
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Ensure the authenticated user is the instructor of the course
    if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      return next(new AppError(`User ${req.user.userId} is not authorized to add lessons to this course`, 403));
    }

    let mediaData = [];
    if (req.file) {
      try {
        const newMediaAsset = await MediaAsset.create({
          type: req.file.mimetype.startsWith('image') ? 'image' : 'video',
          url: req.file.path,
          public_id: req.file.filename,
          uploadedBy: req.user.userId,
        });
        mediaData.push({ type: newMediaAsset.type, url: newMediaAsset.url, public_id: newMediaAsset.public_id });
      } catch (error) {
        logger.error('Error creating media asset:', error);
        return next(new AppError('Error creating media asset', 500));
      }
    }

    const lesson = await Lesson.create({
      course: courseId,
      title,
      content,
      order,
      media: mediaData,
    });

    // Add lesson to course's lessons array
    course.lessons.push(lesson._id);
    await course.save();

    // Notify enrolled students
    const enrollments = await Enrollment.find({ course: courseId });
    for (const enrollment of enrollments) {
      await createNotification(
        req,
        enrollment.student,
        `A new lesson, "${title}", has been added to ${course.title}.`,
        'lesson'
      );
    }

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    logger.error('Error creating lesson:', error);
    next(new AppError('Could not create lesson', 500));
  }
};

// @desc    Get all lessons for a specific course
// @route   GET /api/courses/:courseId/lessons
// @access  Public
const getLessonsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ course: courseId }).sort('order');

    if (!lessons) {
      return next(new AppError('Lessons not found for this course', 404));
    }

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (error) {
    logger.error('Error fetching lessons by course:', error);
    next(new AppError('Could not fetch lessons', 500));
  }
};

// @desc    Get single lesson by ID
// @route   GET /api/lessons/:id
// @access  Public
const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'title instructor');

    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    logger.error('Error fetching lesson by ID:', error);
    next(new AppError('Could not fetch lesson', 500));
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private/Instructor
const updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    const course = await Course.findById(lesson.course);

    // Make sure user is course owner or admin
    if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      return next(new AppError(`User ${req.user.userId} is not authorized to update this lesson`, 403));
    }

    const updateFields = { ...req.body };
    if (req.file) {
      // If there's existing media, consider deleting it from Cloudinary first
      // For now, just add the new media. A more robust solution would handle replacement/deletion.
      const newMediaAsset = await MediaAsset.create({
        type: req.file.mimetype.startsWith('image') ? 'image' : 'video',
        url: req.file.path,
        public_id: req.file.filename,
        uploadedBy: req.user.userId,
      });
      updateFields.media = [{ type: newMediaAsset.type, url: newMediaAsset.url, public_id: newMediaAsset.public_id }];
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    logger.error('Error updating lesson:', error);
    next(new AppError('Could not update lesson', 500));
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Instructor/Admin
const deleteLesson = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError('Invalid lesson ID', 400));
    }
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    const course = await Course.findById(lesson.course);

    // Make sure user is course owner or admin
    if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
      return next(new AppError(`User ${req.user.userId} is not authorized to delete this lesson`, 403));
    }

    // Remove lesson from course's lessons array
    course.lessons.pull(lesson._id);
    await course.save();

    // Optionally, delete media from Cloudinary when lesson is deleted
    if (lesson.media && lesson.media.length > 0) {
      for (const mediaItem of lesson.media) {
        await cloudinary.uploader.destroy(mediaItem.public_id);
        await MediaAsset.deleteOne({ public_id: mediaItem.public_id });
      }
    }

    await lesson.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error('Error deleting lesson:', error);
    next(error);
  }
};

module.exports = {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
};
