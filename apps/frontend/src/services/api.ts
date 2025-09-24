import axios from 'axios';

// Use relative URLs to leverage Next.js proxy
const API_BASE_URL = '';

export const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 minutes for document processing
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Required for CSRF protection
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Always log errors, but less verbosely in production
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data
      });
    } else {
      console.error('API Error:', error.message, error.response?.status);
    }
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export default api;