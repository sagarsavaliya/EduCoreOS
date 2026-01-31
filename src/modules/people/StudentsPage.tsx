import React, { useState, useMemo } from 'react';
import { Users, Plus, Search, Eye, Edit2, Trash2, UserPlus } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { useAcademicStore } from '@/hooks/use-stores';
import { useMockQuery, dal } from '@/hooks/use-mock-data';

interface Student {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    standard_id: number;
    medium_id: number;
    admission_number: string;
    roll_number: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string;
    gender: string;
    date_of_birth: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    admission_date: string;
    status: 'active' | 'inactive' | 'alumni';
    photo_url: string;
    // Enriched fields
    standard_name?: string;
    medium_name?: string;
    batch_name?: string | null;
    parent_name?: string | null;
    parent_phone?: string | null;
    attendance_percentage?: number;
    fees_balance?: number;
}

const StudentsPage: React.FC = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStandard, setFilterStandard] = useState('all');
    const [filterMedium, setFilterMedium] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const { branchId, academicYearId } = useAcademicStore();

    // Fetch real data from mockdata.json
    const { data: students = [], isLoading: loadingStudents } = useMockQuery(
        ['students', branchId?.toString() || ''],
        () => dal.getStudents(branchId!),
        { enabled: !!branchId }
    );

    const { data: branch } = useMockQuery(
        ['branch', branchId?.toString() || ''],
        () => dal.getBranch(branchId!),
        { enabled: !!branchId }
    );

    const { data: standards = [] } = useMockQuery(
        ['standards', branch?.institute_id?.toString() || ''],
        () => dal.getStandards(branch?.institute_id!),
        { enabled: !!branch?.institute_id }
    );

    const { data: mediums = [] } = useMockQuery(
        ['mediums', branch?.institute_id?.toString() || ''],
        () => dal.getMediums(branch?.institute_id!),
        { enabled: !!branch?.institute_id }
    );

    const { data: batches = [] } = useMockQuery(
        ['batches', branchId?.toString() || ''],
        () => dal.getBatches(branchId!),
        { enabled: !!branchId }
    );


    const { data: allAttendance = [] } = useMockQuery(
        ['attendance', branchId?.toString() || ''],
        () => dal.getAttendance(branchId!),
        { enabled: !!branchId }
    );

    const { data: allTransactions = [] } = useMockQuery(
        ['transactions', branchId?.toString() || '', academicYearId?.toString() || ''],
        () => dal.getTransactions(branchId!, academicYearId || undefined),
        { enabled: !!branchId }
    );

    // Enrich students with calculated data
    const enrichedStudents = useMemo(() => {
        return students.map((student: any) => {
            // Get standard and medium names
            const standard = standards.find((s: any) => s.id === student.standard_id);
            const medium = mediums.find((m: any) => m.id === student.medium_id);

            // Get batch info
            const batchList = dal.getBatchesByStudent(student.id);
            const batch = batchList && batchList[0];

            // Get parent info
            const parents = dal.getParentsByStudent(student.id);
            const primaryParent = parents && parents[0];

            // Calculate attendance percentage
            const studentAttendance = allAttendance.filter((a: any) => a.student_id === student.id);
            const totalDays = studentAttendance.length;
            const presentDays = studentAttendance.filter((a: any) => a.status === 'P').length;
            const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

            // Calculate fees balance
            const studentTransactions = allTransactions.filter((t: any) => t.student_id === student.id);
            const feesBalance = studentTransactions.reduce((acc: number, t: any) => {
                if (t.transaction_type === 'debit') return acc + t.amount;
                if (t.transaction_type === 'credit') return acc - t.amount;
                return acc;
            }, 0);

            return {
                ...student,
                standard_name: standard?.name || 'N/A',
                medium_name: medium?.name || 'N/A',
                batch_name: batch?.name || null,
                parent_name: primaryParent ? `${primaryParent.first_name} ${primaryParent.last_name}` : null,
                parent_phone: primaryParent?.phone || null,
                attendance_percentage: attendancePercentage,
                fees_balance: feesBalance > 0 ? feesBalance : 0,
            };
        });
    }, [students, standards, mediums, allAttendance, allTransactions]);

    // Filter students based on search and filters
    const filteredStudents = useMemo(() => {
        return enrichedStudents.filter((student: any) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    student.first_name.toLowerCase().includes(query) ||
                    student.last_name.toLowerCase().includes(query) ||
                    student.admission_number.toLowerCase().includes(query) ||
                    (student.parent_name && student.parent_name.toLowerCase().includes(query)) ||
                    (student.phone && student.phone.includes(query));
                if (!matchesSearch) return false;
            }

            // Standard filter
            if (filterStandard !== 'all' && student.standard_id !== parseInt(filterStandard)) {
                return false;
            }

            // Medium filter
            if (filterMedium !== 'all' && student.medium_id !== parseInt(filterMedium)) {
                return false;
            }

            // Status filter
            if (filterStatus !== 'all' && student.status !== filterStatus) {
                return false;
            }

            return true;
        });
    }, [enrichedStudents, searchQuery, filterStandard, filterMedium, filterStatus]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = enrichedStudents.length;
        const active = enrichedStudents.filter((s: any) => s.status === 'active').length;
        const avgAttendance = total > 0
            ? Math.round(enrichedStudents.reduce((acc: number, s: any) => acc + s.attendance_percentage, 0) / total)
            : 0;
        const pendingFees = enrichedStudents.reduce((acc: number, s: any) => acc + s.fees_balance, 0);

        return { total, active, avgAttendance, pendingFees };
    }, [enrichedStudents]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'inactive': return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
            case 'alumni': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
        }
    };

    const handleViewDetails = (student: any) => {
        setSelectedStudent(student);
        setShowDetailModal(true);
    };

    const handleEdit = (student: any) => {
        setSelectedStudent(student);
        setShowEditModal(true);
    };

    const handleDelete = (student: any) => {
        if (confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`)) {
            // In a real app, this would call an API to delete
            alert('Delete functionality will be implemented with backend API');
        }
    };

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call an API to add student
        alert('Add student functionality will be implemented with backend API');
        setShowAddModal(false);
    };

    const handleUpdateStudent = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call an API to update student
        alert('Update student functionality will be implemented with backend API');
        setShowEditModal(false);
    };

    if (loadingStudents) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-slate-600">Loading students...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold  dark:text-white">Students</h1>
                        <p className="text-sm  dark:text-slate-400">Manage student records and information</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg  dark:bg-slate-800 border dark:border-slate-700 dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold dark:text-slate-400 mb-1">Total Students</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-white">{stats.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border dark:border-slate-700 dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Active</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-white">{stats.active}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border dark:border-slate-700 dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Avg. Attendance</p>
                            <p className="text-2xl font-bold text-indigo-600 dark:text-white">{stats.avgAttendance}%</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border dark:border-slate-700 dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Pending Fees</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-white">₹{stats.pendingFees.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-sm dark:shadow-slate-900/30 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all p-4">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    {/* Left side - Search and Filters */}
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                        {/* Search */}
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by name, admission no, or parent..."
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

                        {/* Standard */}
                        <select
                            value={filterStandard}
                            onChange={(e) => setFilterStandard(e.target.value)}
                            className="px-3 py-2 border  dark:border-slate-600 rounded-md  dark:bg-slate-700 dark:text-white min-w-45"
                        >
                            <option value="all">All Standards</option>
                            {standards.map((std: any) => (
                                <option key={std.id} value={std.id}>{std.name}</option>
                            ))}
                        </select>

                        {/* Medium */}
                        <select
                            value={filterMedium}
                            onChange={(e) => setFilterMedium(e.target.value)}
                            className="px-3 py-2 border  dark:border-slate-600 rounded-md  dark:bg-slate-700 dark:text-white min-w-40"
                        >
                            <option value="all">All Mediums</option>
                            {mediums.map((med: any) => (
                                <option key={med.id} value={med.id}>{med.name}</option>
                            ))}
                        </select>

                        {/* Status */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border dark:border-slate-600 rounded-md  dark:bg-slate-700 dark:text-white min-w-35"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="alumni">Alumni</option>
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
                        Add Student
                    </button>
                </div>
            </div>

            {/* Students Table */}
            <div className="dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className=" dark:bg-slate-700 border-b  dark:border-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Admission No</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Student Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Standard</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Medium</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Batch</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Parent</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Attendance</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Fees Balance</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-sm  dark:text-slate-400">
                                        No students found
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student: any) => (
                                    <tr key={student.id} className=" dark:hover:bg-slate-700 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium  dark:text-white">
                                            {student.admission_number}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-semibold  dark:text-white">
                                                    {student.first_name} {student.last_name}
                                                </p>
                                                <p className="text-xs  dark:text-slate-400">{student.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm  dark:text-slate-300">
                                            {student.standard_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm  dark:text-slate-300">
                                            {student.medium_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm  dark:text-slate-300">
                                            {student.batch_name || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium  dark:text-white">{student.parent_name || '-'}</p>
                                                <p className="text-xs  dark:text-slate-400">{student.parent_phone || '-'}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all",
                                                            student.attendance_percentage >= 90 ? "bg-emerald-600" :
                                                                student.attendance_percentage >= 75 ? "bg-amber-600" : "bg-red-600"
                                                        )}
                                                        style={{ width: `${student.attendance_percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold  dark:text-slate-300 min-w-10">
                                                    {student.attendance_percentage}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "text-sm font-semibold",
                                                student.fees_balance > 0 ? "text-red-600" : "text-emerald-600"
                                            )}>
                                                {student.fees_balance > 0 ? `₹${student.fees_balance.toLocaleString()}` : 'Paid'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-semibold border",
                                                getStatusColor(student.status)
                                            )}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(student)}
                                                    className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors group"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors group"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student)}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors group"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
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
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm dark:text-slate-400">
                        Showing <span className="font-semibold">{filteredStudents.length}</span> of <span className="font-semibold">{stats.total}</span> students
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </div>
            </div>

            {/* Add Student Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Student"
            >
                <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" placeholder="Enter first name" required />
                        <Input label="Last Name" placeholder="Enter last name" required />
                    </div>

                    <Input label="Admission Number" placeholder="e.g., EXCT2025001" required />

                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Standard" required>
                            <option value="">Select Standard</option>
                            {standards.map((std: any) => (
                                <option key={std.id} value={std.id}>{std.name}</option>
                            ))}
                        </Select>

                        <Select label="Medium" required>
                            <option value="">Select Medium</option>
                            {mediums.map((med: any) => (
                                <option key={med.id} value={med.id}>{med.name}</option>
                            ))}
                        </Select>
                    </div>

                    <Select label="Batch">
                        <option value="">Select Batch (Optional)</option>
                        {batches.map((batch: any) => (
                            <option key={batch.id} value={batch.id}>{batch.name}</option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Phone Number" placeholder="+91 98765 12345" required />
                        <Input label="Date of Birth" type="date" required />
                    </div>

                    <div className="pt-4 border-t  dark:border-slate-700">
                        <h3 className="text-sm font-semibold  dark:text-white mb-3">Parent Information</h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="First Name" placeholder="Parent first name" required />
                                <Input label="Last Name" placeholder="Parent last name" required />
                            </div>
                            <Input label="Phone Number" placeholder="+91 98250 12345" required />
                            <Input label="Email Address" type="email" placeholder="parent@example.com" />

                            <Select label="Relationship">
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Guardian">Guardian</option>
                            </Select>
                        </div>
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
                            Add Student
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Student Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Student"
            >
                {selectedStudent && (
                    <form onSubmit={handleUpdateStudent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" defaultValue={selectedStudent.first_name} required />
                            <Input label="Last Name" defaultValue={selectedStudent.last_name} required />
                        </div>

                        <Input label="Admission Number" defaultValue={selectedStudent.admission_number} required />

                        <div className="grid grid-cols-2 gap-4">
                            <Select label="Standard" defaultValue={selectedStudent.standard_id} required>
                                <option value="">Select Standard</option>
                                {standards.map((std: any) => (
                                    <option key={std.id} value={std.id}>{std.name}</option>
                                ))}
                            </Select>

                            <Select label="Medium" defaultValue={selectedStudent.medium_id} required>
                                <option value="">Select Medium</option>
                                {mediums.map((med: any) => (
                                    <option key={med.id} value={med.id}>{med.name}</option>
                                ))}
                            </Select>
                        </div>

                        <Select label="Status" defaultValue={selectedStudent.status} required>
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
                                Update Student
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Student Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Student Details"
            >
                {selectedStudent && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div>
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Admission Number</p>
                                    <p className="text-sm  dark:text-white">{selectedStudent.admission_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Roll Number</p>
                                    <p className="text-sm  dark:text-white">{selectedStudent.roll_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Name</p>
                                    <p className="text-sm  dark:text-white">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Gender</p>
                                    <p className="text-sm  dark:text-white">{selectedStudent.gender}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Date of Birth</p>
                                    <p className="text-sm  dark:text-white">{new Date(selectedStudent.date_of_birth).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Phone</p>
                                    <p className="text-sm  dark:text-white">{selectedStudent.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Academic Info */}
                        <div className="pt-4 border-t  dark:border-slate-700">
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Academic Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Standard</p>
                                    <p className="text-sm  dark:text-white">{selectedStudent.standard_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Medium</p>
                                    <p className="text-sm  dark:text-white">{selectedStudent.medium_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Batch</p>
                                    <p className="text-sm  dark:text-white">{selectedStudent.batch_name || 'Not Assigned'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Admission Date</p>
                                    <p className="text-sm  dark:text-white">{new Date(selectedStudent.admission_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Attendance</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2  dark:bg-slate-600 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-600 rounded-full"
                                            style={{ width: `${selectedStudent.attendance_percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold  dark:text-white">
                                        {selectedStudent.attendance_percentage}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Parent Info */}
                        <div className="pt-4 border-t  dark:border-slate-700">
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Parent Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Name</p>
                                    <p className="text-sm  dark:text-white">{selectedStudent.parent_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Phone</p>
                                    <p className="text-sm  dark:text-white">{selectedStudent.parent_phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Financial Info */}
                        <div className="pt-4 border-t  dark:border-slate-700">
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Financial Details</h3>
                            <div>
                                <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Outstanding Balance</p>
                                <p className={cn(
                                    "text-lg font-bold",
                                    (selectedStudent.fees_balance || 0) > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                                )}>
                                    {(selectedStudent.fees_balance || 0) > 0 ? `₹${(selectedStudent.fees_balance || 0).toLocaleString()}` : 'Fully Paid'}
                                </p>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Address</h3>
                            <p className="text-sm  dark:text-white">
                                {selectedStudent.address}<br />
                                {selectedStudent.city}, {selectedStudent.state} - {selectedStudent.pincode}
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
                                    handleEdit(selectedStudent);
                                }}
                            >
                                Edit Student
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentsPage;
