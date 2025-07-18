const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: '.env' });

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {});
      console.log('MongoDB connected for seeding');
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  };

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      // Remove any existing admin with the same email to ensure a clean seed
      await User.deleteOne({ email: adminEmail, role: 'admin' });
      console.log('Removed existing default admin user (if any).');

      const defaultAdmin = new User({
        username: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });

      await defaultAdmin.save();
      console.log('Default admin user created successfully.');

    } else {
      console.log('DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD not set in .env. Skipping default admin creation.');
    }

    mongoose.disconnect();
    console.log('MongoDB disconnected');

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

if (process.argv[2] === '-import') {
    seedAdmin();
}
