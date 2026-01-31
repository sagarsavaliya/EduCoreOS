// React Query hooks for Students

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import studentApi, {
    Student,
    StudentListParams,
    CreateStudentData
} from '@/services/api/studentApi';
import { handleApiError, ApiError } from '@/lib/axios';
import { AxiosError } from 'axios';

// Query keys
export const studentKeys = {
    all: ['students'] as const,
    lists: () => [...studentKeys.all, 'list'] as const,
    list: (params?: StudentListParams) => [...studentKeys.lists(), params] as const,
    details: () => [...studentKeys.all, 'detail'] as const,
    detail: (id: number) => [...studentKeys.details(), id] as const,
};

// Hook to get list of students
export const useStudents = (params?: StudentListParams) => {
    return useQuery({
        queryKey: studentKeys.list(params),
        queryFn: () => studentApi.getStudents(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        select: (data) => data.data, // Extract data array
    });
};

// Hook to get single student
export const useStudent = (id: number, enabled = true) => {
    return useQuery({
        queryKey: studentKeys.detail(id),
        queryFn: () => studentApi.getStudent(id),
        enabled: enabled && id > 0,
        select: (data) => data.data, // Extract student object
    });
};

// Hook to create student
export const useCreateStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateStudentData) => studentApi.createStudent(data),
        onSuccess: () => {
            // Invalidate and refetch students list
            queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
        },
        onError: (error: unknown) => {
            const errorMessage = handleApiError(error as AxiosError<ApiError>);
            console.error('Create student error:', errorMessage);
            // You can show a toast notification here
        },
    });
};

// Hook to update student
export const useUpdateStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateStudentData> }) =>
            studentApi.updateStudent(id, data),
        onSuccess: (response, variables) => {
            // Invalidate specific student and list
            queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
        },
        onError: (error: unknown) => {
            const errorMessage = handleApiError(error as AxiosError<ApiError>);
            console.error('Update student error:', errorMessage);
        },
    });
};

// Hook to delete student
export const useDeleteStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => studentApi.deleteStudent(id),
        onSuccess: () => {
            // Invalidate students list
            queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
        },
        onError: (error: unknown) => {
            const errorMessage = handleApiError(error as AxiosError<ApiError>);
            console.error('Delete student error:', errorMessage);
        },
    });
};

// Hook to search students
export const useSearchStudents = (query: string, enabled = true) => {
    return useQuery({
        queryKey: [...studentKeys.all, 'search', query],
        queryFn: () => studentApi.searchStudents(query),
        enabled: enabled && query.length > 0,
        staleTime: 1 * 60 * 1000, // 1 minute
        select: (data) => data.data,
    });
};
