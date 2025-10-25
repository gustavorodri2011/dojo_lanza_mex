import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

export const membersAPI = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
};

export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  getOverdue: () => api.get('/payments/overdue'),
  downloadReceipt: (id) => api.get(`/payments/${id}/receipt`, { responseType: 'blob' }),
};

export const alertsAPI = {
  sendOverdueAlerts: () => api.post('/alerts/send-overdue'),
  scheduleAlerts: (config) => api.post('/alerts/schedule', config),
  testEmailConnection: () => api.get('/alerts/test-email'),
};

export const statsAPI = {
  getDashboardStats: () => api.get('/stats/dashboard'),
  getMonthlyRevenue: () => api.get('/stats/monthly-revenue'),
  getBeltDistribution: () => api.get('/stats/belt-distribution'),
  getPaymentMethodStats: () => api.get('/stats/payment-methods')
};

export const reportsAPI = {
  getIncomeReport: (params) => api.get('/reports/income', { params }),
  getMembersReport: (params) => api.get('/reports/members', { params }),
  getOverdueReport: (params) => api.get('/reports/overdue', { params }),
  downloadIncomeExcel: (params) => api.get('/reports/income', { params: { ...params, format: 'excel' }, responseType: 'blob' }),
  downloadMembersExcel: (params) => api.get('/reports/members', { params: { ...params, format: 'excel' }, responseType: 'blob' }),
  downloadOverdueExcel: (params) => api.get('/reports/overdue', { params: { ...params, format: 'excel' }, responseType: 'blob' })
};

export const classesAPI = {
  getAll: (params) => api.get('/classes', { params }),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  recordAttendance: (data) => api.post('/classes/attendance', data),
  getAttendance: (params) => api.get('/classes/attendance', { params })
};

export const graduationsAPI = {
  getAll: (params) => api.get('/graduations', { params }),
  create: (data) => api.post('/graduations', data),
  update: (id, data) => api.put(`/graduations/${id}`, data),
  delete: (id) => api.delete(`/graduations/${id}`)
};

export const beltsAPI = {
  getAll: () => api.get('/belts')
};

export default api;