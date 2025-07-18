import api from '../utils/axiosConfig';

const getCourseProgress = async (courseId) => {
  const response = await api.get(`/participation/course/${courseId}`);
  return response.data;
};

const updateLessonProgress = async (lessonId, completed) => {
  const response = await api.post('/participation', { lessonId, completed });
  return response.data;
};

const participationService = {
  getCourseProgress,
  updateLessonProgress,
};

export default participationService;
