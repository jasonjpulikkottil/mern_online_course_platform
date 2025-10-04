import axios from '../utils/axiosConfig';

const markAttendance = async (courseId, lessonId, data) => {
  const response = await axios.post(
    `/courses/${courseId}/lessons/${lessonId}/attendance`,
    data
  );
  return response.data;
};

const getAttendanceByLesson = async (courseId, lessonId) => {
  const response = await axios.get(
    `/courses/${courseId}/lessons/${lessonId}/attendance`
  );
  return response.data;
};

const getAttendanceByUser = async () => {
  const response = await axios.get(`/attendance/my`);
  return response.data;
};

const attendanceService = {
  markAttendance,
  getAttendanceByLesson,
  getAttendanceByUser,
};

export default attendanceService;
