/**
 * User Role enum - Match với backend
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  ACADEMIC_STAFF = 'ACADEMIC_STAFF',
}

/**
 * Login Request
 */
export interface LoginRequest {
  loginId: string;
  password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  token: string;
  role: UserRole;
  userId: string;
  name: string;
  email: string;
}

/**
 * User Response
 */
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  teacherId?: string;
  classId?: string; // match UserDTO.Response.classId
  /** Lớp đã đăng ký (1 SV nhiều môn). Có khi gọi /me. */
  enrolledClassIds?: string[];
  isActive: boolean;
  createdAt: string;
}

