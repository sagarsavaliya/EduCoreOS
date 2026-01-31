// Attendance API Service

import axiosInstance, { ApiResponse } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

// Types
export interface Attendance {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    student_id: number;
    attendance_date: string;
    timetable_id: number | null;
    status: 'present' | 'absent' | 'late' | 'excused';
    marked_by_user_id: number;
    marked_at: string;
    is_locked: boolean;
}

export interface AttendanceListParams {
    page?: number;
    per_page?: number;
    branch_id?: number;
    academic_year_id?: number;
    batch_id?: number;
    student_id?: number;
    from?: string; // Date in YYYY-MM-DD format
    to?: string;   // Date in YYYY-MM-DD format
    status?: string;
}

export interface CreateAttendanceData {
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    student_id: number;
    attendance_date: string;
    timetable_id?: number | null;
    status: 'present' | 'absent' | 'late' | 'excused';
    marked_by_user_id: number;
}

export interface BulkAttendanceData {
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    attendance_date: string;
    timetable_id?: number | null;
    marked_by_user_id: number;
    attendance_records: Array<{
        student_id: number;
        status: 'present' | 'absent' | 'late' | 'excused';
    }>;
}

export interface AttendanceStats {
    total_days: number;
    present_days: number;
    absent_days: number;
    late_days: number;
    excused_days: number;
    attendance_percentage: number;
}

// API Functions
export const attendanceApi = {
    // Get list of attendance records
    getAttendance: async (params?: AttendanceListParams): Promise<ApiResponse<Attendance[]>> => {
        return axiosInstance.get(API_ENDPOINTS.ATTENDANCE.LIST, { params });
    },

    // Get single attendance record by ID
    getAttendanceById: async (id: number): Promise<ApiResponse<Attendance>> => {
        return axiosInstance.get(API_ENDPOINTS.ATTENDANCE.DETAIL(id));
    },

    // Mark single attendance
    markAttendance: async (data: CreateAttendanceData): Promise<ApiResponse<Attendance>> => {
        return axiosInstance.post(API_ENDPOINTS.ATTENDANCE.CREATE, data);
    },

    // Update attendance
    updateAttendance: async (id: number, data: Partial<CreateAttendanceData>): Promise<ApiResponse<Attendance>> => {
        return axiosInstance.put(API_ENDPOINTS.ATTENDANCE.UPDATE(id), data);
    },

    // Bulk mark attendance
    bulkMarkAttendance: async (data: BulkAttendanceData): Promise<ApiResponse<Attendance[]>> => {
        return axiosInstance.post(API_ENDPOINTS.ATTENDANCE.BULK_CREATE, data);
    },

    // Get attendance statistics
    getAttendanceStats: async (params: {
        student_id?: number;
        batch_id?: number;
        from?: string;
        to?: string;
    }): Promise<ApiResponse<AttendanceStats>> => {
        return axiosInstance.get(API_ENDPOINTS.ATTENDANCE.STATS, { params });
    },
};

export default attendanceApi;
