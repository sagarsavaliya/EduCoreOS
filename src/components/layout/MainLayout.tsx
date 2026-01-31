import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAcademicStore, useAuthStore } from '@/hooks/use-stores';
import { Building2, Calendar, Bell } from 'lucide-react';
import { useMockQuery, dal } from '@/hooks/use-mock-data';
import Sidebar from '@/components/layout/Sidebar';
import ThemeToggle from '@/components/ui/ThemeToggle';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { academicYearId, branchId } = useAcademicStore();

    // Fetch context data
    const { data: branch } = useMockQuery(['branch', branchId?.toString() || ''], () => dal.getBranch(branchId!), { enabled: !!branchId });
    const { data: academicYear } = useMockQuery(['academicYear', academicYearId?.toString() || ''], () => dal.getAcademicYear(academicYearId!), { enabled: !!academicYearId });

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar />
            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden dark:bg-slate-950">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b bg-card/50 backdrop-blur-xl z-10 dark:bg-slate-900/50 dark:border-slate-800">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h2 className="text-lg font-bold text-foreground dark:text-white">Welcome back, {user?.name.split(' ')[0]}</h2>
                            <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium flex items-center">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                {user?.role} Account • {branch?.name || 'Loading...'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Academic Context */}
                        <div className="hidden lg:flex items-center bg-secondary/30 rounded-2xl border p-1 capitalize">
                            <button className="px-4 py-1.5 rounded-xl bg-background shadow-sm border text-xs font-bold text-primary flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-2" />
                                {academicYear?.name || '...'}
                            </button>
                            <button className="px-4 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center">
                                <Building2 className="h-3.5 w-3.5 mr-2" />
                                {branch?.name || '...'}
                            </button>
                        </div>

                        {/* Notification */}
                        <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all border cursor-pointer relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-secondary" />
                        </div>

                        {/* Theme Toggle */}
                        <ThemeToggle variant="icon" />

                        {/* User Avatar */}
                        <div 
                            className="h-10 w-10 rounded-xl bg-linear-to-tr from-primary to-indigo-600 p-0.5 shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 transition-all"
                            onClick={() => navigate('/settings')}
                        >
                            <div className="h-full w-full rounded-[10px] bg-background flex items-center justify-center overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="avatar" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-background dark:bg-slate-950">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
