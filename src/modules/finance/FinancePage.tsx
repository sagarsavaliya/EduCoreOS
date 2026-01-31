import React, { useState, useMemo } from 'react';
import { DollarSign, Plus, Search, Eye, CreditCard, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { useMockQuery, dal } from '@/hooks/use-mock-data';
import { useAcademicStore } from '@/hooks/use-stores';
import mockData from '@/data/mock-data.json';

interface StudentFee {
    student_id: number;
    student_name: string;
    admission_no: string;
    standard_name: string;
    total_fees: number;
    paid_amount: number;
    discount: number;
    balance: number;
    last_payment_date?: string;
    next_due_date?: string;
    status: 'paid' | 'partial' | 'pending' | 'overdue';
}

const FinancePage: React.FC = () => {
    const { branchId, academicYearId } = useAcademicStore();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentFee | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Fetch students
    const { data: students = [] } = useMockQuery(
        ['students', branchId?.toString() || ''],
        () => dal.getStudents(branchId!),
        { enabled: !!branchId }
    );

    // Fetch standards
    const { data: standards = [] } = useMockQuery(
        ['standards', branchId?.toString() || ''],
        () => dal.getStandards(branchId!),
        { enabled: !!branchId }
    );

    // Fetch fee ledgers (charges)
    const { data: feeLedgers = [] } = useMockQuery(
        ['fee_ledgers', branchId?.toString() || '', academicYearId?.toString() || ''],
        () => dal.getTransactions(branchId!, academicYearId ?? undefined),
        { enabled: !!branchId }
    );

    // Fetch fee payments
    const { data: feePayments = [] } = useMockQuery(
        ['fee_payments', branchId?.toString() || ''],
        () => dal.getPayments(branchId!),
        { enabled: !!branchId }
    );

    // Fetch fee structures
    const { data: feeStructures = [] } = useMockQuery(
        ['fee_structures', branchId?.toString() || ''],
        () => dal.getFeeStructures(branchId!),
        { enabled: !!branchId }
    );

    // Calculate student fees with real data
    const studentFees = useMemo(() => {
        return students.map((student: any) => {
            const standard = standards.find((s: any) => s.id === student.standard_id);

            // Get all charges for this student
            const studentLedgers = feeLedgers.filter((l: any) =>
                l.student_id === student.id && l.transaction_type === 'charge'
            );

            // Get all payments for this student
            const studentPayments = feePayments.filter((p: any) =>
                p.student_id === student.id && p.status === 'success'
            );

            // Calculate totals
            const totalFees = studentLedgers.reduce((sum: number, l: any) => sum + l.amount, 0);
            const paidAmount = studentPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

            // Get discounts (ledger entries with type 'discount')
            const discounts = feeLedgers.filter((l: any) =>
                l.student_id === student.id && l.transaction_type === 'discount'
            );
            const totalDiscount = discounts.reduce((sum: number, d: any) => sum + Math.abs(d.amount), 0);

            const balance = totalFees - totalDiscount - paidAmount;

            // Get last payment date
            const sortedPayments = [...studentPayments].sort((a: any, b: any) =>
                new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
            );
            const lastPaymentDate = sortedPayments.length > 0 ? sortedPayments[0].payment_date : undefined;

            // Get fee structure for due date
            const feeStructure = feeStructures.find((fs: any) => fs.standard_id === student.standard_id);
            const nextDueDate = feeStructure?.due_date;

            // Determine status
            let status: 'paid' | 'partial' | 'pending' | 'overdue' = 'pending';
            if (balance <= 0) {
                status = 'paid';
            } else if (paidAmount > 0) {
                status = 'partial';
            } else if (nextDueDate && new Date(nextDueDate) < new Date()) {
                status = 'overdue';
            }

            return {
                student_id: student.id,
                student_name: `${student.first_name} ${student.last_name}`,
                admission_no: student.admission_number,
                standard_name: standard?.name || 'N/A',
                total_fees: totalFees,
                paid_amount: paidAmount,
                discount: totalDiscount,
                balance: Math.max(0, balance),
                last_payment_date: lastPaymentDate,
                next_due_date: nextDueDate,
                status,
            } as StudentFee;
        });
    }, [students, standards, feeLedgers, feePayments, feeStructures]);

    // Filter and search
    const filteredStudentFees = useMemo(() => {
        return studentFees.filter((student) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    student.student_name.toLowerCase().includes(query) ||
                    student.admission_no.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (filterStatus !== 'all' && student.status !== filterStatus) {
                return false;
            }

            return true;
        });
    }, [studentFees, searchQuery, filterStatus]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalRevenue = studentFees.reduce((acc, s) => acc + s.paid_amount, 0);
        const totalPending = studentFees.reduce((acc, s) => acc + s.balance, 0);
        const totalExpected = studentFees.reduce((acc, s) => acc + s.total_fees, 0);
        const collectionEfficiency = totalExpected > 0 ? Math.round((totalRevenue / totalExpected) * 100) : 0;
        const totalDiscount = studentFees.reduce((acc, s) => acc + s.discount, 0);
        const defaulters = studentFees.filter(s => s.status === 'overdue').length;

        return {
            totalRevenue,
            totalPending,
            totalExpected,
            collectionEfficiency,
            totalDiscount,
            defaulters,
        };
    }, [studentFees]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'partial': return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'pending': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            case 'overdue': return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
        }
    };

    const handleViewDetails = (student: StudentFee) => {
        setSelectedStudent(student);
        setShowDetailModal(true);
    };

    const handleRecordPayment = (student: StudentFee) => {
        setSelectedStudent(student);
        setShowPaymentModal(true);
    };

    return (
        <div className="min-h-screen rounded-lg dark:bg-slate-900  border dark:border-slate-700 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold  dark:text-white">Finance</h1>
                        <p className="text-sm  dark:text-slate-400">Manage fee collection and payments</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Total Revenue</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Pending Fees</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{stats.totalPending.toLocaleString()}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Collection Rate</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.collectionEfficiency}%</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold dark:text-slate-400 mb-1">Defaulters</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.defaulters}</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                            <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Collection Progress */}
            <div className=" dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold  dark:text-white">Overall Collection Progress</h3>
                    <span className="text-sm font-semibold  dark:text-slate-400">
                        ₹{stats.totalRevenue.toLocaleString()} / ₹{stats.totalExpected.toLocaleString()}
                    </span>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${stats.collectionEfficiency}%` }}
                    />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                        <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Collected</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Pending</p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">₹{stats.totalPending.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-semibold  dark:text-slate-400 mb-1">Discounts</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{stats.totalDiscount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className=" dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Search */}
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5  dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by student name or admission number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="
              w-full pl-10 pr-3 py-2
              border  dark:border-slate-600 rounded-md
               dark:bg-slate-700 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
                        />
                    </div>

                    {/* Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border  dark:border-slate-600 rounded-md  dark:bg-slate-700 dark:text-white min-w-40"
                    >
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>
            </div>

            {/* Student Fees Table */}
            <div className="dark:bg-slate-800 border  dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className=" dark:bg-slate-700 border-b  dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-300">Student</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-300">Standard</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold  dark:text-slate-300">Total Fees</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold  dark:text-slate-300">Paid</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold  dark:text-slate-300">Discount</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold  dark:text-slate-300">Balance</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold  dark:text-slate-300">Next Due</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold  dark:text-slate-300">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold  dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredStudentFees.map((student) => (
                                <tr key={student.student_id} className=" dark:hover:bg-slate-700 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                                    {student.student_name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold  dark:text-white">{student.student_name}</p>
                                                <p className="text-xs  dark:text-slate-400">{student.admission_no}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm  dark:text-slate-400">
                                        {student.standard_name}
                                    </td>
                                    <td className="px-4 py-4 text-right text-sm font-semibold  dark:text-white">
                                        ₹{student.total_fees.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                        ₹{student.paid_amount.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 text-right text-sm font-semibold text-blue-600 dark:text-blue-400">
                                        {student.discount > 0 ? `₹${student.discount.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-4 py-4 text-right text-sm font-bold text-red-600 dark:text-red-400">
                                        {student.balance > 0 ? `₹${student.balance.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-4 py-4 text-sm  dark:text-slate-400">
                                        {student.next_due_date ? new Date(student.next_due_date).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : '-'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-center">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-semibold border capitalize",
                                                getStatusColor(student.status)
                                            )}>
                                                {student.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleViewDetails(student)}
                                                className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4 dark:text-slate-300 group-hover:text-blue-600" />
                                            </button>
                                            {student.balance > 0 && (
                                                <button
                                                    onClick={() => handleRecordPayment(student)}
                                                    className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors group"
                                                    title="Record Payment"
                                                >
                                                    <CreditCard className="h-4 w-4 dark:text-slate-300 group-hover:text-emerald-600" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Showing <span className="font-semibold">{filteredStudentFees.length}</span> of <span className="font-semibold">{studentFees.length}</span> students
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </div>
            </div>

            {/* Record Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Record Payment"
            >
                {selectedStudent && (
                    <form className="space-y-4">
                        {/* Student Info */}
                        <div className="p-4  dark:bg-slate-700 rounded-lg border  dark:border-slate-600">
                            <p className="text-sm font-semibold  dark:text-white mb-1">{selectedStudent.student_name}</p>
                            <p className="text-xs  dark:text-slate-400">{selectedStudent.admission_no}</p>
                            <div className="mt-3 pt-3 border-t  dark:border-slate-600">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold  dark:text-slate-400">Outstanding Balance</span>
                                    <span className="text-lg font-bold  dark:text-red-400">
                                        ₹{selectedStudent.balance.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Input
                            label="Payment Amount (₹)"
                            type="number"
                            placeholder="Enter amount"
                            max={selectedStudent.balance}
                            required
                        />

                        <Select label="Payment Method" required>
                            <option value="">Select Method</option>
                            <option value="cash">Cash</option>
                            <option value="upi">UPI</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="card">Card</option>
                        </Select>

                        <Input
                            label="Transaction ID / Reference"
                            placeholder="Optional"
                        />

                        <Input
                            label="Payment Date"
                            type="date"
                            value={new Date().toISOString().split('T')[0]}
                            required
                        />

                        <Input
                            label="Remarks"
                            placeholder="Optional notes..."
                        />

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowPaymentModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" className="flex-1">
                                Record Payment
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Student Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Fee Details"
            >
                {selectedStudent && (
                    <div className="space-y-6">
                        {/* Student Info */}
                        <div>
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Student Information</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm  dark:text-slate-400">Name</span>
                                    <span className="text-sm font-semibold  dark:text-white">{selectedStudent.student_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm  dark:text-slate-400">Admission No</span>
                                    <span className="text-sm font-semibold  dark:text-white">{selectedStudent.admission_no}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm  dark:text-slate-400">Standard</span>
                                    <span className="text-sm font-semibold  dark:text-white">{selectedStudent.standard_name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Fee Breakdown */}
                        <div className="pt-4 border-t  dark:border-slate-700">
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Fee Breakdown</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm  dark:text-slate-400">Total Fees</span>
                                    <span className="text-sm font-bold dark:text-white">
                                        ₹{selectedStudent.total_fees.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm  dark:text-slate-400">Discount Applied</span>
                                    <span className="text-sm font-bold  dark:text-blue-400">
                                        -{selectedStudent.discount > 0 ? `₹${selectedStudent.discount.toLocaleString()}` : '₹0'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm  dark:text-slate-400">Amount Paid</span>
                                    <span className="text-sm font-bold  dark:text-emerald-400">
                                        ₹{selectedStudent.paid_amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="pt-3 border-t  dark:border-slate-700 flex justify-between">
                                    <span className="text-sm font-semibold  dark:text-white">Outstanding Balance</span>
                                    <span className="text-lg font-bold  dark:text-red-400">
                                        ₹{selectedStudent.balance.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="pt-4 border-t  dark:border-slate-700">
                            <h3 className="text-sm font-semibold  dark:text-white mb-3">Payment History</h3>
                            {selectedStudent.last_payment_date ? (
                                <div className="text-sm  dark:text-slate-400">
                                    Last payment on {new Date(selectedStudent.last_payment_date).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm  dark:text-slate-400 italic">No payments recorded yet</p>
                            )}
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
                            {selectedStudent.balance > 0 && (
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        handleRecordPayment(selectedStudent);
                                    }}
                                >
                                    Record Payment
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FinancePage;
