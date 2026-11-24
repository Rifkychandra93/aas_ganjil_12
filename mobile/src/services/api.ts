import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDefaultBaseUrl, STORAGE_KEYS } from '../constants/config';

let cachedBaseUrl = getDefaultBaseUrl();

export const setApiBaseUrl = (newUrl: string) => {
  cachedBaseUrl = newUrl;
  api.defaults.baseURL = newUrl;
};

// Inisialisasi awal membaca base URL dari storage
AsyncStorage.getItem(STORAGE_KEYS.API_BASE_URL).then((saved) => {
  if (saved && !saved.includes('192.168.1.19')) {
    cachedBaseUrl = saved;
    api.defaults.baseURL = saved;
  }
}).catch(() => {});

const api: AxiosInstance = axios.create({
  baseURL: cachedBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    // Sinkronisasi baseURL jika ada perubahan
    if (config.baseURL !== cachedBaseUrl) {
      config.baseURL = cachedBaseUrl;
    }

    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Gagal mengambil token auth dari storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Sesi login telah berakhir atau tidak valid');
    }
    return Promise.reject(error);
  }
);

export default api;
