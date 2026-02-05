import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';

/**
 * Subject Response
 */
export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  teacherLTId?: string;
  teacherLTName?: string;
  teacherTHId?: string;
  teacherTHName?: string;
  createdAt: string;
}

/**
 * Subject Request
 */
export interface CreateSubjectRequest {
  code: string;
  name: string;
  credits: number;
  teacherLTId?: string;
  teacherTHId?: string;
}

export interface UpdateSubjectRequest {
  code?: string;
  name?: string;
  credits?: number;
  teacherLTId?: string;
  teacherTHId?: string;
}

/**
 * Subject Service
 */
export const subjectService = {
  /**
   * Get all subjects or filter by teacher
   */
  getSubjects: async (teacherId?: string): Promise<Subject[]> => {
    const params = teacherId ? { teacherId } : {};
    const response = await apiClient.get<ApiResponse<Subject[]>>('/subjects', { params });
    return response.data.data;
  },
  
  /**
   * Get subject by ID
   */
  getSubjectById: async (id: string): Promise<Subject> => {
    const response = await apiClient.get<ApiResponse<Subject>>(`/subjects/${id}`);
    return response.data.data;
  },
  
  /**
   * Create subject
   */
  createSubject: async (request: CreateSubjectRequest): Promise<Subject> => {
    const response = await apiClient.post<ApiResponse<Subject>>('/subjects', request);
    return response.data.data;
  },
  
  /**
   * Update subject
   */
  updateSubject: async (id: string, request: UpdateSubjectRequest): Promise<Subject> => {
    const response = await apiClient.put<ApiResponse<Subject>>(`/subjects/${id}`, request);
    return response.data.data;
  },
  
  /**
   * Delete subject
   */
  deleteSubject: async (id: string): Promise<void> => {
    await apiClient.delete(`/subjects/${id}`);
  },
};

