import React, { useState, useMemo } from 'react';
import { GraduationCap, Plus, Search, Eye, Edit2, Trash2, Award, Clock, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { useAcademicStore } from '@/hooks/use-stores';
import { useMockQuery, dal } from '@/hooks/use-mock-data';
import mockData from '@/data/mock-data.json';

interface Teacher {
    id: number;
    institute_id: number;
    branch_id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    alternate_phone: string | null;
    gender: string;
    date_of_birth: string;
    qualification: string;
    specialization: string;
    experience_years: number;
    joining_date: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    status: 'active' | 'inactive';
    photo_url: string;
    // Enriched fields
    assigned_batches?: number;
    total_students?: number;
    subjects?: string[];
}

const TeachersPage: React.FC = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSpecialization, setFilterSpecialization] = useState('all');

    const { branchId } = useAcademicStore();

    // Fetch real data from mockdata.json
    const { data: teachers = [], isLoading: loadingTeachers } = useMockQuery(
        ['teachers', branchId?.toString() || ''],
        () => dal.getTeachers(branchId!),
        { enabled: !!branchId }
    );

    const { data: branch } = useMockQuery(
        ['branch', branchId?.toString() || ''],
        () => dal.getBranch(branchId!),
        { enabled: !!branchId }
    );

    const { data: batches = [] } = useMockQuery(
        ['batches', branchId?.toString() || ''],
        () => dal.getBatches(branchId!),
        { enabled: !!branchId }
    );

    // Enrich teachers with calculated data
    const enrichedTeachers = useMemo(() => {
        return teachers.map((teacher: any) => {
            // Get assigned batches
            const batchTeachers = (mockData as any).batch_teachers?.filter((bt: any) => bt.teacher_id === teacher.id) || [];
            const assignedBatchIds = batchTeachers.map((bt: any) => bt.batch_id);

            // Get total students
            const batchStudents = (mockData as any).batch_students?.filter((bs: any) =>
                assignedBatchIds.includes(bs.batch_id)
            ) || [];

            // Get subjects from assigned batches
            const teacherSubjects = batchTeachers
                .map((bt: any) => {
                    const batch = batches.find((b: any) => b.id === bt.batch_id);
                    return batch?.name || '';
                })
                .filter((name: string) => name);

            return {
                ...teacher,
                assigned_batches: batchTeachers.length,
                total_students: batchStudents.length,
                subjects: teacherSubjects,
            };
        });
    }, [teachers, batches]);

    // Filter teachers
    const filteredTeachers = useMemo(() => {
        return enrichedTeachers.filter((teacher: any) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    teacher.first_name.toLowerCase().includes(query) ||
                    teacher.last_name.toLowerCase().includes(query) ||
                    teacher.email.toLowerCase().includes(query) ||
                    teacher.phone.includes(query) ||
                    teacher.employee_code.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (filterStatus !== 'all' && teacher.status !== filterStatus) {
                return false;
            }

            // Specialization filter
            if (filterSpecialization !== 'all' &&
                !teacher.specialization.toLowerCase().includes(filterSpecialization.toLowerCase())) {
                return false;
            }

            return true;
        });
    }, [enrichedTeachers, searchQuery, filterStatus, filterSpecialization]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = enrichedTeachers.length;
        const active = enrichedTeachers.filter((t: any) => t.status === 'active').length;
        const totalBatches = enrichedTeachers.reduce((acc: number, t: any) => acc + (t.assigned_batches || 0), 0);
        const totalStudents = enrichedTeachers.reduce((acc: number, t: any) => acc + (t.total_students || 0), 0);

        return { total, active, totalBatches, totalStudents };
    }, [enrichedTeachers]);

    // Get unique specializations
    const specializations = useMemo(() => {
        const specs = new Set<string>();
        teachers.forEach((t: any) => {
            if (t.specialization) specs.add(t.specialization);
        });
        return Array.from(specs);
    }, [teachers]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'inactive': return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
        }
    };

    const handleViewDetails = (teacher: any) => {
        setSelectedTeacher(teacher);
        setShowDetailModal(true);
    };

    const handleEdit = (teacher: any) => {
        setSelectedTeacher(teacher);
        setShowEditModal(true);
    };

    const handleDelete = (teacher: any) => {
        if (confirm(`Are you sure you want to delete ${teacher.first_name} ${teacher.last_name}?`)) {
            alert('Delete functionality will be implemented with backend API');
        }
    };

    const handleAddTeacher = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Add teacher functionality will be implemented with backend API');
        setShowAddModal(false);
    };

    const handleUpdateTeacher = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Update teacher functionality will be implemented with backend API');
        setShowEditModal(false);
    };

    if (loadingTeachers) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Loading teachers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold  dark:text-white">Teachers</h1>
                        <p className="text-sm  dark:text-slate-400">Manage teacher records and assignments</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Total Teachers</p>
                            <p className="text-2xl font-bold  dark:text-white">{stats.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Active</p>
                            <p className="text-2xl font-bold  dark:text-white">{stats.active}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Total Batches</p>
                            <p className="text-2xl font-bold  dark:text-white">{stats.totalBatches}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Total Students</p>
                            <p className="text-2xl font-bold  dark:text-white">{stats.totalStudents}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm p-4">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    {/* Left side - Search and Filters */}
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                        {/* Search */}
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, or employee code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="
                  w-full pl-10 pr-3 py-2
                  border  dark:border-slate-600 rounded-md
                   dark:bg-slate-700 dark:text-white dark:placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                "
                            />
                        </div>

                        {/* Specialization */}
                        <select
                            value={filterSpecialization}
                            onChange={(e) => setFilterSpecialization(e.target.value)}
                            className="px-3 py-2 border dark:border-slate-600 rounded-md  dark:bg-slate-700 dark:text-white min-w-50"
                        >
                            <option value="all">All Specializations</option>
                            {specializations.map((spec) => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>

                        {/* Status */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border  dark:border-slate-600 rounded-md  dark:bg-slate-700 dark:text-white min-w-35"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Right side - Add Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="
              inline-flex items-center gap-2
              bg-blue-600 hover:bg-blue-700
              text-white px-4 py-2 rounded-md
              whitespace-nowrap
            "
                    >
                        <Plus className="h-4 w-4" />
                        Add Teacher
                    </button>
                </div>
            </div>

            {/* Teachers Table */}
            <div className=" dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="dark:bg-slate-700 border-b  dark:border-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Employee Code</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Specialization</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Qualification</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Experience</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Batches</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Students</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredTeachers.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                        No teachers found
                                    </td>
                                </tr>
                            ) : (
                                filteredTeachers.map((teacher: any) => (
                                    <tr key={teacher.id} className="dark:hover:bg-slate-700 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium  dark:text-white">
                                            {teacher.employee_code}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-semibold  dark:text-white">
                                                    {teacher.first_name} {teacher.last_name}
                                                </p>
                                                <p className="text-xs  dark:text-slate-400">{teacher.email}</p>
                                                <p className="text-xs  dark:text-slate-400">{teacher.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm  dark:text-slate-300">
                                            {teacher.specialization}
                                        </td>
                                        <td className="px-4 py-3 text-sm  dark:text-slate-300">
                                            {teacher.qualification}
                                        </td>
                                        <td className="px-4 py-3 text-sm  dark:text-slate-300">
                                            {teacher.experience_years} years
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                {teacher.assigned_batches || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                {teacher.total_students || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-semibold border",
                                                getStatusColor(teacher.status)
                                            )}>
                                                {teacher.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(teacher)}
                                                    className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors group"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4  dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(teacher)}
                                                    className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors group"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4  group-hover:text-amber-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(teacher)}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors group"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4  dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-sm dark:text-slate-400">
                        Showing <span className="font-semibold">{filteredTeachers.length}</span> of <span className="font-semibold">{stats.total}</span> teachers
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </div>
            </div>

            {/* Add Teacher Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Teacher"
            >
                <form onSubmit={handleAddTeacher} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" placeholder="Enter first name" required />
                        <Input label="Last Name" placeholder="Enter last name" required />
                    </div>

                    <Input label="Employee Code" placeholder="e.g., TCH001" required />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Email" type="email" placeholder="teacher@example.com" required />
                        <Input label="Phone" placeholder="+91 98765 43210" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Date of Birth" type="date" required />
                        <Select label="Gender" required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </Select>
                    </div>

                    <Input label="Qualification" placeholder="e.g., M.Sc. Mathematics, B.Ed." required />
                    <Input label="Specialization" placeholder="e.g., Mathematics" required />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Experience (Years)" type="number" min="0" required />
                        <Input label="Joining Date" type="date" required />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowAddModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            Add Teacher
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Teacher Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Teacher"
            >
                {selectedTeacher && (
                    <form onSubmit={handleUpdateTeacher} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" defaultValue={selectedTeacher.first_name} required />
                            <Input label="Last Name" defaultValue={selectedTeacher.last_name} required />
                        </div>

                        <Input label="Employee Code" defaultValue={selectedTeacher.employee_code} required />

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Email" type="email" defaultValue={selectedTeacher.email} required />
                            <Input label="Phone" defaultValue={selectedTeacher.phone} required />
                        </div>

                        <Input label="Qualification" defaultValue={selectedTeacher.qualification} required />
                        <Input label="Specialization" defaultValue={selectedTeacher.specialization} required />

                        <Select label="Status" defaultValue={selectedTeacher.status} required>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </Select>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1">
                                Update Teacher
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Teacher Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Teacher Details"
            >
                {selectedTeacher && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div>
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Employee Code</p>
                                    <p className="text-sm  dark:text-white">{selectedTeacher.employee_code}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Name</p>
                                    <p className="text-sm  dark:text-white">{selectedTeacher.first_name} {selectedTeacher.last_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Email</p>
                                    <p className="text-sm  dark:text-white">{selectedTeacher.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Phone</p>
                                    <p className="text-sm  dark:text-white">{selectedTeacher.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Gender</p>
                                    <p className="text-sm  dark:text-white">{selectedTeacher.gender}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Date of Birth</p>
                                    <p className="text-sm  dark:text-white">{new Date(selectedTeacher.date_of_birth).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="pt-4 border-t  dark:border-slate-700">
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Professional Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Qualification</p>
                                    <p className="text-sm dark:text-white">{selectedTeacher.qualification}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Specialization</p>
                                    <p className="text-sm  dark:text-white">{selectedTeacher.specialization}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Experience</p>
                                    <p className="text-sm  dark:text-white">{selectedTeacher.experience_years} years</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Joining Date</p>
                                    <p className="text-sm dark:text-white">{new Date(selectedTeacher.joining_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Assignment Info */}
                        <div className="pt-4 border-t  dark:border-slate-700">
                            <h3 className="text-sm font-semibold dark:text-white mb-3">Current Assignments</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Assigned Batches</p>
                                    <p className="text-sm  dark:text-white">{selectedTeacher.assigned_batches || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Total Students</p>
                                    <p className="text-sm  dark:text-white">{selectedTeacher.total_students || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="pt-4 border-t  dark:border-slate-700">
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Address</h3>
                            <p className="text-sm  dark:text-white">
                                {selectedTeacher.address}<br />
                                {selectedTeacher.city}, {selectedTeacher.state} - {selectedTeacher.pincode}
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowDetailModal(false)}
                            >
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    handleEdit(selectedTeacher);
                                }}
                            >
                                Edit Teacher
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TeachersPage;
