import axios from '../utils/axiosConfig';

const enrollInCourse = async (courseId) => {
  try {
    const response = await axios.post('/enrollments', { courseId });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getMyCourses = async () => {
  try {
    const response = await axios.get('/enrollments/my-courses');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getEnrolledStudents = async (courseId) => {
  try {
    const response = await axios.get(`/courses/${courseId}/enrollments`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const checkEnrollment = async (courseId) => {
  try {
    const response = await axios.get(`/enrollments/${courseId}/status`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const enrollmentService = {
  enrollInCourse,
  getMyCourses,
  getEnrolledStudents,
  checkEnrollment,
};

export default enrollmentService;

