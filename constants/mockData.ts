export interface Schedule {
  id: string;
  courseCode: string;
  courseName: string;
  time: string;
  room: string;
  teacher: string;
  status: 'upcoming' | 'in-progress' | 'completed';
}

export interface TeacherSchedule {
  id: string;
  courseCode: string;
  courseName: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  time: string; // "08:00 - 10:00"
  room: string;
  className?: string;
  studentCount?: number;
}

export interface AttendanceRecord {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  time: string;
  status: 'present' | 'late' | 'absent';
  method: 'qr' | 'otp' | 'none';
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  avatar: string | null;
  status: 'present' | 'late' | 'absent';
  attendedAt: string | null;
  checkInTime?: string;
}

export interface Stats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
}

export const mockSchedules: Schedule[] = [
  { id: '1', courseCode: 'CS101', courseName: 'L?p tr�nh co b?n', time: '08:00 - 10:00', room: 'A102', teacher: 'TS. Nguy?n Van A', status: 'upcoming' },
  { id: '2', courseCode: 'CS102', courseName: 'C?u tr�c d? li?u', time: '10:15 - 12:15', room: 'B205', teacher: 'TS. Tr?n Th? B', status: 'in-progress' },
  { id: '3', courseCode: 'CS103', courseName: 'H? di?u h�nh', time: '13:30 - 15:30', room: 'C301', teacher: 'PGS. L� Van C', status: 'upcoming' },
];

// Teacher weekly schedule (Monday = 1, Sunday = 0)
export const mockTeacherSchedules: TeacherSchedule[] = [
  // Monday
  { id: '1', courseCode: 'CS101', courseName: 'L?p tr�nh co b?n', dayOfWeek: 1, time: '08:00 - 10:00', room: 'A102', className: 'CNTT01', studentCount: 45 },
  { id: '2', courseCode: 'CS102', courseName: 'C?u tr�c d? li?u', dayOfWeek: 1, time: '10:15 - 12:15', room: 'B205', className: 'CNTT02', studentCount: 42 },
  { id: '3', courseCode: 'CS201', courseName: 'Co s? d? li?u', dayOfWeek: 1, time: '13:30 - 15:30', room: 'C301', className: 'CNTT03', studentCount: 38 },
  // Tuesday
  { id: '4', courseCode: 'CS101', courseName: 'L?p tr�nh co b?n', dayOfWeek: 2, time: '08:00 - 10:00', room: 'A102', className: 'CNTT01', studentCount: 45 },
  { id: '5', courseCode: 'CS103', courseName: 'H? di?u h�nh', dayOfWeek: 2, time: '14:00 - 16:00', room: 'D401', className: 'CNTT04', studentCount: 40 },
  // Wednesday
  { id: '6', courseCode: 'CS102', courseName: 'C?u tr�c d? li?u', dayOfWeek: 3, time: '08:00 - 10:00', room: 'B205', className: 'CNTT02', studentCount: 42 },
  { id: '7', courseCode: 'CS201', courseName: 'Co s? d? li?u', dayOfWeek: 3, time: '10:15 - 12:15', room: 'C301', className: 'CNTT03', studentCount: 38 },
  // Thursday
  { id: '8', courseCode: 'CS101', courseName: 'L?p tr�nh co b?n', dayOfWeek: 4, time: '08:00 - 10:00', room: 'A102', className: 'CNTT01', studentCount: 45 },
  { id: '9', courseCode: 'CS102', courseName: 'C?u tr�c d? li?u', dayOfWeek: 4, time: '10:15 - 12:15', room: 'B205', className: 'CNTT02', studentCount: 42 },
  { id: '10', courseCode: 'CS103', courseName: 'H? di?u h�nh', dayOfWeek: 4, time: '13:30 - 15:30', room: 'C301', className: 'CNTT04', studentCount: 40 },
  // Friday
  { id: '11', courseCode: 'CS201', courseName: 'Co s? d? li?u', dayOfWeek: 5, time: '08:00 - 10:00', room: 'C301', className: 'CNTT03', studentCount: 38 },
  { id: '12', courseCode: 'CS103', courseName: 'H? di?u h�nh', dayOfWeek: 5, time: '14:00 - 16:00', room: 'D401', className: 'CNTT04', studentCount: 40 },
];

export const mockAttendanceHistory: AttendanceRecord[] = [
  { id: '1', courseCode: 'CS101', courseName: 'L?p tr�nh co b?n', date: '2026-01-02', time: '08:00', status: 'present', method: 'qr' },
  { id: '2', courseCode: 'CS102', courseName: 'C?u tr�c d? li?u', date: '2026-01-01', time: '10:15', status: 'late', method: 'otp' },
  { id: '3', courseCode: 'CS103', courseName: 'H? di?u h�nh', date: '2025-12-30', time: '13:30', status: 'absent', method: 'none' },
  { id: '4', courseCode: 'CS101', courseName: 'L?p tr�nh co b?n', date: '2025-12-29', time: '08:00', status: 'present', method: 'qr' },
];

export const mockStudents: Student[] = [
  { id: '1', studentId: 'SV001', name: 'Nguy?n Van An', avatar: null, status: 'present', attendedAt: '08:05' },
  { id: '2', studentId: 'SV002', name: 'Tr?n Th? B�nh', avatar: null, status: 'late', attendedAt: '08:20' },
  { id: '3', studentId: 'SV003', name: 'L� Ho�ng Cu?ng', avatar: null, status: 'absent', attendedAt: null },
  { id: '4', studentId: 'SV004', name: 'Ph?m Th? Dung', avatar: null, status: 'present', attendedAt: '08:02' },
  { id: '5', studentId: 'SV005', name: 'Ho�ng Van Em', avatar: null, status: 'present', attendedAt: '08:01' },
];

