
import api from '../utils/axiosConfig';

const getAnalytics = async () => {
  const response = await api.get('/dashboard/analytics');
  return response.data;
};

const dashboardService = {
  getAnalytics,
};

export default dashboardService;
