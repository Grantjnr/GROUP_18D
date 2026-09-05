export const API_BASE_URL = 'http://192.168.1.77:8000';

export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const API_PREDICT_URL = buildApiUrl('/api/predict/');
