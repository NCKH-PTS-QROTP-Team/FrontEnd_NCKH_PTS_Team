import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';

/**
 * Class Response
 */
export interface Class {
  id: string;
  code: string;
  name: string;
  subjectId: string | null;
  subjectName: string | null;
  semesterId?: string | null;
  teacherId: string | null;
  teacherName: string | null;
  semester?: string | null;
  studentCount: number | null;
  createdAt: string;
}

export interface ClassStudent {
  id: string;
  email: string;
  name: string;
  studentId: string | null;
  classId: string | null;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'ACADEMIC_STAFF';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Class Request
 */
export interface CreateClassRequest {
  code: string;
  name: string;
  subjectId?: string;
  teacherId?: string;
  semesterId?: string;
  studentCount?: number;
}

export interface UpdateClassRequest {
  code?: string;
  name?: string;
  subjectId?: string;
  teacherId?: string;
  semesterId?: string;
  studentCount?: number;
}

/**
 * Class Service
 */
export const classService = {
  /**
   * Get all classes
   */
  getAllClasses: async (): Promise<Class[]> => {
    const response = await apiClient.get<ApiResponse<Class[]>>('/classes');
    return response.data.data;
  },

  /**
   * Get classes by teacher
   */
  getClassesByTeacher: async (teacherId: string): Promise<Class[]> => {
    const response = await apiClient.get<ApiResponse<Class[]>>('/classes', { params: { teacherId } });
    return response.data.data;
  },

  /**
   * Get class by ID
   */
  getClassById: async (id: string): Promise<Class> => {
    const response = await apiClient.get<ApiResponse<Class>>(`/classes/${id}`);
    return response.data.data;
  },

  /**
   * Get students by class ID
   */
  getStudentsByClass: async (classId: string): Promise<ClassStudent[]> => {
    const response = await apiClient.get<ApiResponse<ClassStudent[]>>(`/classes/${classId}/students`);
    return response.data.data;
  },

  /**
   * Add student to class
   */
  addStudentToClass: async (classId: string, studentId: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/classes/${classId}/students/${studentId}`);
    return response.data.data;
  },

  /**
   * Remove student from class
   */
  removeStudentFromClass: async (classId: string, studentId: string): Promise<void> => {
    await apiClient.delete(`/classes/${classId}/students/${studentId}`);
  },

  /**
   * Create class
   */
  createClass: async (request: CreateClassRequest): Promise<Class> => {
    const response = await apiClient.post<ApiResponse<Class>>('/classes', request);
    return response.data.data;
  },

  /**
   * Update class
   */
  updateClass: async (id: string, request: UpdateClassRequest): Promise<Class> => {
    const response = await apiClient.put<ApiResponse<Class>>(`/classes/${id}`, request);
    return response.data.data;
  },

  /**
   * Delete class
   */
  deleteClass: async (id: string): Promise<void> => {
    await apiClient.delete(`/classes/${id}`);
  },
};

