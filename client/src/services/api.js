import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

// Interceptor - añade el token automáticamente a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mochi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Links
export const getLinks = () => api.get('/links');
export const createLink = (data) => api.post('/links', data);
export const updateLink = (id, data) => api.put(`/links/${id}`, data);
export const deleteLink = (id) => api.delete(`/links/${id}`);
export const reorderLinks = (links) => api.put('/links/reorder', { links });
export const clickLink = (id) => api.post(`/links/${id}/click`);

// Perfil público
export const getProfile = (username) => api.get(`/links/u/${username}`);

export default api;