import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';
import {
    TeacherResponse,
    CreateTeacherRequest,
    UpdateTeacherRequest,
} from '../types/teacher.types';
import { UserRole } from '../types/auth.types';

/**
 * Teacher Service
 * Giảng viên được quản lý qua /api/users với role=TEACHER
 */
export const teacherService = {
    /**
     * Lấy tất cả giảng viên
     * GET /api/users?role=TEACHER
     */
    getAllTeachers: async (): Promise<TeacherResponse[]> => {
        const response = await apiClient.get<ApiResponse<TeacherResponse[]>>(
            '/users',
            { params: { role: UserRole.TEACHER } }
        );
        return response.data.data;
    },

    /**
     * Lấy giảng viên theo ID
     * GET /api/users/:id
     */
    getTeacherById: async (id: string): Promise<TeacherResponse> => {
        const response = await apiClient.get<ApiResponse<TeacherResponse>>(
            `/users/${id}`
        );
        return response.data.data;
    },

    /**
     * Tạo giảng viên mới
     * POST /api/users  (role = TEACHER được set tự động)
     */
    createTeacher: async (data: CreateTeacherRequest): Promise<TeacherResponse> => {
        const response = await apiClient.post<ApiResponse<TeacherResponse>>(
            '/users',
            { ...data, role: UserRole.TEACHER }
        );
        return response.data.data;
    },

    /**
     * Cập nhật thông tin giảng viên
     * PUT /api/users/:id
     */
    updateTeacher: async (
        id: string,
        data: UpdateTeacherRequest
    ): Promise<TeacherResponse> => {
        const response = await apiClient.put<ApiResponse<TeacherResponse>>(
            `/users/${id}`,
            data
        );
        return response.data.data;
    },

    /**
     * Xóa giảng viên
     * DELETE /api/users/:id
     */
    deleteTeacher: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },
};
