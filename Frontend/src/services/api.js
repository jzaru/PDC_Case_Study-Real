import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================
// HEALTH
// ========================
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// ========================
// DASHBOARD
// ========================
export const dashboardApi = {
  getSummary: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },
};

// ========================
// STOCKS
// ========================
export const stockApi = {
  getAllStocks: async () => {
    const response = await apiClient.get('/stocks');
    return response.data;
  },

  getStockHistory: async (company) => {
    const response = await apiClient.get(`/stocks/${company}`);
    return response.data;
  },
};

// ========================
// PORTFOLIO
// ========================
export const portfolioApi = {
  getPortfolio: async () => {
    const response = await apiClient.get('/portfolio');
    return response.data;
  },

  getTransactions: async () => {
    const response = await apiClient.get('/transactions');
    return response.data;
  },

  buyStock: async (payload) => {
    const response = await apiClient.post('/buy', payload);
    return response.data;
  },

  sellStock: async (payload) => {
    const response = await apiClient.post('/sell', payload);
    return response.data;
  },
};

// ========================
// BALANCE
// ========================
export const balanceApi = {
  getBalance: async () => {
    const response = await apiClient.get('/balance');
    return response.data;
  },

  addBalance: async (amount) => {
    const response = await apiClient.post('/balance/add', { amount });
    return response.data;
  },

  subtractBalance: async (amount) => {
    const response = await apiClient.post('/balance/subtract', { amount });
    return response.data;
  },
};

// ========================
// SIMULATION
// ========================
export const simulationApi = {
  startSimulation: async () => {
    const response = await apiClient.post('/simulation/start');
    return response.data;
  },

  stopSimulation: async () => {
    const response = await apiClient.post('/simulation/stop');
    return response.data;
  },

  getSimulationStatus: async () => {
    const response = await apiClient.get('/simulation/status');
    return response.data;
  },
};

// ========================
// 🔥 PERFORMANCE / WORKERS (PDC)
// ========================
export const performanceApi = {
  setWorkers: async (workers) => {
    const response = await apiClient.post('/workers', { workers });
    return response.data;
  },

  getWorkers: async () => {
    const response = await apiClient.get('/workers');
    return response.data;
  },

  // 🔥 ML TRAINING TIME
  getMLStats: async () => {
    const response = await apiClient.get('/ml-stats');
    return response.data;
  },

  // ========================
  // 🔥 NEW: TRAINING MODE
  // ========================
  setTrainingMode: async (mode) => {
    const response = await apiClient.post('/training-mode', { mode });
    return response.data;
  },

  getTrainingMode: async () => {
    const response = await apiClient.get('/training-mode');
    return response.data;
  },
};