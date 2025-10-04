
const express = require('express');
const { updateReview, deleteReview } = require('../controllers/reviewController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.route('/:id')
  .put(authMiddleware, updateReview)
  .delete(authMiddleware, deleteReview);

module.exports = router;
