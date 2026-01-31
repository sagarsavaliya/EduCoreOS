// API Configuration

export const API_CONFIG = {
    // Base URL - Change this to your backend API URL
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',

    // API Version
    VERSION: 'v1',

    // Timeout in milliseconds
    TIMEOUT: 30000,

    // Retry configuration
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,

    // Pagination defaults
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,

    // Token configuration
    TOKEN_KEY: 'edu_core_access_token',
    REFRESH_TOKEN_KEY: 'edu_core_refresh_token',

    // Feature flags
    USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false,
};

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
    },

    // Students
    STUDENTS: {
        LIST: '/students',
        DETAIL: (id: number) => `/students/${id}`,
        CREATE: '/students',
        UPDATE: (id: number) => `/students/${id}`,
        DELETE: (id: number) => `/students/${id}`,
    },

    // Teachers
    TEACHERS: {
        LIST: '/teachers',
        DETAIL: (id: number) => `/teachers/${id}`,
        CREATE: '/teachers',
        UPDATE: (id: number) => `/teachers/${id}`,
        DELETE: (id: number) => `/teachers/${id}`,
    },

    // Batches
    BATCHES: {
        LIST: '/batches',
        DETAIL: (id: number) => `/batches/${id}`,
        CREATE: '/batches',
        UPDATE: (id: number) => `/batches/${id}`,
        DELETE: (id: number) => `/batches/${id}`,
        STUDENTS: (id: number) => `/batches/${id}/students`,
        ADD_STUDENT: (id: number) => `/batches/${id}/students`,
        REMOVE_STUDENT: (batchId: number, studentId: number) => `/batches/${batchId}/students/${studentId}`,
    },

    // Attendance
    ATTENDANCE: {
        LIST: '/attendance',
        DETAIL: (id: number) => `/attendance/${id}`,
        CREATE: '/attendance',
        UPDATE: (id: number) => `/attendance/${id}`,
        BULK_CREATE: '/attendance/bulk',
        STATS: '/attendance/stats',
    },

    // Assessments
    TESTS: {
        LIST: '/tests',
        DETAIL: (id: number) => `/tests/${id}`,
        CREATE: '/tests',
        UPDATE: (id: number) => `/tests/${id}`,
        DELETE: (id: number) => `/tests/${id}`,
        MARKS: (id: number) => `/tests/${id}/marks`,
    },

    MARKS: {
        CREATE: '/marks',
        UPDATE: (id: number) => `/marks/${id}`,
        DELETE: (id: number) => `/marks/${id}`,
    },

    // Finance
    FEE: {
        STRUCTURES: '/fee-structures',
        LEDGERS: '/fee-ledgers',
        PAYMENTS: '/fee-payments',
        CREATE_PAYMENT: '/fee-payments',
        STUDENT_SUMMARY: (studentId: number) => `/students/${studentId}/fee-summary`,
    },

    // Communication
    ANNOUNCEMENTS: {
        LIST: '/announcements',
        DETAIL: (id: number) => `/announcements/${id}`,
        CREATE: '/announcements',
        UPDATE: (id: number) => `/announcements/${id}`,
        DELETE: (id: number) => `/announcements/${id}`,
    },

    ASSIGNMENTS: {
        LIST: '/assignments',
        DETAIL: (id: number) => `/assignments/${id}`,
        CREATE: '/assignments',
        UPDATE: (id: number) => `/assignments/${id}`,
        DELETE: (id: number) => `/assignments/${id}`,
    },

    // Timetable
    TIMETABLE: {
        LIST: '/timetable',
        DETAIL: (id: number) => `/timetable/${id}`,
        CREATE: '/timetable',
        UPDATE: (id: number) => `/timetable/${id}`,
        DELETE: (id: number) => `/timetable/${id}`,
    },

    // Academic Setup
    ACADEMIC: {
        YEARS: '/academic-years',
        STANDARDS: '/standards',
        MEDIUMS: '/mediums',
        SUBJECTS: '/subjects',
        INSTITUTES: '/institutes',
        BRANCHES: '/branches',
    },
};
