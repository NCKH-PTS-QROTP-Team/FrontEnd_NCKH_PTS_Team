import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';
import {
    ClassResponse,
    CreateClassRequest,
    UpdateClassRequest,
    ClassStudentResponse,
} from '../types/class.types';

/**
 * Class Service
 * Endpoint: /api/classes
 */
export const classService = {
    /** GET /api/classes */
    getAllClasses: async (): Promise<ClassResponse[]> => {
        const response = await apiClient.get<ApiResponse<ClassResponse[]>>('/classes');
        return response.data.data;
    },

    /** GET /api/classes/:id */
    getClassById: async (id: string): Promise<ClassResponse> => {
        const response = await apiClient.get<ApiResponse<ClassResponse>>(`/classes/${id}`);
        return response.data.data;
    },

    /** POST /api/classes */
    createClass: async (data: CreateClassRequest): Promise<ClassResponse> => {
        const response = await apiClient.post<ApiResponse<ClassResponse>>('/classes', data);
        return response.data.data;
    },

    /** PUT /api/classes/:id */
    updateClass: async (id: string, data: UpdateClassRequest): Promise<ClassResponse> => {
        const response = await apiClient.put<ApiResponse<ClassResponse>>(`/classes/${id}`, data);
        return response.data.data;
    },

    /** DELETE /api/classes/:id */
    deleteClass: async (id: string): Promise<void> => {
        await apiClient.delete(`/classes/${id}`);
    },

    // ── Student management ─────────────────────────────────────────────────────

    /** GET /api/classes/:classId/students — Lấy danh sách sinh viên của lớp */
    getStudentsByClass: async (classId: string): Promise<ClassStudentResponse[]> => {
        const response = await apiClient.get<ApiResponse<ClassStudentResponse[]>>(
            `/classes/${classId}/students`
        );
        return response.data.data;
    },

    /** POST /api/classes/:classId/students/:studentId — Thêm sinh viên vào lớp */
    addStudentToClass: async (classId: string, studentId: string): Promise<ClassStudentResponse> => {
        const response = await apiClient.post<ApiResponse<ClassStudentResponse>>(
            `/classes/${classId}/students/${studentId}`
        );
        return response.data.data;
    },

    /** DELETE /api/classes/:classId/students/:studentId — Xóa sinh viên khỏi lớp */
    removeStudentFromClass: async (classId: string, studentId: string): Promise<void> => {
        await apiClient.delete(`/classes/${classId}/students/${studentId}`);
    },
};
