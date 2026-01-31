// Assessment API Service (Tests & Marks)

import axiosInstance, { ApiResponse } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

// Types
export interface Test {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    subject_id: number;
    name: string;
    test_date: string;
    max_marks: number;
    passing_marks: number;
    weightage: number;
    status: string;
    created_by_user_id: number;
}

export interface Mark {
    id: number;
    test_id: number;
    student_id: number;
    marks_obtained: number;
    remarks: string | null;
    marked_by_user_id: number;
    marked_at: string;
}

export interface TestListParams {
    page?: number;
    per_page?: number;
    branch_id?: number;
    academic_year_id?: number;
    batch_id?: number;
    subject_id?: number;
    status?: string;
    from?: string; // Date
    to?: string;   // Date
}

export interface CreateTestData {
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    subject_id: number;
    name: string;
    test_date: string;
    max_marks: number;
    passing_marks: number;
    weightage: number;
    status?: string;
    created_by_user_id: number;
}

export interface CreateMarkData {
    test_id: number;
    student_id: number;
    marks_obtained: number;
    remarks?: string;
    marked_by_user_id: number;
}

// API Functions
export const assessmentApi = {
    // Tests
    getTests: async (params?: TestListParams): Promise<ApiResponse<Test[]>> => {
        return axiosInstance.get(API_ENDPOINTS.TESTS.LIST, { params });
    },

    getTest: async (id: number): Promise<ApiResponse<Test>> => {
        return axiosInstance.get(API_ENDPOINTS.TESTS.DETAIL(id));
    },

    createTest: async (data: CreateTestData): Promise<ApiResponse<Test>> => {
        return axiosInstance.post(API_ENDPOINTS.TESTS.CREATE, data);
    },

    updateTest: async (id: number, data: Partial<CreateTestData>): Promise<ApiResponse<Test>> => {
        return axiosInstance.put(API_ENDPOINTS.TESTS.UPDATE(id), data);
    },

    deleteTest: async (id: number): Promise<ApiResponse<void>> => {
        return axiosInstance.delete(API_ENDPOINTS.TESTS.DELETE(id));
    },

    // Marks
    getTestMarks: async (testId: number): Promise<ApiResponse<Mark[]>> => {
        return axiosInstance.get(API_ENDPOINTS.TESTS.MARKS(testId));
    },

    createMark: async (data: CreateMarkData): Promise<ApiResponse<Mark>> => {
        return axiosInstance.post(API_ENDPOINTS.MARKS.CREATE, data);
    },

    updateMark: async (id: number, data: Partial<CreateMarkData>): Promise<ApiResponse<Mark>> => {
        return axiosInstance.put(API_ENDPOINTS.MARKS.UPDATE(id), data);
    },

    deleteMark: async (id: number): Promise<ApiResponse<void>> => {
        return axiosInstance.delete(API_ENDPOINTS.MARKS.DELETE(id));
    },
};

export default assessmentApi;
