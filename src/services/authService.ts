// Authentication Service

import axiosInstance, { ApiResponse } from '@/lib/axios';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

// Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface User {
    id: number;
    institute_id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    is_active: boolean;
}

// Authentication Service
export const authService = {
    // Login
    login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
        const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
            API_ENDPOINTS.AUTH.LOGIN,
            credentials
        );

        // Store tokens in localStorage
        if (response.success) {
            localStorage.setItem(API_CONFIG.TOKEN_KEY, response.data.access_token);
            localStorage.setItem(API_CONFIG.REFRESH_TOKEN_KEY, response.data.refresh_token);
        }

        return response;
    },

    // Logout
    logout: async (): Promise<void> => {
        try {
            await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
        } finally {
            // Clear tokens from localStorage regardless of API response
            localStorage.removeItem(API_CONFIG.TOKEN_KEY);
            localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_KEY);
        }
    },

    // Get current user
    getCurrentUser: async (): Promise<ApiResponse<User>> => {
        return axiosInstance.get(API_ENDPOINTS.AUTH.ME);
    },

    // Refresh token
    refreshToken: async (refreshToken: string): Promise<ApiResponse<{ access_token: string }>> => {
        const response = await axiosInstance.post<ApiResponse<{ access_token: string }>>(
            API_ENDPOINTS.AUTH.REFRESH,
            { refresh_token: refreshToken }
        );

        // Update access token in localStorage
        if (response.success) {
            localStorage.setItem(API_CONFIG.TOKEN_KEY, response.data.access_token);
        }

        return response;
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
        return !!token;
    },

    // Get stored token
    getToken: (): string | null => {
        return localStorage.getItem(API_CONFIG.TOKEN_KEY);
    },
};

export default authService;
