// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'https://myrtis-reparable-heliotypically.ngrok-free.dev/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'  // ← THIS BYPASSES THE NGROK WARNING!
  }
});

// Add token to requests
api.interceptors.request.use(
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

// Handle response errors (e.g., token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      const currentPath = window.location.pathname;
      
      // Only clear storage and redirect if not already on login page
      if (!currentPath.includes('/login') && !currentPath.includes('/signup') && currentPath !== '/') {
        console.log('Token expired or invalid, but keeping user on page');
        // Don't automatically logout - just let the component handle it
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data)
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile')
};

// Review API
export const reviewAPI = {
  getStatus: () => api.get('/review/status'),
  startReview: () => api.post('/review/start'),
  getPending: () => api.get('/review/pending'),
  submitReview: (reviewId, reviewText) => api.post(`/review/submit/${reviewId}`, { reviewText }),
  getHistory: () => api.get('/review/history')
};

// Admin API
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  searchUsers: (query) => api.get(`/admin/users/search?query=${query}`),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  adjustBalance: (userId, amount, operation) => api.post(`/admin/users/${userId}/balance`, { amount, operation }),
  setTargetBalance: (userId, targetBalance) => api.post(`/admin/users/${userId}/target-balance`, { targetBalance }),
  clearTargetBalance: (userId) => api.post(`/admin/users/${userId}/clear-target-balance`),
  assignSpecialReview: (userId, data) => api.post(`/admin/users/${userId}/special-review`, data),
  toggleFreeze: (userId) => api.post(`/admin/users/${userId}/freeze`),
  resetAccount: (userId) => api.post(`/admin/users/${userId}/reset`),
  toggleWithdrawal: (userId) => api.post(`/admin/users/${userId}/toggle-withdrawal`),
  unlockWithdrawalDetails: (userId) => api.post(`/admin/users/${userId}/unlock-withdrawal`),
  changeUserPassword: (userId, newPassword) => api.post(`/admin/users/${userId}/change-password`, { newPassword }),
  getAllProducts: () => api.get('/admin/products'),
  addProduct: (data) => api.post('/admin/products', data),
  getAllWithdrawals: () => api.get('/admin/withdrawals'),
  getUserWithdrawals: (userId) => api.get(`/admin/users/${userId}/withdrawals`),
  updateWithdrawal: (withdrawalId, data) => api.put(`/admin/withdrawals/${withdrawalId}`, data)
};

// Withdrawal API
export const withdrawalAPI = {
  getDetails: () => api.get('/withdrawal/details'),
  setDetails: (data) => api.post('/withdrawal/set-details', data),
  submitRequest: () => api.post('/withdrawal/request'),
  getHistory: () => api.get('/withdrawal/history')
};

export default api;