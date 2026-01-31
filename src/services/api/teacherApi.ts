// Teacher API Service

import axiosInstance, { ApiResponse } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

// Types
export interface Teacher {
    id: number;
    institute_id: number;
    branch_id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    alternate_phone: string | null;
    gender: string;
    date_of_birth: string;
    qualification: string;
    specialization: string;
    experience_years: number;
    joining_date: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    status: string;
    photo_url: string;
}

export interface TeacherListParams {
    page?: number;
    per_page?: number;
    branch_id?: number;
    status?: string;
    specialization?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface CreateTeacherData {
    institute_id: number;
    branch_id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    alternate_phone?: string;
    gender: string;
    date_of_birth: string;
    qualification: string;
    specialization: string;
    experience_years: number;
    joining_date: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    status?: string;
}

// API Functions
export const teacherApi = {
    // Get list of teachers
    getTeachers: async (params?: TeacherListParams): Promise<ApiResponse<Teacher[]>> => {
        return axiosInstance.get(API_ENDPOINTS.TEACHERS.LIST, { params });
    },

    // Get single teacher by ID
    getTeacher: async (id: number): Promise<ApiResponse<Teacher>> => {
        return axiosInstance.get(API_ENDPOINTS.TEACHERS.DETAIL(id));
    },

    // Create new teacher
    createTeacher: async (data: CreateTeacherData): Promise<ApiResponse<Teacher>> => {
        return axiosInstance.post(API_ENDPOINTS.TEACHERS.CREATE, data);
    },

    // Update existing teacher
    updateTeacher: async (id: number, data: Partial<CreateTeacherData>): Promise<ApiResponse<Teacher>> => {
        return axiosInstance.put(API_ENDPOINTS.TEACHERS.UPDATE(id), data);
    },

    // Delete teacher
    deleteTeacher: async (id: number): Promise<ApiResponse<void>> => {
        return axiosInstance.delete(API_ENDPOINTS.TEACHERS.DELETE(id));
    },

    // Search teachers
    searchTeachers: async (query: string): Promise<ApiResponse<Teacher[]>> => {
        return axiosInstance.get(API_ENDPOINTS.TEACHERS.LIST, {
            params: { search: query }
        });
    },
};

export default teacherApi;
