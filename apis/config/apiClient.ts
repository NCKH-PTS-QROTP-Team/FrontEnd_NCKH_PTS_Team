import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Base URL - có thể config từ env
// Sử dụng IP local của máy tính chạy backend thay vì localhost cho mobile
// 
// 📌 HƯỚNG DẪN TÌM IP:
// - Windows: chạy lệnh 'ipconfig' → tìm "IPv4 Address" (không phải 127.0.0.1)
// - Mac/Linux: chạy lệnh 'ifconfig' → tìm "inet" (không phải 127.0.0.1)
// - Hoặc dùng environment variable: EXPO_PUBLIC_API_URL=http://YOUR_IP:8080/api
//
// ⚠️ LƯU Ý:
// - Điện thoại và máy tính PHẢI cùng mạng Wi-Fi
// - Backend phải đang chạy trên IP đó (port 8080)
// - Firewall có thể chặn kết nối, cần allow port 8080
const getApiBaseUrl = () => {
  // Ưu tiên: Environment variable (cho production hoặc custom config)
  // Có thể set trong .env hoặc .env.local:
  // EXPO_PUBLIC_API_URL=http://192.168.1.7:8080/api
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Development mode hoặc khi serve từ dist folder
  if (__DEV__ || (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.startsWith('192.168.') ||
       window.location.hostname.startsWith('10.')))) {
    if (Platform.OS === 'web') {
      return 'http://localhost:8080/api';
    } else if (Platform.OS === 'android') {
      // 10.0.2.2 là địa chỉ đặc biệt cho Android Emulator trỏ về localhost của máy host
      // Nếu dùng thiết bị thật, thay bằng IP của máy tính chạy backend
      // Để tìm IP: chạy lệnh 'ipconfig' (Windows) hoặc 'ifconfig' (Mac/Linux)
      // Lấy IP từ IPv4 Address (không phải 127.0.0.1)
      return 'http://192.168.1.7:8080/api';
    } else if (Platform.OS === 'ios') {
      // iOS Simulator có thể dùng localhost
      // iOS thiết bị thật cần IP của máy tính (giống Android)
      return 'http://192.168.1.7:8080/api';
    } else {
      // Fallback cho các platform khác
      return 'http://192.168.1.7:8080/api';
    }
  }
  
  // Production fallback - CHỈ dùng khi thực sự deploy production
  // Nếu chạy local nhưng build production, vẫn dùng localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Nếu đang chạy local (localhost, 127.0.0.1, local IP), dùng localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      return 'http://localhost:8080/api';
    }
  }
  
  // Production URL - CHỈ dùng khi thực sự deploy lên production domain
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug: Log API URL để kiểm tra
if (typeof window !== 'undefined') {
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('🌐 Current hostname:', window.location.hostname);
  console.log('🌐 __DEV__:', __DEV__);
}

// Export để native download file (cần full URL cho fetch)
export const getExportBaseUrl = () => apiClient.defaults.baseURL || API_BASE_URL;

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage keys
const TOKEN_KEY = 'auth_token';
const CURRENT_USER_KEY = 'current_user';

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
  await setCurrentUserProfile(null);
};

/**
 * Lưu thông tin user hiện tại (để header web/mobile dùng chung)
 */
export const setCurrentUserProfile = async (user: any | null): Promise<void> => {
  try {
    if (user) {
      const json = JSON.stringify(user);
      if (Platform.OS === 'web') {
        localStorage.setItem(CURRENT_USER_KEY, json);
      } else {
        await SecureStore.setItemAsync(CURRENT_USER_KEY, json);
      }
    } else {
      if (Platform.OS === 'web') {
        localStorage.removeItem(CURRENT_USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
      }
    }
  } catch (error) {
    console.error('Error saving current user profile:', error);
  }
};

/**
 * Đọc thông tin user hiện tại
 */
export const getCurrentUserProfile = async (): Promise<any | null> => {
  try {
    let json: string | null;
    if (Platform.OS === 'web') {
      json = localStorage.getItem(CURRENT_USER_KEY);
    } else {
      json = await SecureStore.getItemAsync(CURRENT_USER_KEY);
    }
    if (!json) return null;
    return JSON.parse(json);
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
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
    // Backend trả về ErrorResponse với field 'detail' chứa message chi tiết
    // Ưu tiên lấy từ detail, sau đó mới lấy từ message
    const errorData = error.response.data as any;
    const errorMessage = 
      errorData?.detail ||  // Message chi tiết từ backend (ưu tiên)
      errorData?.message || 
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

