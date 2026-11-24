import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;

    if (!data.success && data.statusCode >= 400) {
      throw new Error(data.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
    }

    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user;

    if (!token || !user) {
      throw new Error(data.message || 'Respon login tidak lengkap dari server.');
    }

    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return { user, token };
  },

  register: async (name: string, email: string, password: string): Promise<any> => {
    const response = await api.post('/auth/register', { name, email, password });
    const data = response.data;

    if (!data.success && data.statusCode >= 400) {
      throw new Error(data.message || 'Pendaftaran akun gagal.');
    }

    return data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/me');
    const user = response.data?.user || response.data?.data;
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return user;
    }
    throw new Error('Gagal mengambil data user');
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  },
};
