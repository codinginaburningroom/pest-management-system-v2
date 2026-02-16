import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

// สร้าง axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor สำหรับ request
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor สำหรับ response
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.url}`, response.status);
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

// ==================== INITIALIZATION ====================
export const initDatabase = async () => {
  try {
    const response = await api.get('/health');
    console.log('API Health Check:', response);
    return true;
  } catch (error) {
    console.error('Failed to connect to API:', error);
    throw new Error('Cannot connect to backend API. Please check your network connection.');
  }
};

// ==================== FARM APIs ====================
export const getAllFarms = async () => {
  try {
    const response = await api.get('/farms');
    return response.data || response; // handle both {data: [...]} and [...]
  } catch (error) {
    console.error('Error fetching farms:', error);
    return [];
  }
};

export const getFarmById = async (farmId) => {
  try {
    const response = await api.get(`/farms/${farmId}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching farm:', error);
    return null;
  }
};

export const createFarm = async (farmData) => {
  try {
    const response = await api.post('/farms', farmData);
    return response.data?.farm_id || response.farm_id || response.insertId;
  } catch (error) {
    console.error('Error creating farm:', error);
    throw error;
  }
};

export const updateFarm = async (farmId, farmData) => {
  try {
    const response = await api.put(`/farms/${farmId}`, farmData);
    return response;
  } catch (error) {
    console.error('Error updating farm:', error);
    throw error;
  }
};

export const deleteFarm = async (farmId) => {
  try {
    const response = await api.delete(`/farms/${farmId}`);
    return response;
  } catch (error) {
    console.error('Error deleting farm:', error);
    throw error;
  }
};

