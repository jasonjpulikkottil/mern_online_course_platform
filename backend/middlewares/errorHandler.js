const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Send a standardized error response
  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred.',
    // Include stack trace in development for easier debugging
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = errorHandler;
