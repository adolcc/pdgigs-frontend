import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_URL,
  // withCredentials: true, // ❌ COMENTA ESTO - puede causar conflictos con Authorization Bearer
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token a cada request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    console.log('🔐 Token being sent:', token ? 'YES' : 'NO');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header set for URL:', config.url);
    } else {
      console.log('❌ No token found for URL:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response received for:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
    });
    
    // Si es 401, limpiar token
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - clearing tokens');
      localStorage.removeItem('jwt');
      localStorage.removeItem('userRole');
      // Opcional: redirigir al login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;