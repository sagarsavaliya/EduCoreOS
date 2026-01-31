// Batch API Service

import axiosInstance, { ApiResponse } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

// Types
export interface Batch {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    standard_id: number;
    medium_id: number;
    name: string;
    capacity: number;
    status: string;
}

export interface BatchListParams {
    page?: number;
    per_page?: number;
    branch_id?: number;
    academic_year_id?: number;
    standard_id?: number;
    medium_id?: number;
    status?: string;
    search?: string;
}

export interface CreateBatchData {
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    standard_id: number;
    medium_id: number;
    name: string;
    capacity: number;
    status?: string;
}

export interface BatchStudent {
    batch_id: number;
    student_id: number;
    enrollment_date: string;
}

// API Functions
export const batchApi = {
    // Get list of batches
    getBatches: async (params?: BatchListParams): Promise<ApiResponse<Batch[]>> => {
        return axiosInstance.get(API_ENDPOINTS.BATCHES.LIST, { params });
    },

    // Get single batch by ID
    getBatch: async (id: number): Promise<ApiResponse<Batch>> => {
        return axiosInstance.get(API_ENDPOINTS.BATCHES.DETAIL(id));
    },

    // Create new batch
    createBatch: async (data: CreateBatchData): Promise<ApiResponse<Batch>> => {
        return axiosInstance.post(API_ENDPOINTS.BATCHES.CREATE, data);
    },

    // Update existing batch
    updateBatch: async (id: number, data: Partial<CreateBatchData>): Promise<ApiResponse<Batch>> => {
        return axiosInstance.put(API_ENDPOINTS.BATCHES.UPDATE(id), data);
    },

    // Delete batch
    deleteBatch: async (id: number): Promise<ApiResponse<void>> => {
        return axiosInstance.delete(API_ENDPOINTS.BATCHES.DELETE(id));
    },

    // Get batch students
    getBatchStudents: async (batchId: number): Promise<ApiResponse<BatchStudent[]>> => {
        return axiosInstance.get(API_ENDPOINTS.BATCHES.STUDENTS(batchId));
    },

    // Add student to batch
    addStudentToBatch: async (batchId: number, studentId: number): Promise<ApiResponse<BatchStudent>> => {
        return axiosInstance.post(API_ENDPOINTS.BATCHES.ADD_STUDENT(batchId), {
            student_id: studentId,
            enrollment_date: new Date().toISOString().split('T')[0],
        });
    },

    // Remove student from batch
    removeStudentFromBatch: async (batchId: number, studentId: number): Promise<ApiResponse<void>> => {
        return axiosInstance.delete(API_ENDPOINTS.BATCHES.REMOVE_STUDENT(batchId, studentId));
    },
};

export default batchApi;
