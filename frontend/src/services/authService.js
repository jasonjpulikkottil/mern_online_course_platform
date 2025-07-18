import api from '../utils/axiosConfig'; // Corrected import

const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

const authService = {
  login,
  register,
  getProfile,
};

export default authService;
