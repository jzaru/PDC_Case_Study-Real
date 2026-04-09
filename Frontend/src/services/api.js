import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stock APIs
export const stockApi = {
  getAllStocks: async () => {
    try {
      const response = await apiClient.get('/stocks');
      return response.data;
    } catch (error) {
      console.error('Error fetching stocks:', error);
      throw error;
    }
  },

  getStockAnalysis: async (symbol) => {
    try {
      const response = await apiClient.get(`/stocks/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching analysis for ${symbol}:`, error);
      throw error;
    }
  },

  getStockHistory: async (symbol, limit = 20) => {
    try {
      const response = await apiClient.get(`/stocks/${symbol}/history`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for ${symbol}:`, error);
      throw error;
    }
  },

  getAllAnalysis: async () => {
    try {
      const response = await apiClient.get('/analysis/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching all analysis:', error);
      throw error;
    }
  },
};

// Portfolio APIs
export const portfolioApi = {
  getPortfolio: async (userId) => {
    try {
      const response = await apiClient.get(`/portfolio/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching portfolio for ${userId}:`, error);
      throw error;
    }
  },

  buyStock: async (userId, symbol, quantity) => {
    try {
      const response = await apiClient.post('/buy', {
        symbol,
        quantity,
      }, {
        params: { user_id: userId },
      });
      return response.data;
    } catch (error) {
      console.error(`Error buying ${symbol}:`, error);
      throw error;
    }
  },

  sellStock: async (userId, symbol, quantity) => {
    try {
      const response = await apiClient.post('/sell', {
        symbol,
        quantity,
      }, {
        params: { user_id: userId },
      });
      return response.data;
    } catch (error) {
      console.error(`Error selling ${symbol}:`, error);
      throw error;
    }
  },

  getTransactions: async (userId, limit = 50) => {
    try {
      const response = await apiClient.get(`/transactions/${userId}`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching transactions for ${userId}:`, error);
      throw error;
    }
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default apiClient;
