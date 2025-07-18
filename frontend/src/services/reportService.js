import api from '../utils/axiosConfig';

const getStats = async () => {
  const response = await api.get('/reports/stats');
  return response.data;
};

const getCloudinaryUsage = async () => {
  const response = await api.get('/reports/cloudinary-usage');
  return response.data;
};

const reportService = {
  getStats,
  getCloudinaryUsage,
};

export default reportService;