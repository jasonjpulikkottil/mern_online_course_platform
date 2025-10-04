
const Review = require('../models/Review');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// @desc    Create a new review for a course
// @route   POST /api/courses/:courseId/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    logger.info('Received request for review:', {
      body: req.body,
      headers: req.headers,
      params: req.params,
      user: req.user
    });
    const { rating, comment } = req.body;
    const courseId = req.params.courseId;
    const userId = req.user.userId;

    // Explicitly check for comment
    if (!comment) {
      return next(new AppError('Comment is required.', 400));
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    const existingReview = await Review.findOne({ course: courseId, user: userId });
    if (existingReview) {
      return next(new AppError('You have already reviewed this course', 400));
    }

    const review = await Review.create({
      course: courseId,
      user: userId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    logger.error('Error creating review:', error);
    next(new AppError('Could not create review', 500));
  }
};

// @desc    Get all reviews for a course
// @route   GET /api/courses/:courseId/reviews
// @access  Public
const getReviewsForCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const reviews = await Review.find({ course: courseId }).populate('user', 'username');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    next(new AppError('Could not fetch reviews', 500));
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const reviewId = req.params.id;
    const userId = req.user.userId;

    let review = await Review.findById(reviewId);

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    if (review.user.toString() !== userId) {
      return next(new AppError('You are not authorized to update this review', 403));
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    logger.error('Error updating review:', error);
    next(new AppError('Could not update review', 500));
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.userId;

    const review = await Review.findById(reviewId);

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    if (review.user.toString() !== userId) {
      return next(new AppError('You are not authorized to delete this review', 403));
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error('Error deleting review:', error);
    next(new AppError('Could not delete review', 500));
  }
};

module.exports = {
  createReview,
  getReviewsForCourse,
  updateReview,
  deleteReview,
};
