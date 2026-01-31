// Communication API Service (Announcements & Assignments)

import axiosInstance, { ApiResponse } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

// Types
export interface Announcement {
    id: number;
    institute_id: number;
    branch_id: number;
    title: string;
    message: string;
    target_audience: 'all' | 'students' | 'parents' | 'teachers';
    priority: 'low' | 'medium' | 'high';
    published_at: string;
    created_by_user_id: number;
    status: string;
}

export interface Assignment {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    subject_id: number;
    title: string;
    description: string;
    assigned_date: string;
    due_date: string;
    max_marks: number;
    created_by_user_id: number;
    status: string;
}

export interface AnnouncementListParams {
    page?: number;
    per_page?: number;
    branch_id?: number;
    target_audience?: string;
    priority?: string;
    status?: string;
    from?: string;
    to?: string;
}

export interface AssignmentListParams {
    page?: number;
    per_page?: number;
    branch_id?: number;
    academic_year_id?: number;
    batch_id?: number;
    subject_id?: number;
    status?: string;
    from?: string;
    to?: string;
}

export interface CreateAnnouncementData {
    institute_id: number;
    branch_id: number;
    title: string;
    message: string;
    target_audience: 'all' | 'students' | 'parents' | 'teachers';
    priority: 'low' | 'medium' | 'high';
    created_by_user_id: number;
    status?: string;
}

export interface CreateAssignmentData {
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    subject_id: number;
    title: string;
    description: string;
    assigned_date: string;
    due_date: string;
    max_marks: number;
    created_by_user_id: number;
    status?: string;
}

// API Functions
export const communicationApi = {
    // Announcements
    getAnnouncements: async (params?: AnnouncementListParams): Promise<ApiResponse<Announcement[]>> => {
        return axiosInstance.get(API_ENDPOINTS.ANNOUNCEMENTS.LIST, { params });
    },

    getAnnouncement: async (id: number): Promise<ApiResponse<Announcement>> => {
        return axiosInstance.get(API_ENDPOINTS.ANNOUNCEMENTS.DETAIL(id));
    },

    createAnnouncement: async (data: CreateAnnouncementData): Promise<ApiResponse<Announcement>> => {
        return axiosInstance.post(API_ENDPOINTS.ANNOUNCEMENTS.CREATE, data);
    },

    updateAnnouncement: async (id: number, data: Partial<CreateAnnouncementData>): Promise<ApiResponse<Announcement>> => {
        return axiosInstance.put(API_ENDPOINTS.ANNOUNCEMENTS.UPDATE(id), data);
    },

    deleteAnnouncement: async (id: number): Promise<ApiResponse<void>> => {
        return axiosInstance.delete(API_ENDPOINTS.ANNOUNCEMENTS.DELETE(id));
    },

    // Assignments
    getAssignments: async (params?: AssignmentListParams): Promise<ApiResponse<Assignment[]>> => {
        return axiosInstance.get(API_ENDPOINTS.ASSIGNMENTS.LIST, { params });
    },

    getAssignment: async (id: number): Promise<ApiResponse<Assignment>> => {
        return axiosInstance.get(API_ENDPOINTS.ASSIGNMENTS.DETAIL(id));
    },

    createAssignment: async (data: CreateAssignmentData): Promise<ApiResponse<Assignment>> => {
        return axiosInstance.post(API_ENDPOINTS.ASSIGNMENTS.CREATE, data);
    },

    updateAssignment: async (id: number, data: Partial<CreateAssignmentData>): Promise<ApiResponse<Assignment>> => {
        return axiosInstance.put(API_ENDPOINTS.ASSIGNMENTS.UPDATE(id), data);
    },

    deleteAssignment: async (id: number): Promise<ApiResponse<void>> => {
        return axiosInstance.delete(API_ENDPOINTS.ASSIGNMENTS.DELETE(id));
    },
};

export default communicationApi;
