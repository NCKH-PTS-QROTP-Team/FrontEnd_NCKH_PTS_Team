import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';

/**
 * Schedule Response
 */
export interface Schedule {
  id: string;
  classId: string;
  classCode: string;
  className: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: number; // 1-7 (Monday-Sunday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
  date?: string; // yyyy-MM-dd
  scheduleType?: string; // "CLASS" or "EXAM"
  createdAt: string;
}

/**
 * Schedule Request
 */
export interface CreateScheduleRequest {
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
}

export interface UpdateScheduleRequest {
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  room?: string;
}

/**
 * Schedule Service
 */
export const scheduleService = {
  /**
   * Get all schedules or filter by class/teacher
   */
  getSchedules: async (params?: {
    classId?: string;
    teacherId?: string;
    scheduleType?: 'CLASS' | 'EXAM';
    fromDate?: string;
    toDate?: string;
  }): Promise<Schedule[]> => {
    const response = await apiClient.get<ApiResponse<Schedule[]>>('/schedules', { params });
    return response.data.data;
  },
  
  /**
   * Get schedule by ID
   */
  getScheduleById: async (id: string): Promise<Schedule> => {
    const response = await apiClient.get<ApiResponse<Schedule>>(`/schedules/${id}`);
    return response.data.data;
  },
  
  /**
   * Create schedule
   */
  createSchedule: async (request: CreateScheduleRequest): Promise<Schedule> => {
    const response = await apiClient.post<ApiResponse<Schedule>>('/schedules', request);
    return response.data.data;
  },
  
  /**
   * Update schedule
   */
  updateSchedule: async (id: string, request: UpdateScheduleRequest): Promise<Schedule> => {
    const response = await apiClient.put<ApiResponse<Schedule>>(`/schedules/${id}`, request);
    return response.data.data;
  },
  
  /**
   * Delete schedule
   */
  deleteSchedule: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedules/${id}`);
  },
};

