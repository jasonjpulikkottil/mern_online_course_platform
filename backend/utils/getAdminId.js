const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '.env' });

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {});
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  };

const getAdminId = async () => {
  try {
    await connectDB();

    const admin = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });

    if (admin) {
      console.log(admin._id.toString());
    } else {
      console.log('Admin user not found');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

getAdminId();
