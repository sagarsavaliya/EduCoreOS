import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/hooks/use-stores';
import { ThemeProvider } from '@/context/ThemeContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/modules/auth/LoginPage';
import SignupPage from '@/modules/auth/SignupPage';
import DashboardPage from '@/modules/insights/DashboardPage';
import AcademicPage from '@/modules/academic/AcademicPage';
import SettingsPage from '@/modules/settings/SettingsPage';
import TimingSettingsPage from '@/modules/settings/TimingSettingsPage';
import LectureConfigPage from '@/modules/settings/LectureConfigPage';
import StudentsPage from '@/modules/people/StudentsPage';
import TeachersPage from '@/modules/people/TeachersPage';
import BatchesPage from '@/modules/routine/BatchesPage';
import TimetablePage from '@/modules/routine/TimetablePage';
import AttendancePage from '@/modules/attendance/AttendancePage';
import AssessmentsPage from '@/modules/assessments/AssessmentsPage';
import FinancePage from '@/modules/finance/FinancePage';
import CommunicationPage from '@/modules/communication/CommunicationPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
});

const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAuthStore();

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
            <Route
                path="/signup"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />}
            />

            {/* Protected Routes - These pages already have MainLayout built-in */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/academic"
                element={
                    <ProtectedRoute allowedRoles={['Owner', 'Admin']}>
                        <AcademicPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <SettingsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings/timing"
                element={
                    <ProtectedRoute allowedRoles={['Owner', 'Admin']}>
                        <TimingSettingsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings/lectures"
                element={
                    <ProtectedRoute allowedRoles={['Owner', 'Admin']}>
                        <LectureConfigPage />
                    </ProtectedRoute>
                }
            />

            {/* New Module Routes - These need MainLayout wrapper */}
            {/* People Management Routes */}
            <Route
                path="/students"
                element={
                    <ProtectedRoute allowedRoles={['Owner', 'Admin', 'Teacher']}>
                        <MainLayout>
                            <StudentsPage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/teachers"
                element={
                    <ProtectedRoute allowedRoles={['Owner', 'Admin']}>
                        <MainLayout>
                            <TeachersPage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Routine & Scheduling Routes */}
            <Route
                path="/batches"
                element={
                    <ProtectedRoute allowedRoles={['Owner', 'Admin']}>
                        <MainLayout>
                            <BatchesPage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/timetable"
                element={
                    <ProtectedRoute allowedRoles={['Owner', 'Admin', 'Teacher']}>
                        <MainLayout>
                            <TimetablePage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Attendance Route */}
            <Route
                path="/attendance"
                element={
                    <ProtectedRoute allowedRoles={['Owner', 'Admin', 'Teacher']}>
                        <MainLayout>
                            <AttendancePage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Assessments Route */}
            <Route
                path="/assessments"
                element={
                    <ProtectedRoute allowedRoles={['Owner', 'Admin', 'Teacher']}>
                        <MainLayout>
                            <AssessmentsPage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Finance Route */}
            <Route
                path="/finance"
                element={
                    <ProtectedRoute allowedRoles={['Owner', 'Admin']}>
                        <MainLayout>
                            <FinancePage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Communication Route */}
            <Route
                path="/communication"
                element={
                    <ProtectedRoute allowedRoles={['Owner', 'Admin', 'Teacher']}>
                        <MainLayout>
                            <CommunicationPage />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />

            {/* Default Routes */}
            <Route
                path="/"
                element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
                }
            />
            <Route
                path="*"
                element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
                }
            />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AppRoutes />
                </Router>
            </QueryClientProvider>
        </ThemeProvider>
    );
};

export default App;
