const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const MediaAsset = require('../models/MediaAsset'); // Import MediaAsset model
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const AppError = require('../utils/AppError');
const { createNotification } = require('./notificationController');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }).single('media'); // 50 MB limit

// Create a new lesson
const createLesson = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File size too large. Max 50MB allowed.', 413));
      }
      return next(err);
    }

    const { courseId, title, content, order } = req.body;
    const instructorId = req.user.userId; // Consistent user ID from authentication middleware

    if (!courseId || !title || !order) {
      return next(new AppError('Course ID, title, and order are required.', 400));
    }

    let mediaData = [];

    try {
      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `course_media/${courseId}`,
              resource_type: 'auto',
              access_mode: req.file.mimetype.startsWith('video') ? 'public' : 'public', // Ensure videos are public
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          uploadStream.end(req.file.buffer);
        });

        const newMediaAsset = new MediaAsset({
          type: result.resource_type,
          url: result.secure_url,
          public_id: result.public_id,
          uploadedBy: instructorId,
        });
        await newMediaAsset.save();

        mediaData.push({
          type: result.resource_type,
          url: result.secure_url,
          public_id: result.public_id,
        });
      }

      const lesson = new Lesson({
        course: courseId,
        title,
        content,
        order,
        media: mediaData,
      });
      await lesson.save();

      await Course.findByIdAndUpdate(courseId, { $push: { lessons: lesson._id } });

      const course = await Course.findById(courseId);
      if (!course) {
        // This is an unlikely scenario since the previous operation would have failed
        // but it's good practice to handle it.
        return next(new AppError('Course not found when creating notification', 404));
      }

      // Notify the instructor about lesson creation
      await createNotification(instructorId, `You have successfully created a new lesson: ${lesson.title} for course ${course.title}`, 'lesson_update');

      res.status(201).json({ message: 'Lesson created successfully', lesson });
    } catch (error) {
      next(error);
    }
  });
};

// Get a single lesson by ID
const getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'title');
    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }
    res.status(200).json(lesson);
  } catch (error) {
    next(error);
  }
};

// Update a lesson
const updateLesson = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    const { title, content, order } = req.body;
    const lessonId = req.params.id;
  const instructorId = req.user.userId; // Consistent user ID from authentication middleware

  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    console.log('Attempting to delete lesson:', lessonId);
    console.log('Instructor ID from token (req.user.userId):', instructorId);

    const course = await Course.findById(lesson.course);
    console.log('Course found by lesson.course:', course);
    console.log('Course Instructor ID (course.instructor):', course?.instructor);

    if (!course || (course.instructor.toString() !== instructorId.toString() && req.user.role !== 'admin')) {
        return next(new AppError('Not authorized to update this lesson', 403));
      }

      lesson.title = title || lesson.title;
      lesson.content = content || lesson.content;
      lesson.order = order || lesson.order;

      if (req.file) {
        // If there's existing media, consider deleting it from Cloudinary first
        // For simplicity, we'll just add new media. A more robust solution would handle replacement.
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `course_media/${lesson.course}`,
              resource_type: 'auto',
              access_mode: req.file.mimetype.startsWith('video') ? 'public' : 'public', // Ensure videos are public
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          uploadStream.end(req.file.buffer);
        });

        const newMediaAsset = new MediaAsset({
          type: result.resource_type,
          url: result.secure_url,
          public_id: result.public_id,
          uploadedBy: instructorId,
        });
        await newMediaAsset.save();

        lesson.media.push({
          type: result.resource_type,
          url: result.secure_url,
          public_id: result.public_id,
        });
      }

      await lesson.save();

      // Notify the instructor about lesson update
      await createNotification(instructorId, `You have successfully updated the lesson: ${lesson.title} for course ${course.title}`, 'lesson_update');

      res.status(200).json({ message: 'Lesson updated successfully', lesson });
    } catch (error) {
      next(error);
    }
  });
};

// Delete a lesson
const deleteLesson = async (req, res, next) => {
  const lessonId = req.params.id;
  const instructorId = req.user.userId; // Consistent user ID from authentication middleware

  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    const course = await Course.findById(lesson.course);
    if (!course) {
      console.warn(`Attempted to delete lesson ${lessonId} but associated course not found.`);
      return next(new AppError('Associated course not found.', 404));
    }

    console.log(`Instructor ID from token: ${instructorId}`);
    console.log(`Course Instructor ID: ${course.instructor.toString()}`);

    if (course.instructor.toString() !== instructorId.toString() && req.user.role !== 'admin') {
      console.warn(`Unauthorized attempt to delete lesson ${lessonId} by instructor ${instructorId}. Course owner: ${course.instructor}`);
      return next(new AppError('Not authorized to delete this lesson', 403));
    }

    // Remove lesson from course's lessons array
    await Course.findByIdAndUpdate(lesson.course, { $pull: { lessons: lesson._id } });

    // Delete associated media from Cloudinary (optional, but good practice)
    for (const mediaItem of lesson.media) {
      if (mediaItem.public_id) {
        try {
          console.log(`Deleting media asset ${mediaItem.public_id} from Cloudinary.`);
          await cloudinary.uploader.destroy(mediaItem.public_id);
          // Also delete from MediaAsset collection
          console.log(`Deleting media asset ${mediaItem.public_id} from MediaAsset collection.`);
          await MediaAsset.deleteOne({ public_id: mediaItem.public_id });
        } catch (cloudinaryError) {
          console.error(`Error deleting media asset ${mediaItem.public_id} from Cloudinary:`, cloudinaryError);
          // Decide if you want to continue deleting the lesson even if media deletion fails
        }
      }
    }

    console.log(`Deleting lesson ${lessonId} from the database.`);
    await lesson.deleteOne(); // Use deleteOne() instead of remove()

    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createLesson, getLesson, updateLesson, deleteLesson };