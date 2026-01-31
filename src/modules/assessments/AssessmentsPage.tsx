import React, { useState, useMemo } from 'react';
import { FileText, Plus, Eye, Edit2, Award, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useMockQuery, dal } from '@/hooks/use-mock-data';
import { useAcademicStore } from '@/hooks/use-stores';
import mockData from '@/data/mock-data.json';

interface Test {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    subject_id: number;
    name: string;
    test_date: string;
    max_marks: number;
    passing_marks: number;
    weightage: number;
    status: string;
    created_by_user_id: number;
    // Enriched fields
    batch_name?: string;
    subject_name?: string;
    marks_entered?: number;
    total_students?: number;
    average_marks?: number;
    highest_marks?: number;
}

interface StudentMark {
    id: number;
    test_id: number;
    student_id: number;
    marks_obtained: number;
    remarks?: string;
    marked_by_user_id: number;
    marked_at: string;
    // Enriched fields
    student_name?: string;
    admission_no?: string;
}

const AssessmentsPage: React.FC = () => {
    const { branchId, academicYearId } = useAcademicStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMarksModal, setShowMarksModal] = useState(false);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [filterBatch, setFilterBatch] = useState<number | 'all'>('all');
    const [filterSubject, setFilterSubject] = useState<number | 'all'>('all');

    // Fetch tests
    const { data: allTests = [], isLoading } = useMockQuery(
        ['tests', branchId?.toString() || '', academicYearId?.toString() || ''],
        () => dal.getTests(branchId!, academicYearId ?? undefined),
        { enabled: !!branchId }
    );

    // Fetch batches
    const { data: batches = [] } = useMockQuery(
        ['batches', branchId?.toString() || ''],
        () => dal.getBatches(branchId!),
        { enabled: !!branchId }
    );

    // Fetch subjects
    const { data: subjects = [] } = useMockQuery(
        ['subjects', branchId?.toString() || ''],
        () => dal.getSubjects(branchId!),
        { enabled: !!branchId }
    );

    // Fetch students
    const { data: allStudents = [] } = useMockQuery(
        ['students', branchId?.toString() || ''],
        () => dal.getStudents(branchId!),
        { enabled: !!branchId }
    );

    // Enrich tests with calculated data
    const enrichedTests = useMemo(() => {
        return allTests.map((test: any) => {
            const batch = batches.find((b: any) => b.id === test.batch_id);
            const subject = subjects.find((s: any) => s.id === test.subject_id);

            // Get students in this batch
            const batchStudents = (mockData as any).batch_students?.filter(
                (bs: any) => bs.batch_id === test.batch_id
            ) || [];

            // Get marks for this test
            const testMarks = (mockData as any).marks?.filter(
                (m: any) => m.test_id === test.id
            ) || [];

            // Calculate statistics
            const marksValues = testMarks.map((m: any) => m.marks_obtained);
            const avgMarks = marksValues.length > 0
                ? marksValues.reduce((a: number, b: number) => a + b, 0) / marksValues.length
                : 0;
            const highestMark = marksValues.length > 0
                ? Math.max(...marksValues)
                : 0;

            return {
                ...test,
                batch_name: batch?.name || 'N/A',
                subject_name: subject?.name || 'N/A',
                total_students: batchStudents.length,
                marks_entered: testMarks.length,
                average_marks: avgMarks,
                highest_marks: highestMark,
            };
        });
    }, [allTests, batches, subjects]);

    // Filter tests
    const filteredTests = useMemo(() => {
        return enrichedTests.filter((test: Test) => {
            if (filterBatch !== 'all' && test.batch_id !== filterBatch) return false;
            if (filterSubject !== 'all' && test.subject_id !== filterSubject) return false;
            return true;
        });
    }, [enrichedTests, filterBatch, filterSubject]);

    // Calculate stats
    const stats = useMemo(() => {
        const published = filteredTests.filter((t: Test) => t.status === 'published').length;
        const pending = filteredTests.filter((t: Test) => t.status === 'draft').length;

        const allMarksValues: number[] = [];
        filteredTests.forEach((test: Test) => {
            if (test.average_marks && test.average_marks > 0) {
                const percentage = (test.average_marks / test.max_marks) * 100;
                allMarksValues.push(percentage);
            }
        });

        const avgPerformance = allMarksValues.length > 0
            ? Math.round(allMarksValues.reduce((a, b) => a + b, 0) / allMarksValues.length)
            : 0;

        return {
            total: filteredTests.length,
            published,
            pending,
            avgPerformance,
        };
    }, [filteredTests]);

    // Get student marks for selected test
    const studentMarks = useMemo((): StudentMark[] => {
        if (!selectedTest) return [];

        const testMarks = (mockData as any).marks?.filter(
            (m: any) => m.test_id === selectedTest.id
        ) || [];

        // Get all students in the batch
        const batchStudents = (mockData as any).batch_students?.filter(
            (bs: any) => bs.batch_id === selectedTest.batch_id
        ) || [];

        return batchStudents.map((bs: any): StudentMark => {
            const student = allStudents.find((s: any) => s.id === bs.student_id);
            const mark = testMarks.find((m: any) => m.student_id === bs.student_id);

            return {
                id: mark?.id,
                test_id: selectedTest.id,
                student_id: bs.student_id,
                marks_obtained: mark?.marks_obtained || 0,
                remarks: mark?.remarks,
                marked_by_user_id: mark?.marked_by_user_id || 0,
                marked_at: mark?.marked_at || '',
                student_name: student ? `${student.first_name} ${student.last_name}` : 'N/A',
                admission_no: student?.admission_number || 'N/A',
            };
        });
    }, [selectedTest, allStudents]);

    const getSubjectColor = (subject: string) => {
        const colors: { [key: string]: string } = {
            'Mathematics': 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'Science': 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            'English': 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            'Social Science': 'bg-blue-50 dark:bg-blue-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
        };
        return colors[subject] || 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
    };

    const handleViewMarks = (test: Test) => {
        setSelectedTest(test);
        setShowMarksModal(true);
    };

    const getCompletionPercentage = (test: Test) => {
        return Math.round(((test.marks_entered || 0) / (test.total_students || 1)) * 100);
    };

    return (
        <div className="min-h-screen rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold  dark:text-white">Assessments</h1>
                        <p className="text-sm  dark:text-slate-400">Manage tests and student marks</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Total Tests</p>
                            <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Published</p>
                            <p className="text-2xl font-bold dark:text-white">{stats.published}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Pending</p>
                            <p className="text-2xl font-bold dark:text-white">{stats.pending}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Avg. Performance</p>
                            <p className="text-2xl font-bold dark:text-white">{stats.avgPerformance}%</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-end justify-between">
                    {/* Left side - Filters */}
                    <div className="flex flex-wrap gap-3 items-end flex-1">
                        {/* Batch */}
                        <div>
                            <select
                                value={filterBatch.toString()}
                                onChange={(e) => setFilterBatch(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                className="px-3 py-2 border  dark:border-slate-600 rounded-md  dark:bg-slate-700 dark:text-white min-w-70"
                            >
                                <option value="all">All Batches</option>
                                {batches.map((batch: any) => (
                                    <option key={batch.id} value={batch.id}>
                                        {batch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <select
                                value={filterSubject.toString()}
                                onChange={(e) => setFilterSubject(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                className="px-3 py-2 border  dark:border-slate-600 rounded-md  dark:bg-slate-700 dark:text-white min-w-50"
                            >
                                <option value="all">All Subjects</option>
                                {subjects.map((subject: any) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Right side - Create Button */}
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
                        Create Test
                    </button>
                </div>
            </div>

            {/* Tests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTests.map((test: Test) => {
                    const completionPercentage = getCompletionPercentage(test);
                    const averagePercentage = test.average_marks ? Math.round((test.average_marks / test.max_marks) * 100) : 0;

                    return (
                        <div key={test.id} className="dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
                            {/* Card Header */}
                            <div className="p-5 border-b  dark:border-slate-700">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold  dark:text-white mb-2">{test.name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className={cn(
                                                "px-2 py-1 text-xs font-semibold rounded-md border",
                                                getSubjectColor(test.subject_name || 'Unknown')
                                            )}>
                                                {test.subject_name || 'Unknown'}
                                            </span>
                                            <span className={cn(
                                                "px-2 py-1 text-xs font-semibold rounded-md border",
                                                test.status === 'published'
                                                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                            )}>
                                                {test.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm dark:text-slate-400">{test.batch_name}</p>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-4">
                                {/* Test Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3  dark:bg-slate-700 rounded-lg border  dark:border-slate-600">
                                        <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Max Marks</p>
                                        <p className="text-lg font-bold  dark:text-white">{test.max_marks}</p>
                                    </div>
                                    <div className="p-3  dark:bg-slate-700 rounded-lg border  dark:border-slate-600">
                                        <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Test Date</p>
                                        <p className="text-sm font-bold  dark:text-white">
                                            {new Date(test.test_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Marks Entry Progress */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold  dark:text-slate-400">Marks Entry</p>
                                        <span className="text-xs font-bold  dark:text-white">
                                            {test.marks_entered}/{test.total_students}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all",
                                                completionPercentage === 100 ? "bg-emerald-600 dark:bg-emerald-500" : "bg-blue-600 dark:bg-blue-500"
                                            )}
                                            style={{ width: `${completionPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Performance Stats */}
                                {test.status === 'published' && test.average_marks && test.average_marks > 0 && (
                                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Average</p>
                                                <div className="flex items-baseline gap-1">
                                                    <p className="text-lg font-bold  dark:text-white">
                                                        {test.average_marks?.toFixed(1)}
                                                    </p>
                                                    <span className="text-xs  dark:text-slate-400">({averagePercentage}%)</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Highest</p>
                                                <p className="text-lg font-bold  dark:text-emerald-400">{test.highest_marks}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card Footer */}
                            <div className="p-4  dark:bg-slate-700 border-t  dark:border-slate-700 flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleViewMarks(test)}
                                    icon={<Eye className="h-4 w-4" />}
                                >
                                    View Marks
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    icon={<Edit2 className="h-4 w-4" />}
                                >
                                    Enter Marks
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create Test Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Create New Test"
            >
                <form className="space-y-4">
                    <Input label="Test Title" placeholder="e.g., Mid-Term Exam - Algebra" required />

                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Batch" required>
                            <option value="">Select Batch</option>
                            {batches.map((batch: any) => (
                                <option key={batch.id} value={batch.id}>
                                    {batch.name}
                                </option>
                            ))}
                        </Select>

                        <Select label="Subject" required>
                            <option value="">Select Subject</option>
                            {subjects.map((subject: any) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Maximum Marks" type="number" placeholder="100" required />
                        <Input label="Test Date" type="date" required />
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
                            Create Test
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* View Marks Modal */}
            <Modal
                isOpen={showMarksModal}
                onClose={() => setShowMarksModal(false)}
                title={selectedTest ? `${selectedTest.name} - Marks` : 'Test Marks'}
            >
                {selectedTest && (
                    <div className="space-y-4">
                        {/* Test Info */}
                        <div className="p-4  dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Subject</p>
                                    <p className="text-sm font-semibold  dark:text-white">{selectedTest.subject_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold dark:text-slate-400 mb-1">Max Marks</p>
                                    <p className="text-sm font-semibold  dark:text-white">{selectedTest.max_marks}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold dark:text-slate-400 mb-1">Average</p>
                                    <p className="text-sm font-semibold  dark:text-blue-400">{selectedTest.average_marks?.toFixed(1)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Highest</p>
                                    <p className="text-sm font-semibold  dark:text-emerald-400">{selectedTest.highest_marks}</p>
                                </div>
                            </div>
                        </div>

                        {/* Student Marks Table */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className=" dark:bg-slate-700 border-b  dark:border-slate-700">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold  dark:text-slate-300">Student</th>
                                        <th className="px-3 py-2 text-center text-xs font-semibold  dark:text-slate-300">Marks</th>
                                        <th className="px-3 py-2 text-center text-xs font-semibold  dark:text-slate-300">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {studentMarks.map((mark: StudentMark) => {
                                        const isAbsent = !mark.id || mark.marks_obtained === 0;
                                        const percentage = !isAbsent
                                            ? (mark.marks_obtained / selectedTest.max_marks) * 100
                                            : 0;
                                        const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';

                                        return (
                                            <tr key={mark.student_id} className=" dark:hover:bg-slate-700">
                                                <td className="px-3 py-3">
                                                    <div>
                                                        <p className="text-sm font-semibold  dark:text-white">{mark.student_name}</p>
                                                        <p className="text-xs  dark:text-slate-400">{mark.admission_no}</p>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    {isAbsent ? (
                                                        <span className="text-sm font-semibold text-red-600">Absent</span>
                                                    ) : (
                                                        <span className="text-sm font-bold  dark:text-white">
                                                            {mark.marks_obtained}/{selectedTest.max_marks}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    {!isAbsent && (
                                                        <span className={cn(
                                                            "px-2 py-1 rounded-md text-xs font-bold border",
                                                            percentage >= 80 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700" :
                                                                percentage >= 60 ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700" :
                                                                    "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
                                                        )}>
                                                            {grade}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowMarksModal(false)}
                            >
                                Close
                            </Button>
                            <Button variant="primary" className="flex-1">
                                Export Report
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AssessmentsPage;
