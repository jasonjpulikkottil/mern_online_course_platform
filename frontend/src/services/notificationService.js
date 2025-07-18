import axios from '../utils/axiosConfig'; // Use the configured axios instance

const getNotifications = async () => {
  const response = await axios.get('/notifications');
  return response.data.data;
};

const markNotificationAsRead = async (id) => {
  await axios.put(`/notifications/${id}/read`);
};

const clearAllNotifications = async () => {
  await axios.delete('/notifications');
};

const notificationService = {
  getNotifications,
  markNotificationAsRead,
  clearAllNotifications,
};

export default notificationService;
