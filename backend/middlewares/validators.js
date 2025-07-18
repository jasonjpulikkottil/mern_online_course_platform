const { body } = require('express-validator');

const validateRegistration = [
  body('username', 'Username is required').not().isEmpty(),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'), ,
  body('role').optional().isIn(['student', 'instructor', 'admin']).withMessage('Invalid role'),
];

const validateLogin = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
];

module.exports = {
  validateRegistration,
  validateLogin,
};