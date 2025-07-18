const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
