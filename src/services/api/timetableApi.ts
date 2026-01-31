// Timetable API Service

import axiosInstance, { ApiResponse } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

// Types
export interface TimetableEntry {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    subject_id: number;
    teacher_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    status: string;
}

export interface TimetableListParams {
    page?: number;
    per_page?: number;
    branch_id?: number;
    academic_year_id?: number;
    batch_id?: number;
    teacher_id?: number;
    day_of_week?: string;
    status?: string;
}

export interface CreateTimetableData {
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    subject_id: number;
    teacher_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    status?: string;
}

// API Functions
export const timetableApi = {
    // Get timetable entries
    getTimetable: async (params?: TimetableListParams): Promise<ApiResponse<TimetableEntry[]>> => {
        return axiosInstance.get(API_ENDPOINTS.TIMETABLE.LIST, { params });
    },

    // Get single timetable entry
    getTimetableEntry: async (id: number): Promise<ApiResponse<TimetableEntry>> => {
        return axiosInstance.get(API_ENDPOINTS.TIMETABLE.DETAIL(id));
    },

    // Create timetable entry
    createTimetableEntry: async (data: CreateTimetableData): Promise<ApiResponse<TimetableEntry>> => {
        return axiosInstance.post(API_ENDPOINTS.TIMETABLE.CREATE, data);
    },

    // Update timetable entry
    updateTimetableEntry: async (id: number, data: Partial<CreateTimetableData>): Promise<ApiResponse<TimetableEntry>> => {
        return axiosInstance.put(API_ENDPOINTS.TIMETABLE.UPDATE(id), data);
    },

    // Delete timetable entry
    deleteTimetableEntry: async (id: number): Promise<ApiResponse<void>> => {
        return axiosInstance.delete(API_ENDPOINTS.TIMETABLE.DELETE(id));
    },
};

export default timetableApi;
