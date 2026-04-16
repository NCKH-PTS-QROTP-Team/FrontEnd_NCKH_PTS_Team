import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';

export interface Course {
  id: string;
  name: string;
  theoryLectureId: string | null;
  theoryLectureName: string | null;
  practiceTeacherId: string | null;
  practiceTeacherName: string | null;
  semesterId: string | null;
  semesterName: string | null;
  subjectId: string | null;
  subjectName: string | null;
  createdAt: string;
  updatedAt: string;
}

export const courseService = {
  getAllCourses: async (params?: {
    semesterId?: string;
    subjectId?: string;
  }): Promise<Course[]> => {
    const response = await apiClient.get<ApiResponse<Course[]>>('/courses', {
      params,
    });
    return response.data.data;
  },

  getCourseById: async (id: string): Promise<Course> => {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data.data;
  },
};
