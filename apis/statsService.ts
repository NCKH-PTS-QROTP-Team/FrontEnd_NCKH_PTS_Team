import apiClient from './config/apiClient';

export interface DepartmentStats {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    studentTrend?: string;
    teacherTrend?: string;
    classTrend?: string;
    subjectTrend?: string;
}

interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export const statsService = {
    /**
     * Get department statistics
     */
    async getDepartmentStats(): Promise<DepartmentStats> {
        const response = await apiClient.get<ApiResponse<DepartmentStats>>('/stats/department');
        // Backend returns: { code: 200, message: "...", data: {...} }
        // We need to unwrap the nested data
        return response.data.data;
    },
};
