// Axios instance with interceptors

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/config/api';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors and token refresh
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // Return the data directly from successful responses
        return response.data;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshToken = localStorage.getItem(API_CONFIG.REFRESH_TOKEN_KEY);

                if (!refreshToken) {
                    // No refresh token available, redirect to login
                    throw new Error('No refresh token available');
                }

                const response = await axios.post(
                    `${API_CONFIG.BASE_URL}/auth/refresh`,
                    { refresh_token: refreshToken }
                );

                const { access_token } = response.data.data;

                // Save new access token
                localStorage.setItem(API_CONFIG.TOKEN_KEY, access_token);

                // Retry the original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem(API_CONFIG.TOKEN_KEY);
                localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_KEY);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        return Promise.reject(error);
    }
);

export default axiosInstance;

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    meta?: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
}

// Helper function to handle API errors
export const handleApiError = (error: AxiosError<ApiError>): string => {
    if (error.response) {
        // Server responded with error
        const apiError = error.response.data?.error;

        if (apiError?.details) {
            // Validation errors
            const firstKey = Object.keys(apiError.details)[0];
            return apiError.details[firstKey][0];
        }

        return apiError?.message || 'An error occurred';
    } else if (error.request) {
        // Request made but no response
        return 'Network error. Please check your connection.';
    } else {
        // Error in request setup
        return error.message || 'An unexpected error occurred';
    }
};
