require('dotenv').config();
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const courseRouter = require('../routes/course');
const authMiddleware = require('../middlewares/auth');
const errorHandler = require('../middlewares/errorHandler');
const User = require('../models/User');
const Course = require('../models/Course');

const app = express();
app.use(express.json());
app.use('/api/courses', courseRouter);
app.use(errorHandler);

// Mock auth middleware
jest.mock('../middlewares/auth', () => {
  const mockMongoose = require('mongoose');
  return {
    authMiddleware: (req, res, next) => {
      req.user = { userId: new mockMongoose.Types.ObjectId(), role: 'instructor' };
      next();
    },
    authorizeRoles: (...roles) => (req, res, next) => {
      if (roles.includes(req.user.role)) {
        return next();
      }
      return res.status(403).json({ message: 'User role not authorized' });
    }
  };
});

describe('Course Routes', () => {
  beforeAll(async () => {
    const url = process.env.MONGO_URI || 'mongodb://127.0.0.1/test-db-courses';
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  beforeEach(async () => {
    await User.deleteMany();
    await Course.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/courses', () => {
    it('should fetch all courses', async () => {
      const instructor = await User.create({
        username: 'instructor',
        email: 'instructor@example.com',
        password: 'password123',
        role: 'instructor'
      });

      await Course.create({
        title: 'Test Course 1',
        description: 'Test Description 1',
        instructor: instructor._id
      });
      await Course.create({
        title: 'Test Course 2',
        description: 'Test Description 2',
        instructor: instructor._id
      });

      const res = await request(app).get('/api/courses');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('POST /api/courses', () => {
    it('should create a new course', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({
          title: 'New Course',
          description: 'New Description'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      const course = await Course.findOne({ title: 'New Course' });
      expect(course).not.toBeNull();
    });
  });
});
