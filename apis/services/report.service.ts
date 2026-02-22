import apiClient, { getExportBaseUrl } from '../config/apiClient';
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
  totalLate: number;
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

  /**
   * Tải file Excel báo cáo điểm danh.
   * Trả về Blob để FE tạo link tải (web) hoặc lưu file (native).
   * @param classId optional - nếu có thì sheet sinh viên chỉ gồm lớp đó
   * @param subjectId optional - nếu có thì chỉ xuất báo cáo của môn này
   */
  exportExcel: async (classId?: string, subjectId?: string): Promise<Blob> => {
    const params: Record<string, string> = {};
    if (classId) params.classId = classId;
    if (subjectId) params.subjectId = subjectId;
    const response = await apiClient.get('/reports/export/excel', {
      params: Object.keys(params).length ? params : undefined,
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  /**
   * URL đầy đủ để tải file Excel (dùng cho native - fetch + save + share).
   */
  getExportExcelUrl: (classId?: string, subjectId?: string): string => {
    const base = getExportBaseUrl();
    const search = new URLSearchParams();
    if (classId) search.set('classId', classId);
    if (subjectId) search.set('subjectId', subjectId);
    const qs = search.toString();
    return `${base}/reports/export/excel${qs ? `?${qs}` : ''}`;
  },
};

