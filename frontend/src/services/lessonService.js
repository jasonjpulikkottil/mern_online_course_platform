import api from '../utils/axiosConfig';

const createLesson = async (lessonData, config) => {
  const response = await api.post('/lessons', lessonData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  });
  return response.data;
};

const getLesson = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}`);
  return response.data;
};

const updateLesson = async (lessonId, lessonData, config) => {
  const response = await api.put(`/lessons/${lessonId}`, lessonData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  });
  return response.data;
};

const deleteLesson = async (lessonId) => {
  const response = await api.delete(`/lessons/${lessonId}`);
  return response.data;
};

const lessonService = {
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
};

export default lessonService;
