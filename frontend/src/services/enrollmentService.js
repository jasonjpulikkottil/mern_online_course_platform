import api from '../utils/axiosConfig';

const enrollInCourse = async (courseId) => {
  const response = await api.post('/enrollments', { courseId });
  return response.data;
};

const getMyEnrollments = async () => {
  const response = await api.get('/enrollments/my-enrollments');
  return response.data;
};

const checkEnrollment = async (courseId) => {
  const response = await api.get(`/enrollments/status/${courseId}`);
  return response.data;
};

const enrollmentService = {
  enrollInCourse,
  getMyEnrollments,
  checkEnrollment,
};

export default enrollmentService;
