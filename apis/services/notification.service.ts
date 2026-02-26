import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  INFO = 'INFO',
}

export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  relatedId?: string;
  relatedType?: string;
}

/**
 * Notification Service
 */
export const notificationService = {
  /**
   * Lấy tất cả notifications của user hiện tại (từ JWT token)
   */
  getNotifications: async (): Promise<NotificationResponse[]> => {
    const response = await apiClient.get<ApiResponse<NotificationResponse[]>>(
      '/notifications'
    );
    return response.data.data;
  },

  /**
   * Lấy notifications chưa đọc của user hiện tại
   */
  getUnreadNotifications: async (): Promise<NotificationResponse[]> => {
    const response = await apiClient.get<ApiResponse<NotificationResponse[]>>(
      '/notifications/unread'
    );
    return response.data.data;
  },

  /**
   * Đếm số notifications chưa đọc của user hiện tại
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<number>>(
      '/notifications/unread/count'
    );
    return response.data.data;
  },

  /**
   * Đánh dấu notification là đã đọc
   */
  markAsRead: async (notificationId: string): Promise<NotificationResponse> => {
    const response = await apiClient.post<ApiResponse<NotificationResponse>>(
      `/notifications/${notificationId}/read`
    );
    return response.data.data;
  },

  /**
   * Đánh dấu tất cả notifications là đã đọc
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(
      '/notifications/read-all'
    );
  },
};