// ==================== PLOT APIs ====================
export const getPlotsByFarm = async (farmId) => {
  try {
    const response = await api.get(`/farms/${farmId}/plots`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching plots:', error);
    return [];
  }
};

export const getPlotById = async (plotId) => {
  try {
    const response = await api.get(`/plots/${plotId}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching plot:', error);
    return null;
  }
};

export const createPlot = async (plotData) => {
  try {
    const response = await api.post('/plots', plotData);
    return response.data?.plot_id || response.plot_id || response.insertId;
  } catch (error) {
    console.error('Error creating plot:', error);
    throw error;
  }
};

export const updatePlot = async (plotId, plotData) => {
  try {
    const response = await api.put(`/plots/${plotId}`, plotData);
    return response;
  } catch (error) {
    console.error('Error updating plot:', error);
    throw error;
  }
};

export const deletePlot = async (plotId) => {
  try {
    const response = await api.delete(`/plots/${plotId}`);
    return response;
  } catch (error) {
    console.error('Error deleting plot:', error);
    throw error;
  }
};

// ==================== CROP APIs ====================
export const getAllCrops = async () => {
  try {
    const response = await api.get('/crops');
    return response.data || response;
  } catch (error) {
    console.error('Error fetching crops:', error);
    return [];
  }
};

export const getCropById = async (cropId) => {
  try {
    const response = await api.get(`/crops/${cropId}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching crop:', error);
    return null;
  }
};

// ==================== PLOT CROP APIs ====================
export const getActivePlotCrops = async (plotId) => {
  try {
    const response = await api.get(`/plots/${plotId}/crops/active`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching active plot crops:', error);
    return [];
  }
};

export const createPlotCrop = async (plotCropData) => {
  try {
    const response = await api.post('/plot-crops', plotCropData);
    return response.data?.plot_crop_id || response.plot_crop_id || response.insertId;
  } catch (error) {
    console.error('Error creating plot crop:', error);
    throw error;
  }
};

export const updatePlotCrop = async (plotCropId, plotCropData) => {
  try {
    const response = await api.put(`/plot-crops/${plotCropId}`, plotCropData);
    return response;
  } catch (error) {
    console.error('Error updating plot crop:', error);
    throw error;
  }
};

// ==================== PRODUCT APIs ====================
export const getAllProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data || response;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const getProductsForTarget = async (targetId) => {
  try {
    const response = await api.get(`/targets/${targetId}/products`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching products for target:', error);
    return [];
  }
};

export const getTargetsForProduct = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/targets`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching targets for product:', error);
    return [];
  }
};

// ==================== TARGET APIs ====================
export const getAllTargets = async () => {
  try {
    const response = await api.get('/targets');
    return response.data || response;
  } catch (error) {
    console.error('Error fetching targets:', error);
    return [];
  }
};

export const getTargetById = async (targetId) => {
  try {
    const response = await api.get(`/targets/${targetId}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching target:', error);
    return null;
  }
};

// ==================== MOA APIs ====================
export const getAllMoAGroups = async () => {
  try {
    const response = await api.get('/moa/groups');
    return response.data || response;
  } catch (error) {
    console.error('Error fetching MoA groups:', error);
    return [];
  }
};

export const getMoAGroupsBySystem = async (system) => {
  try {
    const response = await api.get(`/moa/groups/system/${system}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching MoA groups by system:', error);
    return [];
  }
};

export const checkMoARotation = async (plotCropId, targetId) => {
  try {
    const response = await api.get('/moa/check-rotation', {
      params: { plotCropId, targetId }
    });
    return response.data || response;
  } catch (error) {
    console.error('Error checking MoA rotation:', error);
    return { warning: false };
  }
};

export const getMoAUsageHistory = async (plotCropId, targetId, limit = 5) => {
  try {
    const response = await api.get('/moa/usage-history', {
      params: { plotCropId, targetId, limit }
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching MoA usage history:', error);
    return [];
  }
};

export const getRecommendedProducts = async (targetId, plotCropId, recentMoACodes = []) => {
  try {
    const response = await api.get('/moa/recommendations', {
      params: {
        targetId,
        plotCropId,
        recentMoACodes: Array.isArray(recentMoACodes) ? recentMoACodes.join(',') : recentMoACodes
      }
    });
    return response.data || response;
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return [];
  }
};

// ==================== APPLICATION LOG APIs ====================
export const getApplicationLogsByPlotCrop = async (plotCropId) => {
  try {
    const response = await api.get(`/plot-crops/${plotCropId}/application-logs`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching application logs:', error);
    return [];
  }
};

export const createApplicationLog = async (logData) => {
  try {
    const response = await api.post('/applications/logs', logData);
    return response.data?.log_id || response.log_id || response.insertId;
  } catch (error) {
    console.error('Error creating application log:', error);
    throw error;
  }
};

export const getApplicationLogById = async (logId) => {
  try {
    const response = await api.get(`/applications/logs/${logId}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching application log:', error);
    return null;
  }
};

export const updateApplicationLog = async (logId, logData) => {
  try {
    const response = await api.put(`/applications/logs/${logId}`, logData);
    return response;
  } catch (error) {
    console.error('Error updating application log:', error);
    throw error;
  }
};

export const deleteApplicationLog = async (logId) => {
  try {
    const response = await api.delete(`/applications/logs/${logId}`);
    return response;
  } catch (error) {
    console.error('Error deleting application log:', error);
    throw error;
  }
};

// ==================== APPLICATION ITEM APIs ====================
export const createApplicationItem = async (itemData) => {
  try {
    const response = await api.post('/applications/items', itemData);
    return response.data?.item_id || response.item_id || response.insertId;
  } catch (error) {
    console.error('Error creating application item:', error);
    throw error;
  }
};

export const getApplicationItemsByLog = async (logId) => {
  try {
    const response = await api.get(`/applications/logs/${logId}/items`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching application items:', error);
    return [];
  }
};

export const updateApplicationItem = async (itemId, itemData) => {
  try {
    const response = await api.put(`/applications/items/${itemId}`, itemData);
    return response;
  } catch (error) {
    console.error('Error updating application item:', error);
    throw error;
  }
};

export const deleteApplicationItem = async (itemId) => {
  try {
    const response = await api.delete(`/applications/items/${itemId}`);
    return response;
  } catch (error) {
    console.error('Error deleting application item:', error);
    throw error;
  }
};

// Export the api instance for custom calls if needed
export default api;