const mongoose = require('mongoose');
const Participation = require('../models/Participation');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');

// Log lesson completion
const logLessonCompletion = async (req, res, next) => {
  const { lessonId, completed } = req.body;
  const studentId = req.user.userId; // Assuming user ID is available from authentication middleware

  try {
    // Check if the lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    // Verify that the student is enrolled in the course
    const enrollment = await Enrollment.findOne({ student: studentId, course: lesson.course });
    if (!enrollment) {
      return next(new AppError('You are not enrolled in this course', 403));
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
  const studentId = req.user.userId;

  try {
    const lessons = await Lesson.find({ course: courseId });
    const lessonIds = lessons.map(lesson => lesson._id);

    const participations = await Participation.find({
      student: studentId,
      lesson: { $in: lessonIds },
    });

    const participationMap = new Map();
    participations.forEach(p => {
      participationMap.set(p.lesson.toString(), p.completed);
    });

    const progress = lessons.map(lesson => ({
      _id: lesson._id,
      title: lesson.title,
      completed: participationMap.get(lesson._id.toString()) || false,
    }));

    res.status(200).json({ courseId, progress });
  } catch (error) {
    next(error);
  }
};

// Get a student's overall progress
const getOverallProgress = async (req, res, next) => {
  const studentId = req.user.userId;

  try {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const overallProgress = await Enrollment.aggregate([
      {
        $match: {
          student: studentObjectId,
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $unwind: '$course',
      },
      {
        $lookup: {
          from: 'lessons',
          localField: 'course.lessons',
          foreignField: '_id',
          as: 'lessons',
        },
      },
      {
        $lookup: {
          from: 'participations',
          let: {
            lessonIds: '$lessons._id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ['$lesson', '$$lessonIds'],
                    },
                    {
                      $eq: ['$student', studentObjectId],
                    },
                    {
                      $eq: ['$completed', true],
                    },
                  ],
                },
              },
            },
          ],
          as: 'completedLessons',
        },
      },
      {
        $project: {
          course: {
            _id: '$course._id',
            title: '$course.title',
          },
          totalLessons: {
            $size: '$lessons',
          },
          completedLessons: {
            $size: '$completedLessons',
          },
          progress: {
            $cond: [
              {
                $eq: [
                  {
                    $size: '$lessons',
                  },
                  0,
                ],
              },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: '$completedLessons',
                      },
                      {
                        $size: '$lessons',
                      },
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      overallProgress,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { logLessonCompletion, getStudentCourseProgress, getOverallProgress };