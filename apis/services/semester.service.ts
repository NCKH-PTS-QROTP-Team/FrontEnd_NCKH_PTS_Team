import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';

export interface Semester {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  createdAt: string;
}

export const semesterService = {
  getAllSemesters: async (): Promise<Semester[]> => {
    const response = await apiClient.get<ApiResponse<Semester[]>>('/semesters');
    return response.data.data;
  },
};
