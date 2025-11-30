import axios from 'axios';

console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not set!');
}

console.log('Using API_BASE_URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API Response Interceptor:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  error => {
    console.error('API Error Interceptor:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Areas
export const areasAPI = {
  getAll: () => api.get('/areas'),
  getById: (id) => api.get(`/areas/${id}`),
  create: (data) => api.post('/areas', data),
  update: (id, data) => api.put(`/areas/${id}`, data),
  delete: (id) => api.delete(`/areas/${id}`),
};

// Citizens
export const citizensAPI = {
  getAll: () => api.get('/citizens'),
  getById: (id) => api.get(`/citizens/${id}`),
  getByArea: (areaId) => api.get(`/citizens?area_id=${areaId}`),
  create: (data) => api.post('/citizens', data),
  update: (id, data) => api.put(`/citizens/${id}`, data),
  delete: (id) => api.delete(`/citizens/${id}`),
};

// Bills
export const billsAPI = {
  getAll: () => api.get('/bills'),
  getById: (id) => api.get(`/bills/${id}`),
  getByCitizen: (citizenId) => api.get(`/bills?citizen_id=${citizenId}`),
  getStatistics: () => api.get('/bills?statistics=true'),
  create: (data) => api.post('/bills', data),
  updateStatus: (id, status) => api.put(`/bills/${id}`, { status }),
  delete: (id) => api.delete(`/bills/${id}`),
};

// Payments
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getByBill: (billId) => api.get(`/payments?bill_id=${billId}`),
  getStatistics: () => api.get('/payments?statistics=true'),
  create: (data) => api.post('/payments', data),
};

// Waste
export const wasteAPI = {
  getAll: () => api.get('/waste'),
  getByCategory: (category) => api.get(`/waste?category=${category}`),
  getStatistics: () => api.get('/waste?statistics=true'),
  create: (data) => api.post('/waste', data),
  update: (id, data) => api.put(`/waste/${id}`, data),
  delete: (id) => api.delete(`/waste/${id}`),
};

// Bins
export const binsAPI = {
  getAll: () => api.get('/bins'),
  getByArea: (areaId) => api.get(`/bins?area_id=${areaId}`),
  create: (data) => api.post('/bins', data),
  update: (id, data) => api.put(`/bins/${id}`, data),
  updateFillLevel: (id, fillLevel) => api.put(`/bins/${id}`, { fill_level: fillLevel }),
  delete: (id) => api.delete(`/bins/${id}`),
};

// Crew
export const crewAPI = {
  getAll: () => api.get('/crew'),
  getByArea: (areaId) => api.get(`/crew?area_id=${areaId}`),
  create: (data) => api.post('/crew', data),
  update: (id, data) => api.put(`/crew/${id}`, data),
  delete: (id) => api.delete(`/crew/${id}`),
};

// Schedules
export const schedulesAPI = {
  getAll: () => api.get('/schedules'),
  getByArea: (areaId) => api.get(`/schedules?area_id=${areaId}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
};

// Recycling Centers
export const centersAPI = {
  getAll: () => api.get('/centers'),
  create: (data) => api.post('/centers', data),
  update: (id, data) => api.put(`/centers/${id}`, data),
  delete: (id) => api.delete(`/centers/${id}`),
};
