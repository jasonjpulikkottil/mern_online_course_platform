const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');

exports.createCheckoutSession = async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    if (course.price === 0) {
      // If the course is free, enroll the user directly
      const enrollment = await Enrollment.create({
        course: courseId,
        student: userId,
      });
      return res.status(201).json({
        success: true,
        data: enrollment,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description,
            },
            unit_amount: course.price * 100, // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/courses/${courseId}?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${courseId}?payment=cancel`,
      client_reference_id: courseId,
      customer_email: req.user.email,
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    next(error);
  }
};

exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      stripeWebhookSecret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const courseId = session.client_reference_id;
    const userEmail = session.customer_email;

    try {
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      await Enrollment.create({
        course: courseId,
        student: user._id,
      });
    } catch (error) {
      return next(error);
    }
  }

  res.status(200).json({ received: true });
};
