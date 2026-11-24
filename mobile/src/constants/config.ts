import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// IP Komputer lokal saat ini pada jaringan Wi-Fi
export const LOCAL_DEV_IP = '192.168.1.4';
export const PORT = '5000';

export const getDefaultBaseUrl = (): string => {
  // Otomatis deteksi IP komputer dari host Expo jika aplikasi dijalankan via Expo Go
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  const detectedIp = hostUri ? hostUri.split(':')[0] : LOCAL_DEV_IP;

  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return `http://${detectedIp}:${PORT}/api`;
  }
  return `http://localhost:${PORT}/api`;
};

export const STORAGE_KEYS = {
  TOKEN: '@concertify_token',
  USER: '@concertify_user',
  API_BASE_URL: '@concertify_api_base_url',
};

export const getSavedBaseUrl = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.API_BASE_URL);
    if (saved) return saved;
  } catch (e) {
    console.error('Gagal membaca saved base url', e);
  }
  return getDefaultBaseUrl();
};
