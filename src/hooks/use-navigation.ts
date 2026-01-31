import { LayoutDashboard, Users, BookOpen, Clock, BarChart3, Settings, CreditCard, MessageSquare, ShieldCheck, ClipboardCheck, GraduationCap, Calendar, CheckCircle, FileText } from 'lucide-react';

export type Role = 'Owner' | 'Admin' | 'Teacher' | 'Parent' | 'Student';

export interface NavItem {
    label: string;
    icon: any;
    path: string;
    roles: Role[];
    badge?: string;
}

export const navigationItems: NavItem[] = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
        roles: ['Owner', 'Admin', 'Teacher', 'Parent', 'Student'],
    },
    {
        label: 'Academic Core',
        icon: BookOpen,
        path: '/academic',
        roles: ['Owner', 'Admin'],
    },
    {
        label: 'Students',
        icon: Users,
        path: '/students',
        roles: ['Owner', 'Admin', 'Teacher'],
    },
    {
        label: 'Teachers',
        icon: GraduationCap,
        path: '/teachers',
        roles: ['Owner', 'Admin'],
    },
    {
        label: 'Batches',
        icon: ClipboardCheck,
        path: '/batches',
        roles: ['Owner', 'Admin'],
    },
    {
        label: 'Timetable',
        icon: Calendar,
        path: '/timetable',
        roles: ['Owner', 'Admin', 'Teacher'],
    },
    {
        label: 'Attendance',
        icon: CheckCircle,
        path: '/attendance',
        roles: ['Owner', 'Admin', 'Teacher'],
    },
    {
        label: 'Assessments',
        icon: FileText,
        path: '/assessments',
        roles: ['Owner', 'Admin', 'Teacher'],
    },
    {
        label: 'Finance',
        icon: CreditCard,
        path: '/finance',
        roles: ['Owner', 'Admin'],
        badge: 'Due',
    },
    {
        label: 'Communication',
        icon: MessageSquare,
        path: '/communication',
        roles: ['Owner', 'Admin', 'Teacher'],
    },
];

export const useNavigation = (role: Role) => {
    return navigationItems.filter(item => item.roles.includes(role));
};
