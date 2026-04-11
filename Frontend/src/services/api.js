import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ HEALTH CHECK ============
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// ============ DASHBOARD ============
export const dashboardApi = {
  getSummary: async () => {
    try {
      const response = await apiClient.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  },
};

// ============ INVENTORY ============
export const inventoryApi = {
  getLowStock: async () => {
    try {
      const response = await apiClient.get('/inventory/low-stock');
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock:', error);
      throw error;
    }
  },

  getBranchInventory: async (branchId) => {
    try {
      const response = await apiClient.get(`/inventory/branch/${branchId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching inventory for ${branchId}:`, error);
      throw error;
    }
  },

  getValuation: async () => {
    try {
      const response = await apiClient.get('/inventory/valuation');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory valuation:', error);
      throw error;
    }
  },
};

// ============ SALES ============
export const salesApi = {
  getByCategory: async () => {
    try {
      const response = await apiClient.get('/sales/by-category');
      return response.data;
    } catch (error) {
      console.error('Error fetching sales by category:', error);
      throw error;
    }
  },

  getByBranch: async () => {
    try {
      const response = await apiClient.get('/sales/by-branch');
      return response.data;
    } catch (error) {
      console.error('Error fetching branch performance:', error);
      throw error;
    }
  },

  getRecent: async (days = 7) => {
    try {
      const response = await apiClient.get('/sales/recent', { params: { days } });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent sales:', error);
      throw error;
    }
  },
};

// ============ LOGISTICS ============
export const logisticsApi = {
  getDeliverySummary: async () => {
    try {
      const response = await apiClient.get('/deliveries/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery summary:', error);
      throw error;
    }
  },

  getDelayedDeliveries: async () => {
    try {
      const response = await apiClient.get('/deliveries/delayed');
      return response.data;
    } catch (error) {
      console.error('Error fetching delayed deliveries:', error);
      throw error;
    }
  },

  getFleetEfficiency: async () => {
    try {
      const response = await apiClient.get('/fleet/efficiency');
      return response.data;
    } catch (error) {
      console.error('Error fetching fleet efficiency:', error);
      throw error;
    }
  },
};

// ============ STOCK API ============
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
      const response = await apiClient.get(`/stocks/${symbol}/analysis`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock analysis:', error);
      throw error;
    }
  },

  getStockHistory: async (symbol) => {
    try {
      const response = await apiClient.get(`/stocks/${symbol}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock history:', error);
      throw error;
    }
  }
};

// ============ PORTFOLIO API ============
export const portfolioApi = {
  getPortfolio: async (userId) => {
    try {
      const response = await apiClient.get('/portfolio', {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },

  getTransactions: async (userId) => {
    try {
      const response = await apiClient.get('/transactions', {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  buyStock: async (userId, symbol, quantity) => {
    try {
      const response = await apiClient.post('/portfolio/buy', {
        user_id: userId,
        symbol,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error buying stock:', error);
      throw error;
    }
  },

  sellStock: async (userId, symbol, quantity) => {
    try {
      const response = await apiClient.post('/portfolio/sell', {
        user_id: userId,
        symbol,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  }
};
