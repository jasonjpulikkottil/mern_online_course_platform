const { body } = require('express-validator');

const validateCourse = [
  body('title', 'Title is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
];

module.exports = {
  validateCourse,
};
