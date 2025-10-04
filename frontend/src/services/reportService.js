import api from '../utils/axiosConfig';

const getStats = async () => {
  const response = await api.get('/reports/stats');
  return response.data;
};

const getEnrollmentStats = async () => {
  const response = await api.get('/reports/enrollment-stats');
  return response.data;
};

const getParticipationStats = async () => {
  const response = await api.get('/reports/participation-stats');
  return response.data;
};

const getUserRoleDistribution = async () => {
  const response = await api.get('/reports/user-role-distribution');
  return response.data;
};

const getCourseStats = async () => {
  const response = await api.get('/reports/course-stats');
  return response.data;
};

const getCloudinaryUsage = async () => {
  const response = await api.get('/reports/cloudinary-usage');
  return response.data;
};

const reportService = {
  getStats,
  getEnrollmentStats,
  getParticipationStats,
  getUserRoleDistribution,
  getCourseStats,
  getCloudinaryUsage,
};

export default reportService;