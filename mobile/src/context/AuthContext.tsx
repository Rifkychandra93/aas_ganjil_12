import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, getDefaultBaseUrl } from '../constants/config';
import { setApiBaseUrl } from '../services/api';
import { authService } from '../services/auth.service';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  serverUrl: string;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateServerUrl: (newUrl: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [serverUrl, setServerUrl] = useState<string>(getDefaultBaseUrl());

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [savedUrl, savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.API_BASE_URL),
          AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
        ]);

        if (savedUrl && !savedUrl.includes('192.168.1.19')) {
          setServerUrl(savedUrl);
          setApiBaseUrl(savedUrl);
        } else {
          const defaultUrl = getDefaultBaseUrl();
          setServerUrl(defaultUrl);
          setApiBaseUrl(defaultUrl);
          if (savedUrl?.includes('192.168.1.19')) {
            await AsyncStorage.setItem(STORAGE_KEYS.API_BASE_URL, defaultUrl);
          }
        }

        if (savedToken) {
          setToken(savedToken);
        }

        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.error('Error parsing stored user', e);
          }
        }
      } catch (err) {
        console.error('Inisialisasi auth gagal:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    setUser(res.user);
    setToken(res.token);
  };

  const register = async (name: string, email: string, pass: string) => {
    await authService.register(name, email, pass);
    // Otomatis login setelah registrasi berhasil
    await login(email, pass);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateServerUrl = async (newUrl: string) => {
    let cleanUrl = newUrl.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    if (!cleanUrl.endsWith('/api')) {
      cleanUrl = `${cleanUrl}/api`;
    }
    await AsyncStorage.setItem(STORAGE_KEYS.API_BASE_URL, cleanUrl);
    setServerUrl(cleanUrl);
    setApiBaseUrl(cleanUrl);
  };

  const refreshUser = async () => {
    try {
      const u = await authService.getMe();
      setUser(u);
    } catch (e) {
      console.warn('Gagal memperbarui data user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        serverUrl,
        login,
        register,
        logout,
        updateServerUrl,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
