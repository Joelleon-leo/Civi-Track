import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const IP_ADDRESS = '192.168.1.100'; // Fallback
const BASE_URL = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${IP_ADDRESS}:5000/api`;
export const MEDIA_BASE_URL = BASE_URL.replace(/\/api$/, '');

export const toMediaUrl = (inputUrl) => {
  if (!inputUrl) return null;
  if (inputUrl.startsWith('http://') || inputUrl.startsWith('https://')) {
    return inputUrl;
  }
  return `${MEDIA_BASE_URL}${inputUrl.startsWith('/') ? '' : '/'}${inputUrl}`;
};

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