export const mockStats: Stats = {
  totalStudents: 45,
  presentToday: 38,
  absentToday: 7,
  attendanceRate: 84,
};

// Admin-specific interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  studentId?: string;
  teacherId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Class {
  id: string;
  code: string;
  name: string;
  teacher: string;
  teacherId: string;
  studentCount: number;
  subject: string;
  semester: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  teacher?: string;
  teacherId?: string;
  // Hỗ trợ 2 giảng viên: Lý thuyết và Thực hành
  teacherLT?: string;
  teacherLTId?: string;
  teacherTH?: string;
  teacherTHId?: string;
}

export interface AttendanceSession {
  id: string;
  classCode: string;
  className: string;
  subject: string;
  teacher: string;
  startTime: string;
  status: 'active' | 'completed';
  present: number;
  late: number;
  absent: number;
  total: number;
  method: 'otp' | 'qr';
}

export interface SystemSettings {
  otpValiditySeconds: number;
  qrRefreshSeconds: number;
  enableGPS: boolean;
  allowLateAttendance: boolean;
  lateThresholdMinutes: number;
}

// Admin mock data
export const mockUsers: User[] = [
  { id: '1', name: 'Admin H? th?ng', email: 'admin@edu.vn', username: 'admin', password: 'admin123', role: 'admin', isActive: true, createdAt: '2025-01-01' },
  { id: '2', name: 'TS. Nguy?n Van A', email: 'nva@teacher.edu.vn', username: 'GV001', password: 'teacher123', role: 'teacher', teacherId: 'GV001', isActive: true, createdAt: '2025-01-05' },
  { id: '3', name: 'ThS. Tr?n Th? B', email: 'ttb@teacher.edu.vn', username: 'GV002', password: 'teacher123', role: 'teacher', teacherId: 'GV002', isActive: true, createdAt: '2025-01-06' },
  { id: '4', name: 'Nguy?n Van An', email: 'nva@student.edu.vn', username: 'SV001', password: 'student123', role: 'student', studentId: 'SV001', isActive: true, createdAt: '2025-02-01' },
  { id: '5', name: 'Tr?n Th? B�nh', email: 'ttb@student.edu.vn', username: 'SV002', password: 'student123', role: 'student', studentId: 'SV002', isActive: false, createdAt: '2025-02-01' },
];

export const mockClasses: Class[] = [
  { id: '1', code: 'CNTT01', name: 'C�ng ngh? th�ng tin 01', teacher: 'TS. Nguy?n Van A', teacherId: 'GV001', studentCount: 45, subject: 'L?p tr�nh co b?n', semester: 'HK1-2025' },
  { id: '2', code: 'CNTT02', name: 'C�ng ngh? th�ng tin 02', teacher: 'ThS. Tr?n Th? B', teacherId: 'GV002', studentCount: 42, subject: 'Co s? d? li?u', semester: 'HK1-2025' },
  { id: '3', code: 'KTPM01', name: 'K? thu?t ph?n m?m 01', teacher: 'TS. L� Van C', teacherId: 'GV003', studentCount: 38, subject: 'M?ng m�y t�nh', semester: 'HK1-2025' },
];

export const mockSubjects: Subject[] = [
  { id: '1', code: 'CS101', name: 'Lập trình cơ bản', credits: 3, teacherLT: 'TS. Nguyễn Văn A', teacherLTId: 'GV001', teacherTH: 'ThS. Trần Thị B', teacherTHId: 'GV002' },
  { id: '2', code: 'CS102', name: 'Cơ sở dữ liệu', credits: 4, teacherLT: 'ThS. Trần Thị B', teacherLTId: 'GV002' },
  { id: '3', code: 'CS103', name: 'Mạng máy tính', credits: 3, teacherLT: 'TS. Lê Văn C', teacherLTId: 'GV003', teacherTH: 'TS. Lê Văn C', teacherTHId: 'GV003' },
  { id: '4', code: 'CS104', name: 'Trí tuệ nhân tạo', credits: 3 },
];

export const mockAttendanceSessions: AttendanceSession[] = [
  {
    id: '1',
    classCode: 'CNTT01',
    className: 'C�ng ngh? th�ng tin 01',
    subject: 'L?p tr�nh co b?n',
    teacher: 'TS. Nguy?n Van A',
    startTime: '08:00',
    status: 'active',
    present: 38,
    late: 5,
    absent: 2,
    total: 45,
    method: 'qr',
  },
  {
    id: '2',
    classCode: 'CNTT02',
    className: 'C�ng ngh? th�ng tin 02',
    subject: 'Co s? d? li?u',
    teacher: 'ThS. Tr?n Th? B',
    startTime: '10:15',
    status: 'active',
    present: 35,
    late: 3,
    absent: 4,
    total: 42,
    method: 'otp',
  },
];

export const mockSystemSettings: SystemSettings = {
  otpValiditySeconds: 120,
  qrRefreshSeconds: 30,
  enableGPS: false,
  allowLateAttendance: true,
  lateThresholdMinutes: 15,
};
