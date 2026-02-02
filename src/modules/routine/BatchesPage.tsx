import React, { useState, useMemo } from 'react';
import { Users, Plus, Search, Eye, Edit2, Trash2, BookOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { useAcademicStore } from '@/hooks/use-stores';
import { useMockQuery, dal } from '@/hooks/use-mock-data';
import mockData from '@/data/mock-data.json';

interface Batch {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    standard_id: number;
    medium_id: number;
    name: string;
    capacity: number;
    status: 'active' | 'inactive';
    // Enriched fields
    standard_name?: string;
    medium_name?: string;
    student_count?: number;
    teacher_count?: number;
    teachers?: any[];
}

const BatchesPage: React.FC = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStandard, setFilterStandard] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const { branchId } = useAcademicStore();

    // Fetch real data
    const { data: batches = [], isLoading } = useMockQuery(
        ['batches', branchId?.toString() || ''],
        () => dal.getBatches(branchId!),
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

    const { data: teachers = [] } = useMockQuery(
        ['teachers', branchId?.toString() || ''],
        () => dal.getTeachers(branchId!),
        { enabled: !!branchId }
    );

    // Enrich batches
    const enrichedBatches = useMemo(() => {
        return batches.map((batch: any) => {
            const standard = standards.find((s: any) => s.id === batch.standard_id);
            const medium = mediums.find((m: any) => m.id === batch.medium_id);

            const batchStudents = (mockData as any).batch_students?.filter((bs: any) => bs.batch_id === batch.id) || [];
            const batchTeachers = (mockData as any).batch_teachers?.filter((bt: any) => bt.batch_id === batch.id) || [];

            const teachersInfo = batchTeachers.map((bt: any) => ({
                ...teachers.find((t: any) => t.id === bt.teacher_id),
                subject_id: bt.subject_id,
            }));

            return {
                ...batch,
                standard_name: standard?.name || 'N/A',
                medium_name: medium?.name || 'N/A',
                student_count: batchStudents.length,
                teacher_count: batchTeachers.length,
                teachers: teachersInfo,
            };
        });
    }, [batches, standards, mediums, teachers]);

    // Filter batches
    const filteredBatches = useMemo(() => {
        return enrichedBatches.filter((batch: any) => {
            if (searchQuery && !batch.name.toLowerCase().includes(searchQuery.toLowerCase()))
                return false;
            if (filterStandard !== 'all' && batch.standard_id !== parseInt(filterStandard))
                return false;
            if (filterStatus !== 'all' && batch.status !== filterStatus)
                return false;
            return true;
        });
    }, [enrichedBatches, searchQuery, filterStandard, filterStatus]);

    // Calculate stats
    const stats = useMemo(() => ({
        total: enrichedBatches.length,
        totalStudents: enrichedBatches.reduce((acc: number, b: any) => acc + b.student_count, 0),
        avgSize: enrichedBatches.length > 0
            ? Math.round(enrichedBatches.reduce((acc: number, b: any) => acc + b.student_count, 0) / enrichedBatches.length)
            : 0,
        fullBatches: enrichedBatches.filter((b: any) => b.student_count >= b.capacity).length,
    }), [enrichedBatches]);

    const getCapacityPercentage = (batch: any) => {
        if (!batch.capacity) return 0;
        return (batch.student_count / batch.capacity) * 100;
    };

    const handleViewDetails = (batch: any) => {
        setSelectedBatch(batch);
        setShowDetailModal(true);
    };

    const handleEdit = (batch: any) => {
        setSelectedBatch(batch);
        setShowEditModal(true);
    };

    const handleDelete = (batch: any) => {
        if (confirm(`Are you sure you want to delete ${batch.name}?`)) {
            alert('Delete functionality will be implemented with backend API');
        }
    };

    const handleAddBatch = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Add batch functionality will be implemented with backend API');
        setShowAddModal(false);
    };

    const handleUpdateBatch = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Update batch functionality will be implemented with backend API');
        setShowEditModal(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    <p className="mt-2 text-sm  dark:text-slate-400">Loading batches...</p>
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
                        <h1 className="text-2xl font-bold  dark:text-white">Batches</h1>
                        <p className="text-sm  dark:text-slate-400">Manage student batches and assignments</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Total Batches</p>
                            <p className="text-2xl font-bold  dark:text-white">{stats.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
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
                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Avg. Batch Size</p>
                            <p className="text-2xl font-bold  dark:text-white">{stats.avgSize}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Full Batches</p>
                            <p className="text-2xl font-bold  dark:text-white">{stats.fullBatches}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                            <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-sm p-4">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    {/* Left side - Search and Filters */}
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                        {/* Search */}
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5  dark:text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search batches..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="
                  w-full pl-10 pr-3 py-2
                  border dark:border-slate-600 rounded-md
                  dark:bg-slate-700 dark:text-white dark:placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                "
                            />
                        </div>

                        {/* Standard */}
                        <select
                            value={filterStandard}
                            onChange={(e) => setFilterStandard(e.target.value)}
                            className="px-3 py-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white min-w-45"
                        >
                            <option value="all">All Standards</option>
                            {standards.map((std: any) => (
                                <option key={std.id} value={std.id}>{std.name}</option>
                            ))}
                        </select>

                        {/* Status */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white min-w-35"
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
              bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700
              text-white px-4 py-2 rounded-md
              whitespace-nowrap
            "
                    >
                        <Plus className="h-4 w-4" />
                        Add Batch
                    </button>
                </div>
            </div>

            {/* Batches Table */}
            <div className="dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className=" dark:bg-slate-700 border-b  dark:border-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Batch Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Standard</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Medium</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Students</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Capacity</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Teachers</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredBatches.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm  dark:text-slate-400">
                                        No batches found
                                    </td>
                                </tr>
                            ) : (
                                filteredBatches.map((batch: any) => {
                                    const capacityPct = getCapacityPercentage(batch);
                                    const isFull = capacityPct >= 100;
                                    const isNearFull = capacityPct >= 90;

                                    return (
                                        <tr key={batch.id} className=" dark:hover:bg-slate-700 transition-colors">
                                            <td className="px-4 py-3 text-sm font-semibold  dark:text-white">{batch.name}</td>
                                            <td className="px-4 py-3 text-sm  dark:text-slate-300">{batch.standard_name}</td>
                                            <td className="px-4 py-3 text-sm  dark:text-slate-300">{batch.medium_name}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                    {batch.student_count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden max-w-20">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full",
                                                                isFull ? "bg-red-600" : isNearFull ? "bg-amber-600" : "bg-emerald-600"
                                                            )}
                                                            style={{ width: `${Math.min(capacityPct, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold  dark:text-slate-300">
                                                        {batch.capacity}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                    {batch.teacher_count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-semibold border",
                                                    batch.status === 'active'
                                                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                                        : "bg-slate-100 dark:bg-slate-700  dark:text-slate-300 border-slate-200 dark:border-slate-600"
                                                )}>
                                                    {batch.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleViewDetails(batch)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors group" title="View">
                                                        <Eye className="h-4 w-4  dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                                    </button>
                                                    <button onClick={() => handleEdit(batch)} className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors group" title="Edit">
                                                        <Edit2 className="h-4 w-4  dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                                                    </button>
                                                    <button onClick={() => handleDelete(batch)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors group" title="Delete">
                                                        <Trash2 className="h-4 w-4  dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 border-t  dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm  dark:text-slate-400">
                        Showing <span className="font-semibold">{filteredBatches.length}</span> of <span className="font-semibold">{stats.total}</span> batches
                    </p>
                </div>
            </div>

            {/* Add Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Batch">
                <form onSubmit={handleAddBatch} className="space-y-4">
                    <Input label="Batch Name" placeholder="e.g., 8th Std Morning Batch" required />
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
                    <Input label="Maximum Capacity" type="number" placeholder="30" required />
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" className="flex-1">Create Batch</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Batch">
                {selectedBatch && (
                    <form onSubmit={handleUpdateBatch} className="space-y-4">
                        <Input label="Batch Name" defaultValue={selectedBatch.name} required />
                        <div className="grid grid-cols-2 gap-4">
                            <Select label="Standard" defaultValue={selectedBatch.standard_id} required>
                                {standards.map((std: any) => (
                                    <option key={std.id} value={std.id}>{std.name}</option>
                                ))}
                            </Select>
                            <Select label="Medium" defaultValue={selectedBatch.medium_id} required>
                                {mediums.map((med: any) => (
                                    <option key={med.id} value={med.id}>{med.name}</option>
                                ))}
                            </Select>
                        </div>
                        <Input label="Maximum Capacity" type="number" defaultValue={selectedBatch.capacity} required />
                        <Select label="Status" defaultValue={selectedBatch.status} required>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </Select>
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>Cancel</Button>
                            <Button type="submit" variant="primary" className="flex-1">Update Batch</Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Detail Modal */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Batch Details">
                {selectedBatch && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Batch Name</p>
                                    <p className="text-sm  dark:text-white">{selectedBatch.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Standard</p>
                                    <p className="text-sm  dark:text-white">{selectedBatch.standard_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Medium</p>
                                    <p className="text-sm  dark:text-white">{selectedBatch.medium_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-300 mb-1">Status</p>
                                    <p className="text-sm  dark:text-white">{selectedBatch.status}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t  dark:border-slate-700">
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Capacity</h3>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold  dark:text-slate-300">Students</p>
                                <span className="text-sm font-bold  dark:text-white">
                                    {selectedBatch.student_count}/{selectedBatch.capacity}
                                </span>
                            </div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full" style={{ width: `${getCapacityPercentage(selectedBatch)}%` }} />
                            </div>
                        </div>

                        <div className="pt-4 border-t  dark:border-slate-700">
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Assigned Teachers ({selectedBatch.teacher_count})</h3>
                            <div className="space-y-2">
                                {selectedBatch.teachers && selectedBatch.teachers.length > 0 ? (
                                    selectedBatch.teachers.map((teacher: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-3  dark:bg-slate-700 rounded-lg border  dark:border-slate-600">
                                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                                    {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold  dark:text-white">{teacher.first_name} {teacher.last_name}</p>
                                                <p className="text-xs  dark:text-slate-400">{teacher.specialization}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm dark:text-slate-400">No teachers assigned</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDetailModal(false)}>Close</Button>
                            <Button variant="primary" className="flex-1" onClick={() => { setShowDetailModal(false); handleEdit(selectedBatch); }}>Edit Batch</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BatchesPage;
