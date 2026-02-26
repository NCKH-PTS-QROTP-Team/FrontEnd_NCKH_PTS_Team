import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';
import { UserRole } from '../types/auth.types';

/**
 * User Response
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  teacherId?: string;
  classId?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * User Request
 */
export interface CreateUserRequest {
  password: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  teacherId?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  password?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  studentId?: string;
  teacherId?: string;
  isActive?: boolean;
}

export interface AssignStudentToClassRequest {
  studentId: string;
  classId: string;
}

/**
 * User Service
 */
export const userService = {
  /**
   * Get all users or filter by role
   */
  getUsers: async (role?: UserRole): Promise<User[]> => {
    const params = role ? { role } : {};
    const response = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return response.data.data;
  },
  
  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },
  
  /**
   * Create user
   */
  createUser: async (request: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', request);
    return response.data.data;
  },
  
  /**
   * Update user
   */
  updateUser: async (id: string, request: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, request);
    return response.data.data;
  },
  
  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
  
  /**
   * Get students
   */
  getStudents: async (classId?: string): Promise<User[]> => {
    const params = classId ? { classId } : {};
    const response = await apiClient.get<ApiResponse<User[]>>('/users/students', { params });
    return response.data.data;
  },
  
  /**
   * Get unassigned students
   */
  getUnassignedStudents: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users/students/unassigned');
    return response.data.data;
  },
  
  /**
   * Assign student to class
   */
  assignStudentToClass: async (request: AssignStudentToClassRequest): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/users/students/assign-class', request);
    return response.data.data;
  },
};

