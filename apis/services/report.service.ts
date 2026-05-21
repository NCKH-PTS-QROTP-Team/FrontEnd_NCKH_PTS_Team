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
 * Teacher-specific summary (filtered by JWT)
 */
export interface TeacherSummary {
  totalClasses: number;
  totalSessions: number;
  totalStudents: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  averageAttendanceRate: number;
  classReports: ClassAttendanceReport[];
}

/**
 * Per-course attendance breakdown for a single student.
 * attendanceRate = (presentCount + lateCount) / totalSessions * 100
 */
export interface StudentCourseAttendance {
  courseId: string;
  courseName: string;
  subjectId: string | null;
  subjectName: string | null;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  /** % = (present + late) / totalSessions * 100 */
  attendanceRate: number;
}

/**
 * Full attendance summary for one student (overall + per-course breakdown).
 */
export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  /** Overall rate across all courses */
  overallAttendanceRate: number;
  totalSessions: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  courseBreakdown: StudentCourseAttendance[];
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
   * Get teacher-specific summary (classes, sessions, attendance of logged-in teacher)
   */
  getTeacherSummary: async (subjectId?: string, startDate?: string, endDate?: string): Promise<TeacherSummary> => {
    const params: Record<string, string> = {};
    if (subjectId) params.subjectId = subjectId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get<ApiResponse<TeacherSummary>>('/reports/teacher-summary', { params });
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
  getStudentReports: async (
    courseId?: string,
    semesterId?: string,
    subjectId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<StudentAttendanceReport[]> => {
    const params: Record<string, string> = {};
    if (courseId) params.courseId = courseId;
    if (semesterId) params.semesterId = semesterId;
    if (subjectId) params.subjectId = subjectId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get<ApiResponse<StudentAttendanceReport[]>>('/reports/students', { params });
    return response.data.data;
  },

  /**
   * Lấy tỷ lệ điểm danh chi tiết của một sinh viên (theo từng môn học và tổng thể).
   * Tỷ lệ mỗi môn = (present + late) / totalSessions * 100
   *
   * @param studentId mã sinh viên hoặc userId
   */
  getStudentAttendanceSummary: async (studentId: string): Promise<StudentAttendanceSummary> => {
    const response = await apiClient.get<ApiResponse<StudentAttendanceSummary>>(
      '/reports/student-attendance-summary',
      { params: { studentId } },
    );
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
   */
  exportExcel: async (
    courseId?: string,
    subjectId?: string,
    startDate?: string,
    endDate?: string,
    onlyRisk?: boolean
  ): Promise<Blob> => {
    const params: Record<string, any> = {};
    if (courseId) params.courseId = courseId;
    if (subjectId) params.subjectId = subjectId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (onlyRisk !== undefined) params.onlyRisk = onlyRisk;
    
    const response = await apiClient.get('/reports/export/excel', {
      params: Object.keys(params).length ? params : undefined,
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  /**
   * URL đầy đủ để tải file Excel (dùng cho native - fetch + save + share).
   */
  getExportExcelUrl: (
    courseId?: string,
    subjectId?: string,
    startDate?: string,
    endDate?: string,
    onlyRisk?: boolean
  ): string => {
    const base = getExportBaseUrl();
    const search = new URLSearchParams();
    if (courseId) search.set('courseId', courseId);
    if (subjectId) search.set('subjectId', subjectId);
    if (startDate) search.set('startDate', startDate);
    if (endDate) search.set('endDate', endDate);
    if (onlyRisk !== undefined) search.set('onlyRisk', String(onlyRisk));
    const qs = search.toString();
    return `${base}/reports/export/excel${qs ? `?${qs}` : ''}`;
  },
};
