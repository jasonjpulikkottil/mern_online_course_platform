import api from '../utils/axiosConfig';

const createLesson = async (courseId, lessonData, onUploadProgress) => {
  const response = await api.post(`/courses/${courseId}/lessons`, lessonData, {
    onUploadProgress,
  });
  return response.data;
};

const getLessonById = async (courseId, lessonId) => {
  const response = await api.get(`/courses/${courseId}/lessons/${lessonId}`);
  return response.data;
};

const updateLesson = async (courseId, lessonId, lessonData, onUploadProgress) => {
  const response = await api.put(`/courses/${courseId}/lessons/${lessonId}`, lessonData, {
    onUploadProgress,
  });
  return response.data;
};

const deleteLesson = async (courseId, lessonId) => {
  const response = await api.delete(`/courses/${courseId}/lessons/${lessonId}`);
  return response.data;
};

const lessonService = {
  createLesson,
  getLessonById,
  updateLesson,
  deleteLesson,
};

export default lessonService;