import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';
import {
  OTPGenerateRequest,
  OTPResponse,
  OTPVerifyRequest,
} from '../types/otp.types';

/**
 * OTP Service
 */
export const otpService = {
  /**
   * Tạo mã OTP cho session
   */
  generate: async (request: OTPGenerateRequest): Promise<OTPResponse> => {
    const response = await apiClient.post<ApiResponse<OTPResponse>>(
      '/otp/generate',
      request
    );
    return response.data.data;
  },

  /**
   * Lấy OTP hiện tại của session
   */
  getCurrent: async (sessionId: string): Promise<OTPResponse> => {
    const response = await apiClient.get<ApiResponse<OTPResponse>>(
      `/otp/session/${sessionId}`
    );
    return response.data.data;
  },

  /**
   * Verify mã OTP
   */
  verify: async (request: OTPVerifyRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<boolean>>(
      '/otp/verify',
      request
    );
    return response.data.data;
  },
};

