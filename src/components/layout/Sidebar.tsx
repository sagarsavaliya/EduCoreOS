import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Calendar,
    Clock,
    CheckCircle,
    FileText,
    DollarSign,
    MessageSquare,
    BookOpen,
    Settings,
    Building2,
    LogOut
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/hooks/use-stores';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            roles: ['Owner', 'Admin', 'Teacher', 'Parent', 'Student']
        },
        {
            name: 'Academic',
            href: '/academic',
            icon: BookOpen,
            roles: ['Owner', 'Admin']
        },
        {
            name: 'Students',
            href: '/students',
            icon: Users,
            roles: ['Owner', 'Admin', 'Teacher']
        },
        {
            name: 'Teachers',
            href: '/teachers',
            icon: GraduationCap,
            roles: ['Owner', 'Admin']
        },
        {
            name: 'Batches',
            href: '/batches',
            icon: Users,
            roles: ['Owner', 'Admin']
        },
        {
            name: 'Timetable',
            href: '/timetable',
            icon: Calendar,
            roles: ['Owner', 'Admin', 'Teacher']
        },
        {
            name: 'Attendance',
            href: '/attendance',
            icon: CheckCircle,
            roles: ['Owner', 'Admin', 'Teacher']
        },
        {
            name: 'Assessments',
            href: '/assessments',
            icon: FileText,
            roles: ['Owner', 'Admin', 'Teacher']
        },
        {
            name: 'Finance',
            href: '/finance',
            icon: DollarSign,
            roles: ['Owner', 'Admin']
        },
        {
            name: 'Communication',
            href: '/communication',
            icon: MessageSquare,
            roles: ['Owner', 'Admin', 'Teacher']
        }
    ];

    const filteredNavigation = navigation.filter(item =>
        item.roles.includes(user?.role || '')
    );

    return (
        <div className="h-screen w-64 bg-background border-r border-border flex flex-col dark:bg-slate-950">
            {/* Logo */}
            <div className="p-6 border-b border-border dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-foreground dark:text-white">EduCoreOS</h1>
                        <p className="text-xs text-muted-foreground dark:text-slate-400">{user?.role}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 dark:bg-slate-950">
                <div className="space-y-1">
                    {filteredNavigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                    isActive
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-foreground dark:text-slate-300 hover:bg-secondary dark:hover:bg-slate-800"
                                )}
                            >
                                <item.icon className="h-5 w-5" strokeWidth={2} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* User Info */}
            <div className="border-t border-border dark:border-slate-800 dark:bg-slate-950">
                <div className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary dark:text-primary/80">
                                {user?.name.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground dark:text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 pb-4 flex items-center gap-2 dark:bg-slate-950">
                    {/* Left: Settings */}
                    <Link
                        to="/settings"
                        className={cn(
                            "p-2.5 rounded-lg transition-all",
                            location.pathname === "/settings"
                                ? "bg-primary text-white shadow-sm"
                                : "text-foreground dark:text-slate-300 hover:bg-secondary dark:hover:bg-slate-800"
                        )}
                        title="Settings">

                        <Settings className="h-5 w-5" strokeWidth={2} />
                    </Link>

                    {/* Spacer */}
                    <div className="ml-auto" />

                    {/* Right: Sign Out */}
                    <button
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10 dark:hover:bg-red-950/20 transition-all"
                    >
                        <LogOut className="h-5 w-5" strokeWidth={2} />
                        <span>Sign Out</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Sidebar;
