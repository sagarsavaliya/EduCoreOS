// Student API Service

import axiosInstance, { ApiResponse } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

// Types
export interface Student {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    standard_id: number;
    medium_id: number;
    admission_number: string;
    roll_number: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string;
    gender: string;
    date_of_birth: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    admission_date: string;
    status: string;
    photo_url: string;
}

export interface StudentListParams {
    page?: number;
    per_page?: number;
    branch_id?: number;
    academic_year_id?: number;
    standard_id?: number;
    medium_id?: number;
    status?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface CreateStudentData {
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    standard_id: number;
    medium_id: number;
    admission_number: string;
    roll_number: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    admission_date: string;
    status?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
    id: number;
}

// API Functions
export const studentApi = {
    // Get list of students
    getStudents: async (params?: StudentListParams): Promise<ApiResponse<Student[]>> => {
        return axiosInstance.get(API_ENDPOINTS.STUDENTS.LIST, { params });
    },

    // Get single student by ID
    getStudent: async (id: number): Promise<ApiResponse<Student>> => {
        return axiosInstance.get(API_ENDPOINTS.STUDENTS.DETAIL(id));
    },

    // Create new student
    createStudent: async (data: CreateStudentData): Promise<ApiResponse<Student>> => {
        return axiosInstance.post(API_ENDPOINTS.STUDENTS.CREATE, data);
    },

    // Update existing student
    updateStudent: async (id: number, data: Partial<CreateStudentData>): Promise<ApiResponse<Student>> => {
        return axiosInstance.put(API_ENDPOINTS.STUDENTS.UPDATE(id), data);
    },

    // Delete student
    deleteStudent: async (id: number): Promise<ApiResponse<void>> => {
        return axiosInstance.delete(API_ENDPOINTS.STUDENTS.DELETE(id));
    },

    // Search students
    searchStudents: async (query: string): Promise<ApiResponse<Student[]>> => {
        return axiosInstance.get(API_ENDPOINTS.STUDENTS.LIST, {
            params: { search: query }
        });
    },
};

export default studentApi;
