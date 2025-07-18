const Participation = require('../models/Participation');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Log lesson completion
const logLessonCompletion = async (req, res) => {
  const { lessonId, completed } = req.body;
  const studentId = req.user.userId; // Assuming user ID is available from authentication middleware

  try {
    // Check if the lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    // Find or create participation record
    let participation = await Participation.findOne({ student: studentId, lesson: lessonId });

    if (participation) {
      // Update existing record
      participation.completed = completed;
      participation.completedAt = completed ? Date.now() : null;
    } else {
      // Create new record
      participation = new Participation({
        student: studentId,
        lesson: lessonId,
        completed: completed,
        completedAt: completed ? Date.now() : null,
      });
    }

    await participation.save();

    res.status(200).json({ message: 'Lesson participation updated', participation });
  } catch (error) {
    next(error);
  }
};

// Get a student's progress in a specific course
const getStudentCourseProgress = async (req, res, next) => {
  const { courseId } = req.params;
  const studentId = req.user.userId; // Assuming user ID is available from authentication middleware

  try {
    const lessonsInCourse = await Lesson.find({ course: courseId }).select('_id title');
    const lessonIds = lessonsInCourse.map(lesson => lesson._id);

    const completedLessons = await Participation.find({
      student: studentId,
      lesson: { $in: lessonIds },
      completed: true,
    }).select('lesson');

    const completedLessonIds = completedLessons.map(p => p.lesson.toString());

    const progress = lessonsInCourse.map(lesson => ({
      _id: lesson._id,
      title: lesson.title,
      completed: completedLessonIds.includes(lesson._id.toString()),
    }));

    res.status(200).json({ courseId, progress });
  } catch (error) {
    next(error);
  }
};

module.exports = { logLessonCompletion, getStudentCourseProgress };