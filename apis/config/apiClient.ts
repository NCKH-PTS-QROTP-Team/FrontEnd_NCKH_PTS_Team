import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Base URL strategy:
// - Bắt buộc sử dụng cấu hình từ file .env (EXPO_PUBLIC_API_URL) để đồng nhất.
// - Web: fallback về hostname hiện tại nếu không có .env.
const getApiBaseUrl = () => {
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  const envWebApiUrl = process.env.EXPO_PUBLIC_API_URL_WEB;

  if (Platform.OS === 'web') {
    if (envWebApiUrl) return envWebApiUrl;
    if (envApiUrl) return envApiUrl;

    if (typeof window !== 'undefined' && window.location) {
      const host = window.location.hostname;
      // Kiểm tra nếu là localhost hoặc môi trường phát triển local/LAN
      const isLocalhost = host === 'localhost' || 
                          host === '127.0.0.1' || 
                          host === '0.0.0.0' || 
                          host.startsWith('192.168.') || 
                          host.startsWith('10.') || 
                          host.startsWith('172.');
      
      if (isLocalhost) {
        const normalizedHost = host === '0.0.0.0' ? 'localhost' : host;
        return `http://${normalizedHost}:8080/api`;
      } else {
        // Môi trường production (ví dụ Vercel) khi không có biến môi trường
        return 'https://shark-app-bcpqf.ondigitalocean.app/api';
      }
    }
    return 'https://shark-app-bcpqf.ondigitalocean.app/api';
  }

  // Native (iOS/Android): Ưu tiên tuyệt đối dùng file .env
  if (envApiUrl) {
    return envApiUrl;
  }

  // Fallback duy nhất nếu bạn vô tình xóa mất file .env
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api'; // Android Emulator
  }

  return 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug: Log API URL để kiểm tra
console.log('═══════════════════════════════════════');
console.log('🌐 API Configuration Loaded');
console.log('   API Base URL:', API_BASE_URL);
console.log('   Platform:', Platform.OS);
console.log('   Dev Mode:', __DEV__);
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
  console.log('   Current hostname:', window.location.hostname);
}
console.log('═══════════════════════════════════════');

// Export để native download file (cần full URL cho fetch)
export const getExportBaseUrl = () => apiClient.defaults.baseURL || API_BASE_URL;

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
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
 * Lưu refresh token
 */
export const setRefreshToken = async (token: string | null): Promise<void> => {
  try {
    if (token) {
      if (Platform.OS === 'web') {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
      }
    } else {
      if (Platform.OS === 'web') {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    }
  } catch (error) {
    console.error('Error saving refresh token:', error);
  }
};

/**
 * Lấy refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Xóa cả 2 token
 */
export const removeAuthToken = async (): Promise<void> => {
  await setAuthToken(null);
  await setRefreshToken(null);
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

      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          // Dùng axios cơ bản để tránh vòng lặp interceptor
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: refreshToken,
          });

          if (res.data?.success && res.data?.data) {
            const newAccessToken = res.data.data.accessToken;
            const newRefreshToken = res.data.data.refreshToken;

            await setAuthToken(newAccessToken);
            await setRefreshToken(newRefreshToken);

            // Cập nhật lại header của request bị lỗi
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            // Thực hiện lại request ban đầu
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Lỗi khi refresh token:', refreshError);
        // Refresh token cũng hết hạn hoặc lỗi -> xóa hết
      }

      // Xóa token và redirect về login nếu refresh thất bại
      await removeAuthToken();

      // Emit event để logout
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error('❌ Network Error Details:');
      console.error('   Message:', error.message);
      console.error('   Code:', error.code);
      console.error('   API URL:', API_BASE_URL);
      console.error('   Platform:', Platform.OS);

      // Provide specific debugging hints
      if (error.code === 'ECONNREFUSED') {
        console.warn('   🔴 Connection refused - Backend không chạy trên port 8080');
      } else if (error.code === 'ENOTFOUND') {
        console.warn('   🔴 Host not found - IP address sai hoặc không accessible');
      } else if (error.code === 'ETIMEDOUT') {
        console.warn('   🔴 Connection timeout - Firewall chặn hoặc network down');
      }

      return Promise.reject({
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        isNetworkError: true,
        debugInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          apiUrl: API_BASE_URL,
          platform: Platform.OS,
        },
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

