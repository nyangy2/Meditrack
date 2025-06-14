// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://13.209.5.228:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 보내기 직전에 토큰을 항상 동적으로 붙이도록 설정
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
