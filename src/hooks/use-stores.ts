import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AcademicContext {
    academicYearId: number | null;
    branchId: number | null;
    mediumId: number | null;
    standardId: number | null;
    setContext: (updates: Partial<AcademicContext>) => void;
}

export const useAcademicStore = create<AcademicContext>((set) => ({
    academicYearId: 1, // Defaulting to 1 for mock data
    branchId: 1,
    mediumId: 1,
    standardId: 1,
    setContext: (updates) => set((state) => ({ ...state, ...updates })),
}));

export type UserRole = 'Owner' | 'Admin' | 'Teacher' | 'Parent' | 'Student';

export interface User {
    id: number;
    institute_id: number;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    is_active: boolean;
    last_login_at?: string;
    created_at: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            setUser: (user) => set({ user }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
