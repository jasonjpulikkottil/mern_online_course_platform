import axios from '../utils/axiosConfig';

const getNotifications = async () => {
  const response = await axios.get('/notifications');
  return response.data;
};

const markAsRead = async (id) => {
  const response = await axios.put(`/notifications/${id}/read`);
  return response.data;
};

const clearAll = async () => {
  const response = await axios.delete('/notifications');
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  clearAll,
};

export default notificationService;