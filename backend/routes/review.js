
const express = require('express');
const { createReview, getReviewsForCourse } = require('../controllers/reviewController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(authMiddleware, createReview)
  .get(getReviewsForCourse);

module.exports = router;
