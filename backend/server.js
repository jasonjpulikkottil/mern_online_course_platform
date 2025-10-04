const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = 'morgan';
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Create HTTP server

connectDB();

// Stream morgan logs to winston
const stream = {
  write: (message) => logger.http(message.trim()),
};

const morganMiddleware = require('morgan')(
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
  origin: '*',
  credentials: true,
};

app.use(cors(corsOptions));

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions
});

// Make io accessible to other modules
app.set('io', io);

io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    logger.info(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/course'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/enrollments', require('./routes/enrollment'));
app.use('/api/participation', require('./routes/participation'));
app.use('/api/users', require('./routes/user'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/media', require('./routes/media'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api', require('./routes/attendance'));

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`)); // Use server.listen instead of app.listen
