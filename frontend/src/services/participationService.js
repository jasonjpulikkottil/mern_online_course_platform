import axios from '../utils/axiosConfig';

const logLessonCompletion = async (lessonId, isCompleted) => {
  const response = await axios.post('/participation/lessons/completion', {
    lessonId,
    completed: isCompleted,
  });
  return response.data;
};

const getStudentCourseProgress = async (courseId) => {
  const response = await axios.get(`/participation/courses/${courseId}/progress`);
  return response.data;
};

const getOverallProgress = async () => {
  const response = await axios.get('/participation/progress/overall');
  return response.data;
};

const participationService = {
  logLessonCompletion,
  getStudentCourseProgress,
  getOverallProgress,
};

export default participationService;
