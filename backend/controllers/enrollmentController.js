const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { createNotification } = require('./notificationController');

// Enroll a student in a course
const enrollCourse = async (req, res, next) => {
  const { courseId } = req.body;
  const studentId = req.user.userId; // Assuming user ID is available from authentication middleware

  try {
    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Check if the student is already enrolled
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existingEnrollment) {
      return next(new AppError('Student already enrolled in this course', 409));
    }

    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
    });
    await enrollment.save();

    // Notify the student about successful enrollment
    await createNotification(studentId, `You have successfully enrolled in the course: ${course.title}`, 'enrollment');

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (error) {
    next(error);
  }
};

// Get all enrollments for a specific student
const getStudentEnrollments = async (req, res, next) => {
  const studentId = req.user.userId; // Assuming user ID is available from authentication middleware

  try {
    const enrollments = await Enrollment.find({ student: studentId }).populate('course', 'title description instructor');
    res.status(200).json(enrollments);
  } catch (error) {
    next(error);
  }
};

// Get all enrollments for a specific course (for instructor/admin)
const getCourseEnrollments = async (req, res, next) => {
  const { courseId } = req.params;
  const instructorId = req.user.userId; // Assuming user ID is available from authentication middleware

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Check if the user is the instructor of the course or an admin
    if (req.user.role !== 'admin' && (!course.instructor || course.instructor.toString() !== instructorId)) {
      return next(new AppError('Not authorized to view enrollments for this course', 403));
    }

    const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'username email');
    res.status(200).json(enrollments);
  } catch (error) {
    next(error);
  }
};

// Check enrollment status for a student in a course
const checkEnrollment = async (req, res, next) => {
  const { courseId } = req.params;
  const studentId = req.user.userId;

  try {
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existingEnrollment) {
      return res.status(200).json({ isEnrolled: true });
    } else {
      return res.status(200).json({ isEnrolled: false });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { enrollCourse, getStudentEnrollments, getCourseEnrollments, checkEnrollment };