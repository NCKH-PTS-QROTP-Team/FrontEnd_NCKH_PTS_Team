/**
 * ClassResponse — ánh xạ từ ClassDTO.Response của backend
 */
export interface ClassResponse {
    id: string;
    code: string;
    name: string;
    subjectId: string | null;
    subjectName: string | null;
    teacherId: string | null;
    teacherName: string | null;
    semester?: string | null;
    semesterId?: string | null;
    studentCount: number | null;
    createdAt: string;
}

/** Sinh viên trả về khi query /api/classes/:id/students */
export interface ClassStudentResponse {
    id: string;
    name: string;
    email: string;
    studentId: string | null;
    isActive: boolean;
    createdAt: string | null;
}

export interface CreateClassRequest {
    code: string;
    name: string;
    subjectId?: string;
    teacherId?: string;
    semesterId?: string;
    studentCount?: number;
}

export interface UpdateClassRequest {
    code?: string;
    name?: string;
    subjectId?: string;
    teacherId?: string;
    semesterId?: string;
    studentCount?: number;
}
