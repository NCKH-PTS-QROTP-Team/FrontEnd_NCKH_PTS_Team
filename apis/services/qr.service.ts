import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';
import {
  GenerateQRRequest,
  QRCodeResponse,
  VerifyQRRequest,
} from '../types/qr.types';

/**
 * QR Code Service
 */
export const qrService = {
  /**
   * Tạo QR code mới cho session
   */
  generateQR: async (
    request: GenerateQRRequest
  ): Promise<QRCodeResponse> => {
    const response = await apiClient.post<ApiResponse<QRCodeResponse>>(
      '/qr/generate',
      request
    );
    return response.data.data;
  },

  /**
   * Lấy QR code ACTIVE hiện tại của session
   */
  getCurrentQR: async (sessionId: string): Promise<QRCodeResponse> => {
    const response = await apiClient.get<ApiResponse<QRCodeResponse>>(
      `/qr/session/${sessionId}`
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách tất cả QR codes của session
   */
  getQRCodesBySession: async (
    sessionId: string
  ): Promise<QRCodeResponse[]> => {
    const response = await apiClient.get<ApiResponse<QRCodeResponse[]>>(
      `/qr/session/${sessionId}/all`
    );
    return response.data.data;
  },

  /**
   * Verify QR code
   */
  verifyQR: async (request: VerifyQRRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<boolean>>(
      '/qr/verify',
      request
    );
    return response.data.data;
  },
};
