const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');

// Load env vars
dotenv.config({ path: '.env' });

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {});
      console.log('MongoDB connected for course seeding');
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  };

const courses = [
  {
    title: 'MERN Stack Course',
    description: 'Learn how to build a full-stack web application with MongoDB, Express, React, and Node.js.',
    instructor: '6876b1fe8141b81e54168006',
  },
  {
    title: 'Advanced JavaScript',
    description: 'Deep dive into the advanced concepts of JavaScript.',
    instructor: '6876b1fe8141b81e54168006',
  },
];

const seedCourses = async () => {
  try {
    await connectDB();

    await Course.deleteMany();
    console.log('Courses deleted');

    await Course.insertMany(courses);
    console.log('Courses seeded');

    mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

if (process.argv[2] === '-import-courses') {
    seedCourses();
}
