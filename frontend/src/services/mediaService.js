import api from '../utils/axiosConfig';

const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const mediaService = {
  uploadMedia,
};

export default mediaService;
