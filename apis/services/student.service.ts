import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';
import {
    StudentResponse,
    CreateStudentRequest,
    UpdateStudentRequest,
} from '../types/student.types';
import { UserRole } from '../types/auth.types';

/**
 * Student Service
 * Sinh viên được quản lý qua /api/users với role=STUDENT
 */
export const studentService = {
    /**
     * Lấy tất cả sinh viên
     * GET /api/users?role=STUDENT
     */
    getAllStudents: async (): Promise<StudentResponse[]> => {
        const response = await apiClient.get<ApiResponse<StudentResponse[]>>(
            '/users',
            { params: { role: UserRole.STUDENT } }
        );
        return response.data.data;
    },

    /**
     * Lấy sinh viên theo ID
     * GET /api/users/:id
     */
    getStudentById: async (id: string): Promise<StudentResponse> => {
        const response = await apiClient.get<ApiResponse<StudentResponse>>(
            `/users/${id}`
        );
        return response.data.data;
    },

    /**
     * Tạo sinh viên mới
     * POST /api/users  (role = STUDENT được set ở đây)
     */
    createStudent: async (data: CreateStudentRequest): Promise<StudentResponse> => {
        const response = await apiClient.post<ApiResponse<StudentResponse>>(
            '/users',
            { ...data, role: UserRole.STUDENT }
        );
        return response.data.data;
    },

    /**
     * Cập nhật thông tin sinh viên
     * PUT /api/users/:id
     */
    updateStudent: async (
        id: string,
        data: UpdateStudentRequest
    ): Promise<StudentResponse> => {
        const response = await apiClient.put<ApiResponse<StudentResponse>>(
            `/users/${id}`,
            data
        );
        return response.data.data;
    },

    /**
     * Xóa sinh viên
     * DELETE /api/users/:id
     */
    deleteStudent: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },
};
