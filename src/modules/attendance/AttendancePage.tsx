import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, Users, Download, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { useMockQuery, dal } from '@/hooks/use-mock-data';
import { useAcademicStore } from '@/hooks/use-stores';
import mockData from '@/data/mock-data.json';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    admission_number: string;
    batch_id?: number;
}

interface AttendanceRecord {
    id?: number;
    institute_id?: number;
    branch_id?: number;
    academic_year_id?: number;
    batch_id?: number;
    student_id: number;
    attendance_date?: string;
    timetable_id?: number | null;
    status: 'present' | 'absent' | 'late';
    marked_by_user_id?: number;
    marked_at?: string;
    is_locked?: boolean;
    // Enriched fields
    student_name?: string;
    admission_no?: string;
}

const AttendancePage: React.FC = () => {
    const { branchId, academicYearId } = useAcademicStore();
    const [selectedBatch, setSelectedBatch] = useState<number | 'all'>('all');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isMarking, setIsMarking] = useState(false);
    const [localAttendance, setLocalAttendance] = useState<Record<number, 'present' | 'absent' | 'late'>>({});

    // Fetch batches
    const { data: batches = [] } = useMockQuery(
        ['batches', branchId?.toString() || ''],
        () => dal.getBatches(branchId!),
        { enabled: !!branchId }
    );

    // Fetch students
    const { data: allStudents = [] } = useMockQuery(
        ['students', branchId?.toString() || ''],
        () => dal.getStudents(branchId!),
        { enabled: !!branchId }
    );

    // Fetch attendance for the selected date
    const { data: existingAttendance = [] } = useMockQuery(
        ['attendance', branchId?.toString() || '', selectedDate],
        () => dal.getAttendance(branchId!, selectedDate),
        { enabled: !!branchId }
    );

    // Get students for selected batch
    const studentsForBatch = useMemo(() => {
        if (selectedBatch === 'all') {
            return allStudents;
        }

        const batchStudents = (mockData as any).batch_students?.filter(
            (bs: any) => bs.batch_id === selectedBatch
        ) || [];

        const studentIds = batchStudents.map((bs: any) => bs.student_id);
        return allStudents.filter((s: any) => studentIds.includes(s.id));
    }, [allStudents, selectedBatch]);

    // Build attendance records
    const attendanceRecords = useMemo(() => {
        return studentsForBatch.map((student: any) => {
            const existing = existingAttendance.find((a: any) =>
                a.student_id === student.id &&
                (selectedBatch === 'all' || a.batch_id === selectedBatch)
            );

            const localStatus = localAttendance[student.id];

            return {
                ...existing,
                student_id: student.id,
                student_name: `${student.first_name} ${student.last_name}`,
                admission_no: student.admission_number,
                status: localStatus || existing?.status || 'present',
                is_locked: existing?.is_locked || false,
                batch_id: selectedBatch === 'all' ? student.batch_id : selectedBatch,
            } as AttendanceRecord;
        });
    }, [studentsForBatch, existingAttendance, selectedBatch, localAttendance]);

    const summary = useMemo(() => ({
        total: attendanceRecords.length,
        present: attendanceRecords.filter(r => r.status === 'present').length,
        absent: attendanceRecords.filter(r => r.status === 'absent').length,
        late: attendanceRecords.filter(r => r.status === 'late').length
    }), [attendanceRecords]);

    const handleStatusChange = (studentId: number, newStatus: 'present' | 'absent' | 'late') => {
        setLocalAttendance(prev => ({
            ...prev,
            [studentId]: newStatus
        }));
    };

    const handleMarkAll = (status: 'present' | 'absent') => {
        const newLocalAttendance: Record<number, 'present' | 'absent' | 'late'> = {};
        attendanceRecords.forEach(record => {
            if (!record.is_locked) {
                newLocalAttendance[record.student_id] = status;
            }
        });
        setLocalAttendance(newLocalAttendance);
    };

    const handleSaveAttendance = () => {
        setIsMarking(true);
        // In production, this would call the backend API
        // POST /api/attendance with the attendance records
        setTimeout(() => {
            setIsMarking(false);
            alert(`Attendance saved successfully for ${attendanceRecords.length} students on ${selectedDate}!`);
            setLocalAttendance({});
        }, 1000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
            case 'absent': return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800';
            case 'late': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present': return <CheckCircle className="h-5 w-5" />;
            case 'absent': return <XCircle className="h-5 w-5" />;
            case 'late': return <Clock className="h-5 w-5" />;
            default: return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'present': return 'Present';
            case 'absent': return 'Absent';
            case 'late': return 'Late';
            default: return status;
        }
    };

    const attendancePercentage = Math.round((summary.present / summary.total) * 100);

    return (
        <div className="min-h-screen rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">Attendance</h1>
                        <p className="text-sm dark:text-slate-400">Mark and track student attendance</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Total Students</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-white">{summary.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Present</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.present}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Absent</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.absent}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Late</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.late}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-end">
                    {/* Batch */}
                    <div>
                        <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Select Batch</label>
                        <div className="relative min-w-70">
                            <select
                                value={selectedBatch.toString()}
                                onChange={(e) => setSelectedBatch(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                className="w-full px-3 py-2 border  dark:border-slate-600 rounded-md  dark:bg-slate-700 dark:text-white appearance-none cursor-pointer"
                            >
                                <option value="all">All Batches</option>
                                {batches.map((batch: any) => (
                                    <option key={batch.id} value={batch.id}>
                                        {batch.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" />
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-semibold mb-2.5  dark:text-slate-300">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5  dark:text-slate-500" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="
                  w-50 pl-10 pr-3 py-2
                  border  dark:border-slate-600 rounded-md
                   dark:bg-slate-700 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                "
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 items-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAll('present')}
                        >
                            Mark All Present
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            icon={<Download className="h-4 w-4" />}
                        >
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            {/* Attendance Percentage Card */}
            <div className="dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold  dark:text-white">Today's Attendance</h3>
                    <span className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-bold",
                        attendancePercentage >= 90 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800" :
                            attendancePercentage >= 75 ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800" :
                                "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                    )}>
                        {attendancePercentage}%
                    </span>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500",
                            attendancePercentage >= 90 ? "bg-emerald-600 dark:bg-emerald-500" :
                                attendancePercentage >= 75 ? "bg-amber-600 dark:bg-amber-500" : "bg-red-600 dark:bg-red-500"
                        )}
                        style={{ width: `${attendancePercentage}%` }}
                    />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                        <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Present</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{summary.present}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Absent</p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{summary.absent}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Late</p>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{summary.late}</p>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className=" dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className=" dark:bg-slate-700 border-b  dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-300">Roll No</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-300">Student Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-300">Admission No</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold  dark:text-slate-300">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold  dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {attendanceRecords.map((record, index) => (
                                <tr key={record.id} className=" dark:hover:bg-slate-700 transition-colors">
                                    <td className="px-4 py-4 text-sm font-semibold  dark:text-slate-400">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                                    {record.student_name ? record.student_name.split(' ').map(n => n[0]).join('') : 'N'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold  dark:text-white">{record.student_name || 'Unknown'}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm  dark:text-slate-400">
                                        {record.admission_no}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border-2",
                                                getStatusColor(record.status)
                                            )}>
                                                {getStatusIcon(record.status)}
                                                <span>{getStatusLabel(record.status)}</span>
                                                {record.status === 'late' && record.marked_at && (
                                                    <span className="text-xs">
                                                        ({new Date(record.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleStatusChange(record.student_id, 'present')}
                                                disabled={record.is_locked}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    record.status === 'present'
                                                        ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800"
                                                        : "bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 border-2 border-transparent",
                                                    record.is_locked && "opacity-50 cursor-not-allowed"
                                                )}
                                                title="Mark Present"
                                            >
                                                <CheckCircle className="h-5 w-5" strokeWidth={2} />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(record.student_id, 'late')}
                                                disabled={record.is_locked}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    record.status === 'late'
                                                        ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-800"
                                                        : "bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 border-2 border-transparent",
                                                    record.is_locked && "opacity-50 cursor-not-allowed"
                                                )}
                                                title="Mark Late"
                                            >
                                                <Clock className="h-5 w-5" strokeWidth={2} />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(record.student_id, 'absent')}
                                                disabled={record.is_locked}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    record.status === 'absent'
                                                        ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-800"
                                                        : "bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 border-2 border-transparent",
                                                    record.is_locked && "opacity-50 cursor-not-allowed"
                                                )}
                                                title="Mark Absent"
                                            >
                                                <XCircle className="h-5 w-5" strokeWidth={2} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-4 border dark:border-slate-700 flex items-center justify-between  dark:bg-slate-700">
                    <p className="text-sm  dark:text-slate-400">
                        Showing attendance for <span className="font-semibold">{summary.total}</span> students
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (confirm('Are you sure you want to discard changes?')) {
                                    window.location.reload();
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSaveAttendance}
                            isLoading={isMarking}
                            icon={<CheckCircle className="h-4 w-4" />}
                        >
                            Save Attendance
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage; 
