import { UserRole } from './auth.types';

/**
 * StudentResponse - Ánh xạ từ UserDTO.Response (role = STUDENT)
 * Endpoint: GET /api/users?role=STUDENT
 */
export interface StudentResponse {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    studentId: string | null;
    teacherId: string | null;
    departmentId: string | null;
    departmentName: string | null;
    isActive: boolean;
    createdAt: string; // ISO datetime string
}

/**
 * Create Student Request - ánh xạ từ UserDTO.Request
 */
export interface CreateStudentRequest {
    password: string;
    name: string;
    email: string;
    studentId: string;
    departmentId?: string;
    departmentName?: string;
    isActive?: boolean;
}

/**
 * Update Student Request
 */
export interface UpdateStudentRequest {
    name?: string;
    email?: string;
    password?: string;
    isActive?: boolean;
    departmentId?: string;
    departmentName?: string;
}
