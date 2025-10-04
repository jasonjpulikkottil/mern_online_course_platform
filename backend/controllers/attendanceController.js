const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');

exports.markAttendance = async (req, res, next) => {
  const { courseId, lessonId } = req.params;
  const { status, studentId } = req.body;

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  if (!studentId) {
    return next(new AppError('User not found. Please log in again.', 401));
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    const student = await User.findById(studentId);
    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: studentId,
    });
    if (!enrollment) {
      return next(new AppError('Student is not enrolled in this course', 400));
    }

    let attendance = await Attendance.findOne({
      course: courseId,
      lesson: lessonId,
      student: studentId,
    });

    if (attendance) {
      attendance.status = status;
    } else {
      attendance = new Attendance({
        course: courseId,
        lesson: lessonId,
        student: studentId,
        status,
      });
    }

    await attendance.save();
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceByLesson = async (req, res, next) => {
  const { courseId, lessonId } = req.params;

  try {
    const attendance = await Attendance.find({ course: courseId, lesson: lessonId }).populate(
      'student',
      'username'
    );
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceByUser = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const attendance = await Attendance.find({ student: userId })
      .populate('course', 'title')
      .populate('lesson', 'title');

    const validAttendance = attendance.filter(
      (record) => record.course && record.lesson
    );

    res.status(200).json({ success: true, data: validAttendance });
  } catch (error) {
    next(error);
  }
};
