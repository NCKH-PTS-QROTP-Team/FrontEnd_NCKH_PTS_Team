import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';
import {
  AttendanceRecordRequest,
  AttendanceRecordResponse,
  AttendanceSessionRequest,
  AttendanceSessionResponse,
} from '../types/attendance.types';
import { PaginatedResponse } from '../types/api.types';

/**
 * Attendance Service
 */
export const attendanceService = {
  /**
   * Tạo attendance session
   */
  createSession: async (
    request: AttendanceSessionRequest
  ): Promise<AttendanceSessionResponse> => {
    const response = await apiClient.post<ApiResponse<AttendanceSessionResponse>>(
      '/attendance-sessions',
      request
    );
    return response.data.data;
  },

  /**
   * Kết thúc session
   */
  completeSession: async (sessionId: string): Promise<AttendanceSessionResponse> => {
    const response = await apiClient.post<ApiResponse<AttendanceSessionResponse>>(
      `/attendance-sessions/${sessionId}/complete`
    );
    return response.data.data;
  },

  /**
   * Lấy session theo ID
   */
  getSessionById: async (sessionId: string): Promise<AttendanceSessionResponse> => {
    const response = await apiClient.get<ApiResponse<AttendanceSessionResponse>>(
      `/attendance-sessions/${sessionId}`
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách sessions
   */
  getSessions: async (params?: {
    classId?: string;
    subjectId?: string;
    teacherId?: string;
    active?: boolean;
  }): Promise<AttendanceSessionResponse[]> => {
    const response = await apiClient.get<ApiResponse<AttendanceSessionResponse[]>>(
      '/attendance-sessions',
      { params }
    );
    return response.data.data;
  },

  /**
   * Điểm danh (create attendance record)
   */
  createRecord: async (
    request: AttendanceRecordRequest
  ): Promise<AttendanceRecordResponse> => {
    const response = await apiClient.post<ApiResponse<AttendanceRecordResponse>>(
      '/attendance-records',
      request
    );
    return response.data.data;
  },

  /**
   * Lấy attendance record theo ID
   */
  getRecordById: async (recordId: string): Promise<AttendanceRecordResponse> => {
    const response = await apiClient.get<ApiResponse<AttendanceRecordResponse>>(
      `/attendance-records/${recordId}`
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách records
   */
  getRecords: async (params?: {
    sessionId?: string;
    studentId?: string;
    classId?: string;
    subjectId?: string;
  }): Promise<AttendanceRecordResponse[]> => {
    const response = await apiClient.get<ApiResponse<AttendanceRecordResponse[]>>(
      '/attendance-records',
      { params }
    );
    return response.data.data;
  },
};

