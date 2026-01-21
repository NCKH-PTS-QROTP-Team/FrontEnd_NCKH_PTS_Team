import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';
import {
  QRGenerateRequest,
  QRResponse,
  QRVerifyRequest,
} from '../types/qr.types';

/**
 * QR Code Service
 */
export const qrService = {
  /**
   * Tạo QR code cho session
   */
  generate: async (request: QRGenerateRequest): Promise<QRResponse> => {
    const response = await apiClient.post<ApiResponse<QRResponse>>(
      '/qr/generate',
      request
    );
    return response.data.data;
  },

  /**
   * Lấy QR code hiện tại của session
   */
  getCurrent: async (sessionId: string): Promise<QRResponse> => {
    const response = await apiClient.get<ApiResponse<QRResponse>>(
      `/qr/session/${sessionId}`
    );
    return response.data.data;
  },

  /**
   * Verify QR token
   */
  verify: async (request: QRVerifyRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<boolean>>(
      '/qr/verify',
      request
    );
    return response.data.data;
  },
};

