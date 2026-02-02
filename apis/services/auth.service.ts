import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';
import { LoginRequest, LoginResponse, User } from '../types/auth.types';
import { setAuthToken, removeAuthToken, setCurrentUserProfile } from '../config/apiClient';

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Đăng nhập
   */
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      request
    );
    
    if (response.data.success && response.data.data.token) {
      // Lưu token vào secure storage
      await setAuthToken(response.data.data.token);
      // Lưu luôn profile để header dùng lại
      const data = response.data.data;
      await setCurrentUserProfile({
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      });
    }
    
    return response.data.data;
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    await removeAuthToken();
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },
};

