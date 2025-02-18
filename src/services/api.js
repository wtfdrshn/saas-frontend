import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  retry: 3,
  retryDelay: 1000,
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (
      (error.code === 'ECONNRESET' || 
       error.code === 'ECONNABORTED' ||
       error.message === 'Network Error' ||
       (error.response && error.response.status >= 500)) &&
      !originalRequest._retry &&
      originalRequest.retry > 0
    ) {
      originalRequest._retry = true;
      originalRequest.retry--;

      await new Promise(resolve => setTimeout(resolve, originalRequest.retryDelay));
      
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api; 