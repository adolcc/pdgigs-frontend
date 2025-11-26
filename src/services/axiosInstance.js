// src/services/axiosInstance.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // IMPORTANTE: permite enviar cookies si es necesario
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token a cada request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    console.log('[v0] Token enviado:', token ? 'sí' : 'no');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[v0] Error CORS o API:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    
    // Si es 401, limpiar token
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('userRole');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;