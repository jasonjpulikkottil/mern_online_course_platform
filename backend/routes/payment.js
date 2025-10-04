const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  stripeWebhook,
} = require('../controllers/paymentController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

router.post(
  '/courses/:courseId/checkout',
  authMiddleware,
  authorizeRoles('student'),
  createCheckoutSession
);

router.post(
  '/stripe-webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

module.exports = router;
