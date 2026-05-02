/**
 * ScheduleResponse — ánh xạ từ ScheduleDTO.Response
 * dayOfWeek: 2=Thứ 2 … 7=Thứ 7, 8=Chủ nhật (auto-derived from startDate on backend)
 */
export interface ScheduleResponse {
    id: string;
        classId: string | null;
        courseId?: string | null;
        courseName?: string | null;
    classCode: string | null;
    className: string | null;
    subjectId: string | null;
    subjectCode: string | null;
    subjectName: string | null;
    teacherId: string | null;
    teacherName: string | null;
    scheduleType?: 'CLASS' | 'EXAM';
    pattern?: 'RECURRING_WEEKLY' | 'ONE_TIME';
    /** 2–8, auto-derived from startDate */
    dayOfWeek: number | null;
    /** HH:mm */
    startTime: string | null;
    /** HH:mm */
    endTime: string | null;
    room: string | null;
    /** yyyy-MM-dd – single-occurrence date (one-time schedule) */
    date?: string | null;
    /** yyyy-MM-dd – first active date */
    startDate?: string | null;
    /** yyyy-MM-dd – last active date (null = open-ended) */
    endDate?: string | null;
    /** Dates of cancelled individual occurrences (yyyy-MM-dd[]) */
    excludedDates?: string[];
    createdAt: string;
}

export interface CreateScheduleRequest {
    classId: string;
        courseId?: string;
    subjectId?: string;
    teacherId?: string;
    scheduleType?: 'CLASS' | 'EXAM';
    pattern?: 'RECURRING_WEEKLY' | 'ONE_TIME';
    /** Auto-computed by backend from startDate; can omit */
    dayOfWeek?: number;
    startTime: string;
    endTime: string;
    room?: string;
    /** yyyy-MM-dd: one-time occurrence date */
    date?: string;
    /** yyyy-MM-dd: first lesson date — backend derives dayOfWeek from this */
    startDate?: string;
    /** yyyy-MM-dd: last lesson date (optional) */
    endDate?: string;
}

export interface UpdateScheduleRequest {
    classId?: string;
        courseId?: string;
    subjectId?: string;
    teacherId?: string;
    scheduleType?: 'CLASS' | 'EXAM';
    pattern?: 'RECURRING_WEEKLY' | 'ONE_TIME';
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    room?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
}

/** Payload for PATCH /api/schedules/{id}/exclude */
export interface ExcludeScheduleRequest {
    /** Explicit dates to cancel (yyyy-MM-dd) */
    dates?: string[];
    /** Start of date range to cancel */
    rangeStart?: string;
    /** End of date range to cancel */
    rangeEnd?: string;
}

export interface BulkExcludeRangeRequest {
    scheduleIds?: string[];
    classId?: string;
        courseId?: string;
    subjectId?: string;
    teacherId?: string;
    scheduleType?: 'CLASS' | 'EXAM';
    rangeStart: string;
    rangeEnd: string;
}

export interface BulkInsertScheduleRequest {
    classId: string;
        courseId?: string;
    subjectId: string;
    teacherId: string;
    scheduleType?: 'CLASS' | 'EXAM';
    pattern?: 'RECURRING_WEEKLY' | 'ONE_TIME';
    room?: string;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
    rangeStart: string;
    rangeEnd: string;
    frequency?: 'WEEKLY' | 'MONTHLY';
    interval?: number;
}
