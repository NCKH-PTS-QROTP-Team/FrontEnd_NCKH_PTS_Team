import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';

/**
 * Class Response
 */
export interface Class {
  id: string;
  code: string;
  name: string;
  subjectId?: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  semester?: string;
  studentCount: number;
  createdAt: string;
}

/**
 * Class Request
 */
export interface CreateClassRequest {
  code: string;
  name: string;
  subjectId?: string;
  teacherId?: string;
  semester?: string;
  studentCount?: number;
}

export interface UpdateClassRequest {
  code?: string;
  name?: string;
  subjectId?: string;
  teacherId?: string;
  semester?: string;
  studentCount?: number;
}

/**
 * Class Service
 */
export const classService = {
  /**
   * Get all classes or filter by teacher
   */
  getClasses: async (teacherId?: string): Promise<Class[]> => {
    const params = teacherId ? { teacherId } : {};
    const response = await apiClient.get<ApiResponse<Class[]>>('/classes', { params });
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

