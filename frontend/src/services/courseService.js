import api from '../utils/axiosConfig';

const createCourse = async (courseData) => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

const getAllCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

const getCourses = async (page = 1, limit = 10, keyword = '', instructorId = '') => {
  const response = await api.get('/courses', {
    params: { page, limit, keyword, instructor: instructorId },
  });
  return response.data;
};

const getCourseById = async (courseId) => {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

const updateCourse = async (courseId, courseData) => {
  const response = await api.put(`/courses/${courseId}`, courseData);
  return response.data;
};

const deleteCourse = async (courseId) => {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
};

const courseService = {
  createCourse,
  getAllCourses,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};

export default courseService;

