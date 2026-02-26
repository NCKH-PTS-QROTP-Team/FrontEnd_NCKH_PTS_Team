import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';
import {
    ScheduleResponse,
    CreateScheduleRequest,
    UpdateScheduleRequest,
    ExcludeScheduleRequest,
} from '../types/schedule.types';

export const scheduleService = {
    /** GET /api/schedules */
    getAllSchedules: async (): Promise<ScheduleResponse[]> => {
        const res = await apiClient.get<ApiResponse<ScheduleResponse[]>>('/schedules');
        return res.data.data;
    },

    /** GET /api/schedules?classId=... */
    getSchedulesByClass: async (classId: string): Promise<ScheduleResponse[]> => {
        const res = await apiClient.get<ApiResponse<ScheduleResponse[]>>('/schedules', { params: { classId } });
        return res.data.data;
    },

    /** GET /api/schedules?teacherId=... */
    getSchedulesByTeacher: async (teacherId: string): Promise<ScheduleResponse[]> => {
        const res = await apiClient.get<ApiResponse<ScheduleResponse[]>>('/schedules', { params: { teacherId } });
        return res.data.data;
    },

    /** GET /api/schedules/:id */
    getScheduleById: async (id: string): Promise<ScheduleResponse> => {
        const res = await apiClient.get<ApiResponse<ScheduleResponse>>(`/schedules/${id}`);
        return res.data.data;
    },

    /** POST /api/schedules */
    createSchedule: async (data: CreateScheduleRequest): Promise<ScheduleResponse> => {
        const res = await apiClient.post<ApiResponse<ScheduleResponse>>('/schedules', data);
        return res.data.data;
    },

    /** PUT /api/schedules/:id */
    updateSchedule: async (id: string, data: UpdateScheduleRequest): Promise<ScheduleResponse> => {
        const res = await apiClient.put<ApiResponse<ScheduleResponse>>(`/schedules/${id}`, data);
        return res.data.data;
    },

    /** PATCH /api/schedules/:id/exclude — cancel specific occurrences */
    excludeDates: async (id: string, data: ExcludeScheduleRequest): Promise<ScheduleResponse> => {
        const res = await apiClient.patch<ApiResponse<ScheduleResponse>>(`/schedules/${id}/exclude`, data);
        return res.data.data;
    },

    /** DELETE /api/schedules/:id */
    deleteSchedule: async (id: string): Promise<void> => {
        await apiClient.delete(`/schedules/${id}`);
    },
};
