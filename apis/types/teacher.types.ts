import { UserRole } from './auth.types';

/**
 * TeacherStatus — trạng thái mở rộng hơn so với boolean isActive
 *
 * Backend hiện tại chỉ trả về `isActive: boolean`.
 * - ACTIVE   → isActive = true
 * - INACTIVE → isActive = false
 * - ON_LEAVE → isActive = false + teacherStatus = 'ON_LEAVE'  (field bổ sung, nếu backend hỗ trợ)
 *
 * Nếu backend chưa có trường teacherStatus, giá trị mặc định khi fetch
 * sẽ là ACTIVE / INACTIVE theo isActive.
 */
export type TeacherStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

/**
 * TeacherResponse — ánh xạ từ UserDTO.Response (role = TEACHER)
 * Endpoint: GET /api/users?role=TEACHER
 */
export interface TeacherResponse {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    teacherId: string | null;
    studentId: string | null;
    departmentId: string | null;
    departmentName: string | null;
    phone?: string | null;
    isActive: boolean;
    /** Trạng thái mở rộng — backend có thể trả về hoặc do FE tự suy ra */
    teacherStatus?: TeacherStatus;
    createdAt: string;
}

/**
 * CreateTeacherRequest — ánh xạ từ UserDTO.Request
 */
export interface CreateTeacherRequest {
    password: string;
    name: string;
    email: string;
    teacherId: string;
    phone?: string;
    departmentId?: string;
    departmentName?: string;
    isActive?: boolean;
}

/**
 * UpdateTeacherRequest
 */
export interface UpdateTeacherRequest {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    isActive?: boolean;
    teacherStatus?: TeacherStatus;
    departmentId?: string;
    departmentName?: string;
}
