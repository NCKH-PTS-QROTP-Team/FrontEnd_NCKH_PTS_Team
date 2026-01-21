import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Base URL - có thể config từ env
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api' 
  : 'https://your-production-api.com/api';

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage key
const TOKEN_KEY = 'auth_token';

/**
 * Lưu token vào secure storage
 */
export const setAuthToken = async (token: string | null): Promise<void> => {
  try {
    if (token) {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } else {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    }
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

/**
 * Lấy token từ secure storage
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Xóa token
 */
export const removeAuthToken = async (): Promise<void> => {
  await setAuthToken(null);
};

// Request interceptor - Thêm token vào header
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired hoặc invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Xóa token và redirect về login
      await removeAuthToken();
      
      // Emit event để logout (có thể dùng với context hoặc event emitter)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        isNetworkError: true,
      });
    }

    // Handle server errors
    const errorMessage = 
      (error.response.data as any)?.message || 
      error.message || 
      'Đã xảy ra lỗi không xác định';
    
    return Promise.reject({
      message: errorMessage,
      status: error.response.status,
      data: error.response.data,
    });
  }
);

export default apiClient;

