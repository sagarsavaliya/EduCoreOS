import React, { useState, useMemo } from 'react';
import { Send, Plus, MessageSquare, Users, Bell, FileText, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import mockData from '@/data/mock-data.json';
import { useAcademicStore, useAuthStore } from '@/hooks/use-stores';

interface Announcement {
    id: number;
    institute_id: number;
    branch_id: number;
    title: string;
    message: string;
    target_audience: 'all' | 'parents' | 'teachers' | 'students';
    priority: 'low' | 'medium' | 'high';
    published_at: string;
    created_by_user_id: number;
    status: string;
}

interface Assignment {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    subject_id: number;
    title: string;
    description: string;
    assigned_date: string;
    due_date: string;
    max_marks: number;
    created_by_user_id: number;
}

interface CombinedMessage extends Announcement {
    type: 'announcement' | 'assignment';
    batch_name?: string;
    subject_name?: string;
    recipients_count: number;
    created_by: string;
    created_at: string;
}

const CommunicationPage: React.FC = () => {
    const { branchId } = useAcademicStore();
    const { user } = useAuthStore();
    const [showNewModal, setShowNewModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'announcements' | 'assignments'>('announcements');
    const [filterRole, setFilterRole] = useState('all');
    const [newMessage, setNewMessage] = useState({
        type: '',
        title: '',
        message: '',
        target_audience: '',
        batch_id: '',
        priority: 'medium'
    });

    // Get data from mock-data.json
    const allAnnouncements = (mockData as any).announcements as Announcement[];
    const allAssignments = (mockData as any).assignments as Assignment[];
    const allUsers = (mockData as any).users || [];
    const allBatches = (mockData as any).batches || [];
    const allSubjects = (mockData as any).subjects || [];

    // Filter and combine messages
    const messages = useMemo((): CombinedMessage[] => {
        const filteredAnnouncements = allAnnouncements
            .filter(a => a.branch_id === branchId)
            .map(a => {
                const creator = allUsers.find((u: any) => u.id === a.created_by_user_id);
                const creatorName = creator ? `${creator.name} (${creator.role})` : 'Unknown';

                return {
                    ...a,
                    type: 'announcement' as const,
                    created_by: creatorName,
                    created_at: a.published_at,
                    recipients_count: a.target_audience === 'all' ? 100 : 30 // Mock count
                };
            });

        const filteredAssignments = allAssignments
            .filter(a => a.branch_id === branchId)
            .map(a => {
                const creator = allUsers.find((u: any) => u.id === a.created_by_user_id);
                const creatorName = creator ? `${creator.name} (${creator.role})` : 'Unknown';
                const batch = allBatches.find((b: any) => b.id === a.batch_id);
                const subject = allSubjects.find((s: any) => s.id === a.subject_id);

                return {
                    id: a.id,
                    institute_id: a.institute_id,
                    branch_id: a.branch_id,
                    title: a.title,
                    message: a.description,
                    target_audience: 'students' as const,
                    priority: 'medium' as const,
                    published_at: a.assigned_date,
                    created_by_user_id: a.created_by_user_id,
                    status: 'published',
                    type: 'assignment' as const,
                    batch_name: batch?.name,
                    subject_name: subject?.name,
                    created_by: creatorName,
                    created_at: a.assigned_date,
                    recipients_count: 25 // Mock count
                };
            });

        return [...filteredAnnouncements, ...filteredAssignments].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [branchId, allAnnouncements, allAssignments, allUsers, allBatches, allSubjects]);

    // Filter messages based on tab and role filter
    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            const tabMatch = activeTab === 'announcements' ? msg.type === 'announcement' : msg.type === 'assignment';
            const roleMatch = filterRole === 'all' || msg.target_audience === filterRole;
            return tabMatch && roleMatch;
        });
    }, [messages, activeTab, filterRole]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'announcement': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'assignment': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'parents': return 'bg-blue-50 dark:bg-blue-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
            case 'teachers': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'students': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'all': return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'medium': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            case 'low': return 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'announcement': return <Bell className="h-4 w-4" />;
            case 'assignment': return <FileText className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // In a real app, this would send data to an API
        console.log('New message:', newMessage);

        // Reset form and close modal
        setNewMessage({
            type: '',
            title: '',
            message: '',
            target_audience: '',
            batch_id: '',
            priority: 'medium'
        });
        setShowNewModal(false);

        // Show success message (in a real app, use a toast/notification)
        alert('Message sent successfully!');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold  dark:text-white">Communication</h1>
                        <p className="text-sm dark:text-slate-400">Send announcements and assignments</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Total Messages</p>
                            <p className="text-2xl font-bold  dark:text-white">{messages.length}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Announcements</p>
                            <p className="text-2xl font-bold  dark:text-white">
                                {messages.filter(m => m.type === 'announcement').length}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                            <Bell className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Assignments</p>
                            <p className="text-2xl font-bold  dark:text-white">
                                {messages.filter(m => m.type === 'assignment').length}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Recipients</p>
                            <p className="text-2xl font-bold  dark:text-white">
                                {messages.reduce((acc, m) => acc + m.recipients_count, 0)}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className=" dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    {/* Left side - Tabs and Filter */}
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                        {/* Tab Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setActiveTab('announcements')}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                                    activeTab === 'announcements'
                                        ? "bg-blue-600 dark:bg-blue-600 text-white shadow-sm"
                                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                                )}
                            >
                                Announcements
                            </button>
                            <button
                                onClick={() => setActiveTab('assignments')}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                                    activeTab === 'assignments'
                                        ? "bg-blue-600 dark:bg-blue-600 text-white shadow-sm"
                                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                                )}
                            >
                                Assignments
                            </button>
                        </div>

                        {/* Filter */}
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-3 py-2 border  dark:border-slate-600 rounded-md  dark:bg-slate-700 dark:text-white min-w-45"
                        >
                            <option value="all">All Recipients</option>
                            <option value="parents">Parents</option>
                            <option value="teachers">Teachers</option>
                            <option value="students">Students</option>
                        </select>
                    </div>

                    {/* Right side - New Message Button */}
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="
              inline-flex items-center gap-2
              bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600
              text-white px-4 py-2 rounded-md
              whitespace-nowrap
            "
                    >
                        <Plus className="h-4 w-4" />
                        New Message
                    </button>
                </div>
            </div>

            {/* Messages List */}
            <div className="space-y-4">
                {filteredMessages.length === 0 ? (
                    <div className="dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm p-12 text-center">
                        <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" strokeWidth={2} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No messages found</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Try adjusting your filters or create a new message</p>
                    </div>
                ) : (
                    filteredMessages.map((message) => (
                        <div key={`${message.type}-${message.id}`} className=" dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold border",
                                                getTypeColor(message.type)
                                            )}>
                                                {getTypeIcon(message.type)}
                                                {message.type === 'announcement' ? 'Announcement' : 'Assignment'}
                                            </span>
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-xs font-semibold border capitalize",
                                                getRoleColor(message.target_audience)
                                            )}>
                                                {message.target_audience === 'all' ? 'All' : message.target_audience}
                                            </span>
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-xs font-semibold border capitalize",
                                                getPriorityColor(message.priority)
                                            )}>
                                                {message.priority}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold dark:text-white mb-1">{message.title}</h3>
                                        {message.batch_name && (
                                            <p className="text-xs font-semibold  dark:text-slate-400">
                                                {message.batch_name}
                                                {message.subject_name && ` • ${message.subject_name}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-2">
                                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                                        </div>
                                        <p className="text-xs font-semibold  dark:text-slate-400">{message.recipients_count}</p>
                                        <p className="text-xs  dark:text-slate-500">recipients</p>
                                    </div>
                                </div>

                                {/* Message Body */}
                                <div className="mb-4">
                                    <p className="text-sm  dark:text-slate-300 leading-relaxed">{message.message}</p>
                                </div>

                                {/* Footer */}
                                <div className="pt-4 border-t  dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs  dark:text-slate-400">
                                        <div className="h-6 w-6 rounded-full  dark:bg-slate-700 flex items-center justify-center">
                                            <span className="text-[10px] font-bold  dark:text-slate-300">
                                                {message.created_by.split(' ').map((n: string) => n[0]).join('')}
                                            </span>
                                        </div>
                                        <span className="font-medium">{message.created_by}</span>
                                        <span className=" dark:text-slate-600">•</span>
                                        <span>{formatDate(message.created_at)}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" icon={<Send className="h-4 w-4" />}>
                                        Resend
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* New Message Modal */}
            <Modal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                title="New Message"
            >
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Select
                        label="Message Type"
                        value={newMessage.type}
                        onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value })}
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="announcement">Announcement</option>
                        <option value="assignment">Assignment</option>
                    </Select>

                    <Input
                        label="Title"
                        placeholder="Enter message title"
                        value={newMessage.title}
                        onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Message</label>
                        <textarea
                            className="w-full px-4 py-2.5 rounded-lg border dark:border-slate-600  dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                            rows={5}
                            placeholder="Enter your message here..."
                            value={newMessage.message}
                            onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                            required
                        />
                    </div>

                    <div className="pt-4 border-t  dark:border-slate-700">
                        <h3 className="text-sm font-semibold dark:text-white mb-3">Target Audience</h3>

                        <div className="space-y-4">
                            <Select
                                label="Send To"
                                value={newMessage.target_audience}
                                onChange={(e) => setNewMessage({ ...newMessage, target_audience: e.target.value })}
                                required
                            >
                                <option value="">Select Recipients</option>
                                <option value="all">All (Students, Parents, Teachers)</option>
                                <option value="parents">Parents Only</option>
                                <option value="students">Students Only</option>
                                <option value="teachers">Teachers Only</option>
                            </Select>

                            <Select
                                label="Specific Batch (Optional)"
                                value={newMessage.batch_id}
                                onChange={(e) => setNewMessage({ ...newMessage, batch_id: e.target.value })}
                            >
                                <option value="">All Batches</option>
                                {allBatches
                                    .filter((b: any) => b.branch_id === branchId)
                                    .map((batch: any) => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.name}
                                        </option>
                                    ))}
                            </Select>

                            <Select
                                label="Priority"
                                value={newMessage.priority}
                                onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                                required
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div className="text-xs text-blue-800 dark:text-blue-300">
                                <p className="font-semibold mb-1">Notification Delivery</p>
                                <p>Messages will be sent via SMS, Email, and in-app notifications based on user preferences.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowNewModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            icon={<Send className="h-4 w-4" />}
                        >
                            Send Message
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CommunicationPage;
