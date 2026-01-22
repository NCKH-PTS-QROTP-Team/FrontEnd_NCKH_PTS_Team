/**
 * User Role enum - Match với backend
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
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
  isActive: boolean;
  createdAt: string;
}

