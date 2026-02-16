// API Configuration

const getApiUrl = () => {
  if (__DEV__) {
    // 🔥 ใช้ IP เครื่อง backend ของคุณ
    return 'http://10.201.36.101:3000/api';
  }

  // Production
  return 'https://your-production-api.com/api';
};

export const API_BASE_URL = getApiUrl();
export const API_TIMEOUT = 10000; // 10 seconds

export default {
  API_BASE_URL,
  API_TIMEOUT
};
