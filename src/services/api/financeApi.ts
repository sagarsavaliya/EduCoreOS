// Finance API Service

import axiosInstance, { ApiResponse } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

// Types
export interface FeeStructure {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    standard_id: number;
    name: string;
    total_amount: number;
    currency: string;
    frequency: string;
    due_date: string;
    status: string;
}

export interface FeeLedger {
    id: number;
    institute_id: number;
    branch_id: number;
    student_id: number;
    academic_year_id: number;
    fee_structure_id: number;
    transaction_date: string;
    transaction_type: 'charge' | 'payment' | 'refund' | 'adjustment';
    amount: number;
    balance: number;
    description: string;
    created_by_user_id: number;
    payment_id?: number;
}

export interface FeePayment {
    id: number;
    institute_id: number;
    branch_id: number;
    student_id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    transaction_id: string;
    status: string;
    received_by_user_id: number;
}

export interface FeeSummary {
    student_id: number;
    total_fees: number;
    total_paid: number;
    balance: number;
    last_payment_date: string | null;
    last_payment_amount: number | null;
    payment_history: FeePayment[];
}

export interface CreatePaymentData {
    institute_id: number;
    branch_id: number;
    student_id: number;
    amount: number;
    payment_date: string;
    payment_method: 'cash' | 'upi' | 'bank_transfer' | 'debit_card' | 'credit_card' | 'cheque';
    transaction_id: string;
    received_by_user_id: number;
}

// API Functions
export const financeApi = {
    // Fee Structures
    getFeeStructures: async (params?: {
        branch_id?: number;
        academic_year_id?: number;
        standard_id?: number;
    }): Promise<ApiResponse<FeeStructure[]>> => {
        return axiosInstance.get(API_ENDPOINTS.FEE.STRUCTURES, { params });
    },

    // Fee Ledgers
    getFeeLedgers: async (params?: {
        student_id?: number;
        academic_year_id?: number;
        from?: string;
        to?: string;
    }): Promise<ApiResponse<FeeLedger[]>> => {
        return axiosInstance.get(API_ENDPOINTS.FEE.LEDGERS, { params });
    },

    // Fee Payments
    getFeePayments: async (params?: {
        page?: number;
        per_page?: number;
        branch_id?: number;
        student_id?: number;
        from?: string;
        to?: string;
        payment_method?: string;
        status?: string;
    }): Promise<ApiResponse<FeePayment[]>> => {
        return axiosInstance.get(API_ENDPOINTS.FEE.PAYMENTS, { params });
    },

    createPayment: async (data: CreatePaymentData): Promise<ApiResponse<FeePayment>> => {
        return axiosInstance.post(API_ENDPOINTS.FEE.CREATE_PAYMENT, data);
    },

    // Student Fee Summary
    getStudentFeeSummary: async (studentId: number): Promise<ApiResponse<FeeSummary>> => {
        return axiosInstance.get(API_ENDPOINTS.FEE.STUDENT_SUMMARY(studentId));
    },
};

export default financeApi;
