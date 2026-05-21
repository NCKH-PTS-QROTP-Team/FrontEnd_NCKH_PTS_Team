import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';

import {
  ScheduleResponse as ScheduleResponseImport,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ExcludeScheduleRequest,
  BulkExcludeRangeRequest,
  BulkInsertScheduleRequest,
} from '../types/schedule.types';

/**
 * Schedule Response
 */
export interface Schedule {
  id: string;
  courseId?: string | null;
  courseName?: string | null;
  classId: string;
  classCode: string;
  className: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: number; // 2-8 (Mon-Sun)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
  date?: string; // yyyy-MM-dd (single-occurrence date)
  scheduleType?: 'CLASS' | 'EXAM';
  pattern?: 'RECURRING_WEEKLY' | 'ONE_TIME';
  createdAt: string;
  startDate?: string | null;
  endDate?: string | null;
  excludedDates?: string[];
}


/**
 * Schedule Service
 */
export const scheduleService = {
  /**
   * Get all schedules
   */
  getAllSchedules: async (): Promise<Schedule[]> => {
    const response = await apiClient.get<ApiResponse<Schedule[]>>('/schedules');
    return response.data.data;
  },

  /**
   * Get schedules specifically for a student (enrolled courses only)
   */
  getStudentSchedules: async (studentId: string): Promise<Schedule[]> => {
    const response = await apiClient.get<ApiResponse<Schedule[]>>('/self/schedules', {
      params: { studentId }
    });
    return response.data.data;
  },

  /**
   * Get all schedules or filter by class/teacher.
   * Student: dùng enrolledClassIds để lấy lịch nhiều môn (nhiều lớp).
   */
  getSchedules: async (params?: {
    courseId?: string;
    courseIds?: string[];
    classId?: string;
    classIds?: string[];
    lecturerId?: string;
    teacherId?: string;
    scheduleType?: 'CLASS' | 'EXAM';
    fromDate?: string;
    toDate?: string;
  }): Promise<Schedule[]> => {
    const query: Record<string, string> = {};
    if (params?.courseIds?.length) query.courseIds = params.courseIds.join(',');
    else if (params?.courseId) query.courseId = params.courseId;
    else if (params?.classIds?.length) query.classIds = params.classIds.join(',');
    else if (params?.classId) query.classId = params.classId;
    if (params?.lecturerId) query.lecturerId = params.lecturerId;
    else if (params?.teacherId) query.teacherId = params.teacherId;
    if (params?.scheduleType) query.scheduleType = params.scheduleType;
    if (params?.fromDate) query.fromDate = params.fromDate;
    if (params?.toDate) query.toDate = params.toDate;
    const response = await apiClient.get<ApiResponse<Schedule[]>>('/schedules', { params: query });
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
   * Exclude specific dates/range for one schedule
   */
  excludeScheduleDates: async (id: string, request: ExcludeScheduleRequest): Promise<Schedule> => {
    const response = await apiClient.patch<ApiResponse<Schedule>>(`/schedules/${id}/exclude`, request);
    return response.data.data;
  },

  /**
   * Bulk exclude by range for many schedules
   */
  bulkExcludeRange: async (request: BulkExcludeRangeRequest): Promise<Schedule[]> => {
    const response = await apiClient.patch<ApiResponse<Schedule[]>>('/schedules/exclude-range', request);
    return response.data.data;
  },

  /**
   * Bulk insert schedules by weekly/monthly range
   */
  bulkInsertSchedules: async (request: BulkInsertScheduleRequest): Promise<Schedule[]> => {
    const response = await apiClient.post<ApiResponse<Schedule[]>>('/schedules/bulk-insert', request);
    return response.data.data;
  },

  /**
   * Delete schedule
   */
  deleteSchedule: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedules/${id}`);
  },
};

