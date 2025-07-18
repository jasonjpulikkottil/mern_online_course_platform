const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();

connectDB();

// Stream morgan logs to winston
const stream = {
  write: (message) => logger.http(message.trim()),
};

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);

app.use(morganMiddleware);
// Define allowed origins. Add your Render frontend URL to this array.
const allowedOrigins = [
  'http://localhost:3000', // For local development
  'https://mern-online-course-platform.onrender.com', // Frontend
  'https://node-online-course-platform.onrender.com'  // Backend/API
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    // or requests from an allowed origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/course'));
app.use('/api/lessons', require('./routes/lesson'));
app.use('/api/enrollments', require('./routes/enrollment')); // New enrollment route
app.use('/api/participation', require('./routes/participation')); // New participation route
app.use('/api/users', require('./routes/user')); // New user management route
app.use('/api/reports', require('./routes/report')); // New reporting route
app.use('/api/notifications', require('./routes/notification')); // New notification route

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));