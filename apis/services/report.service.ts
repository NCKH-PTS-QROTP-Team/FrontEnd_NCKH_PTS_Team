import apiClient from '../config/apiClient';
import { ApiResponse } from '../types/api.types';

/**
 * Attendance Summary
 */
export interface AttendanceSummary {
  totalSessions: number;
  totalStudents: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  averageAttendanceRate: number;
}

/**
 * Class Attendance Report
 */
export interface ClassAttendanceReport {
  classId: string;
  classCode: string;
  className: string;
  totalSessions: number;
  totalStudents: number;
  totalPresent: number;
  totalAbsent: number;
  attendanceRate: number;
}

/**
 * Student Attendance Report
 */
export interface StudentAttendanceReport {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
}

/**
 * Monthly Report
 */
export interface MonthlyReport {
  month: string;
  totalSessions: number;
  totalStudents: number;
  averageAttendanceRate: number;
  classReports: ClassAttendanceReport[];
}

/**
 * Report Service
 */
export const reportService = {
  /**
   * Get attendance summary
   */
  getAttendanceSummary: async (): Promise<AttendanceSummary> => {
    const response = await apiClient.get<ApiResponse<AttendanceSummary>>('/reports/summary');
    return response.data.data;
  },
  
  /**
   * Get class attendance reports
   */
  getClassReports: async (): Promise<ClassAttendanceReport[]> => {
    const response = await apiClient.get<ApiResponse<ClassAttendanceReport[]>>('/reports/classes');
    return response.data.data;
  },
  
  /**
   * Get student attendance reports
   */
  getStudentReports: async (classId?: string): Promise<StudentAttendanceReport[]> => {
    const params = classId ? { classId } : {};
    const response = await apiClient.get<ApiResponse<StudentAttendanceReport[]>>('/reports/students', { params });
    return response.data.data;
  },
  
  /**
   * Get monthly report
   */
  getMonthlyReport: async (month: string): Promise<MonthlyReport> => {
    const response = await apiClient.get<ApiResponse<MonthlyReport>>('/reports/monthly', {
      params: { month },
    });
    return response.data.data;
  },
};

