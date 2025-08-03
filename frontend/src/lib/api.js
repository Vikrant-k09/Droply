import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Files API
export const filesAPI = {
  upload: (formData) => api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getUserFiles: (params) => api.get('/files', { params }),
  getFileByShareLink: (shareLink, password) => 
    api.get(`/files/share/${shareLink}`, { params: { password } }),
  downloadFile: (shareLink, password) => 
    api.get(`/files/download/${shareLink}`, { params: { password } }),
  updateFileSharing: (fileId, data) => api.put(`/files/${fileId}/share`, data),
  generateNewShareLink: (fileId) => api.post(`/files/${fileId}/new-link`),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  getFileStats: () => api.get('/files/stats'),
};

export default api;
