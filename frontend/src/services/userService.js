import api from '../utils/axiosConfig';

const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

const getInstructors = async () => {
  const response = await api.get('/users/instructors');
  return response.data;
};

const updateUser = async (userId, data) => {
  const response = await api.put(`/users/${userId}`, data);
  return response.data;
};

const updateUserRole = async (userId, role) => {
  const response = await api.put(`/users/${userId}`, { role });
  return response.data;
};

const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

const createUser = async (userData, token) => {
  const response = await api.post('/users', userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

const userService = {
  getUsers,
  updateUser,
  getInstructors,
  updateUserRole,
  deleteUser,
  createUser,
  updateProfile,
};

export default userService;