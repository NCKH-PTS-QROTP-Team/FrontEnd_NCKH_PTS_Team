/**
 * Attendance Method enum
 */
export enum AttendanceMethod {
  OTP = 'OTP',
  QR = 'QR',
  FACE = 'FACE',
}

/**
 * Attendance Status enum
 */
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

/**
 * Attendance Record Request
 */
export interface AttendanceRecordRequest {
  sessionId: string;
  studentId: string;
  method: AttendanceMethod;
  otpCode?: string;
  qrToken?: string;
  faceEncoding?: number[];
}

/**
 * Attendance Record Response
 */
export interface AttendanceRecordResponse {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  courseId?: string;
  courseName?: string;
  classId?: string;
  classCode?: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
  attendedAt: string;
  createdAt: string;
}

/**
 * Attendance Session Request (align with backend AttendanceSessionDTO.Request)
 */
export interface AttendanceSessionRequest {
  courseId?: string;
  classId?: string;
  subjectId: string;
  lecturerId?: string;  // backend primary teacher field
  teacherId: string;
  method: AttendanceMethod;
  scheduledStartTime?: string;
  duration?: number;
  attendedAt?: string;
  expiredAt?: string;
}

/**
 * Attendance Session Response
 */
export interface AttendanceSessionResponse {
  id: string;
  courseId?: string;
  courseName?: string;
  classId?: string;
  classCode?: string;
  className?: string;
  subjectId: string;
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
  scheduleId?: string;
  startTime: string;
  endTime?: string;
  scheduledStartTime?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  method?: AttendanceMethod;
  present?: number;
  late?: number;
  absent?: number;
  total?: number;
  description?: string;
  createdAt: string;
}

