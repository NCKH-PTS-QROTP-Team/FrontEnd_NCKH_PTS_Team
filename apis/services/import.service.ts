import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';

/**
 * Import Response
 */
export interface ImportResponse {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  createdClasses: any[];
}

export interface ImportStudentResponse {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  createdStudents: any[];
}

export interface ImportError {
  rowNumber: number;
  field: string;
  message: string;
}

/**
 * Import Service
 */
export const importService = {
  /**
   * Import classes from Excel file
   * @param file - Excel file (.xlsx or .xls)
   */
  importClasses: async (file: File | any): Promise<ImportResponse> => {
    const formData = new FormData();
    
    // Handle React Native file format
    if (file.uri) {
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: file.name || 'classes.xlsx',
      } as any);
    } else {
      // Handle web File
      formData.append('file', file);
    }
    
    const response = await apiClient.post<ApiResponse<ImportResponse>>(
      '/import/classes',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },
  
  /**
   * Import students from Excel file
   * @param file - Excel file (.xlsx or .xls)
   */
  importStudents: async (file: File | any): Promise<ImportStudentResponse> => {
    const formData = new FormData();
    
    // Handle React Native file format
    if (file.uri) {
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: file.name || 'students.xlsx',
      } as any);
    } else {
      // Handle web File
      formData.append('file', file);
    }
    
    const response = await apiClient.post<ApiResponse<ImportStudentResponse>>(
      '/import/students',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },
};

