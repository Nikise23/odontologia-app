import axios from 'axios';

// En producción, si no hay REACT_APP_API_URL, usar la misma URL (backend y frontend juntos)
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL 
  : process.env.NODE_ENV === 'production'
    ? '/api'  // Mismo origen cuando están juntos
    : 'http://localhost:5000/api';

const axiosConfig = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token en cada petición
axiosConfig.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
axiosConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la petición:', error);
    
    // Si el error es 401 (no autorizado), limpiar token
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosConfig;


