import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useMockQuery, dal } from '@/hooks/use-mock-data';
import { useAcademicStore, useAuthStore } from '@/hooks/use-stores';
import { Users, GraduationCap, School, TrendingUp, AlertCircle, Calendar, BookOpen, CreditCard, Clock, Award, Target, BarChart3, Mail, Phone } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import mockData from '@/data/mock-data.json';

const DashboardPage: React.FC = () => {
    const { branchId, academicYearId } = useAcademicStore();
    const { user } = useAuthStore();

    // Fetch data
    const { data: students, isLoading: loadingStudents } = useMockQuery(['students', branchId?.toString() || ''], () => dal.getStudents(branchId!));
    const { data: batches, isLoading: loadingBatches } = useMockQuery(['batches', branchId?.toString() || ''], () => dal.getBatches(branchId!));
    const { data: transactions, isLoading: loadingTransactions } = useMockQuery(['transactions', branchId?.toString() || '', academicYearId?.toString() || ''], () => dal.getTransactions(branchId!, academicYearId!));
    const { data: tests, isLoading: loadingTests } = useMockQuery(['tests', branchId?.toString() || ''], () => dal.getTests(branchId!));
    const { data: teachers, isLoading: loadingTeachers } = useMockQuery(['teachers', branchId?.toString() || ''], () => dal.getTeachers(branchId!));

    // Calculate Metrics
    const activeBatchesCount = batches?.filter((b: any) => b.status === 'active').length || 0;
    const totalRevenue = transactions?.filter((t: any) => t.transaction_type === 'payment').reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
    const staffPresent = teachers?.length || 0; // Simplified for now

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount}`;
    };

    const isLoading = loadingStudents || loadingBatches || loadingTransactions || loadingTests || loadingTeachers;

    // Render role-specific dashboard
    const renderRoleSpecificDashboard = () => {
        switch (user?.role) {
            case 'Owner':
                return <OwnerDashboard isLoading={isLoading} students={students} batches={batches} totalRevenue={totalRevenue} teachers={teachers} tests={tests} activeBatchesCount={activeBatchesCount} formatCurrency={formatCurrency} staffPresent={staffPresent} />;
            case 'Admin':
                return <AdminDashboard isLoading={isLoading} students={students} batches={batches} totalRevenue={totalRevenue} teachers={teachers} tests={tests} activeBatchesCount={activeBatchesCount} formatCurrency={formatCurrency} />;
            case 'Teacher':
                return <TeacherDashboard isLoading={isLoading} batches={batches} tests={tests} />;
            case 'Parent':
                return <ParentDashboard isLoading={isLoading} />;
            case 'Student':
                return <StudentDashboard isLoading={isLoading} />;
            default:
                return <OwnerDashboard isLoading={isLoading} students={students} batches={batches} totalRevenue={totalRevenue} teachers={teachers} tests={tests} activeBatchesCount={activeBatchesCount} formatCurrency={formatCurrency} staffPresent={staffPresent} />;
        }
    };

    return (
        <MainLayout>
            {renderRoleSpecificDashboard()}
        </MainLayout>
    );
};

// Owner Dashboard - Strategic Overview
const OwnerDashboard: React.FC<any> = ({ isLoading, students, batches, totalRevenue, teachers, tests, activeBatchesCount, formatCurrency, staffPresent }) => {
    const { branchId, academicYearId } = useAcademicStore();
    
    // Modal states
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [showManageStaffModal, setShowManageStaffModal] = useState(false);

    // Student form state
    const [studentForm, setStudentForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        batch_id: '',
        date_of_birth: ''
    });

    // Batch form state
    const [batchForm, setBatchForm] = useState({
        name: '',
        batch_code: '',
        academic_year_id: academicYearId,
        description: ''
    });

    // Staff form state
    const [staffForm, setStaffForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        hire_date: ''
    });

    const allBatches = mockData.batches || [];

    // Handler functions
    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('New student:', studentForm);
        setStudentForm({ first_name: '', last_name: '', email: '', phone: '', batch_id: '', date_of_birth: '' });
        setShowAddStudentModal(false);
        alert('Student added successfully!');
    };

    const handleCreateBatch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('New batch:', batchForm);
        setBatchForm({ name: '', batch_code: '', academic_year_id: academicYearId, description: '' });
        setShowCreateBatchModal(false);
        alert('Batch created successfully!');
    };

    const handleAddStaff = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('New staff:', staffForm);
        setStaffForm({ first_name: '', last_name: '', email: '', phone: '', department: '', position: '', hire_date: '' });
        setShowManageStaffModal(false);
        alert('Staff member added successfully!');
    };

    return (
        <div className="space-y-8 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Owner Dashboard</h1>
                <p className="text-muted-foreground mt-1">Strategic insights and operational metrics for your institute.</p>
            </div>
 
            {/* KPI Cards - Professional Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold mb-1  dark:text-slate-400">Total Students</p>
                            <p className="text-2xl font-bold leading-none  dark:text-white">{isLoading ? '...' : students?.length || '0'}</p>
                        </div>
                    </div>
                    <p className="text-xs font-medium  dark:text-emerald-400">+12% from last month</p>
                </div>
                <div className="p-5 rounded-xl  dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:shadow-md dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                            <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                        </div> 
                        <div className="flex-1">
                            <p className="text-xs font-semibold mb-1  dark:text-slate-400">Active Batches</p>
                            <p className="text-2xl font-bold leading-none  dark:text-white">{isLoading ? '...' : activeBatchesCount}</p>
                        </div>
                    </div>
                    <p className="text-xs font-medium  dark:text-slate-500">{batches?.length || 0} total registered</p>
                </div>
                <div className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold mb-1  dark:text-slate-400">Revenue</p>
                            <p className="text-2xl font-bold leading-none  dark:text-white">{isLoading ? '...' : formatCurrency(totalRevenue)}</p>
                        </div>
                    </div> 
                    <p className="text-xs font-medium dark:text-slate-400">Collected this year</p>
                </div> 
                <div className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                            <School className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                        </div>  
                        <div className="flex-1">
                            <p className="text-xs font-semibold mb-1  dark:text-slate-400">Staff</p>
                            <p className="text-2xl font-bold leading-none  dark:text-white">{isLoading ? '...' : `${staffPresent}/${teachers?.length || 0}`}</p>
                        </div>
                    </div>
                    <p className="text-xs font-medium  dark:text-slate-500">Active faculty</p>
                </div>  
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Assessments */}
                <div className="lg:col-span-2 p-6 rounded-3xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm dark:shadow-slate-900/30 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2  dark:text-white">
                            <Calendar className="h-5 w-5 text-primary" />
                            Upcoming Assessments
                        </h3>
                        <button className="text-xs font-bold text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading assessments...</div>
                        ) : tests && tests.length > 0 ? (
                            tests.slice(0, 3).map((test: any) => (
                                <div key={test.id} className="flex items-center gap-4 p-4 rounded-lg  dark:bg-slate-700/50 border  dark:border-slate-600 hover:border-primary dark:hover:border-primary transition-colors dark:hover:shadow-sm dark:hover:shadow-primary/10">
                                    <div className="h-14 w-14 rounded-lg bg-blue-600 flex flex-col items-center justify-center text-white">
                                        <span className="text-lg font-bold">{new Date(test.test_date).getDate()}</span>
                                        <span className="text-[10px] uppercase font-medium">{new Date(test.test_date).toLocaleString('default', { month: 'short' })}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm dark:text-white">{test.name}</p>
                                        <p className="text-xs dark:text-slate-400">Max Marks: {test.max_marks} • <span className="capitalize">{test.status}</span></p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8  dark:text-slate-400">No upcoming assessments</div>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                    <StatsCard title="Avg Attendance" value="92%" description="Last 30 days" icon={Clock} color="emerald" />
                    <StatsCard title="Test Avg" value="78%" description="Overall performance" icon={Award} color="blue" />
                    <StatsCard title="Growth" value="+15%" description="This quarter" icon={TrendingUp} color="amber" />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <QuickActionCard 
                    title="Add Student" 
                    description="Enroll new student" 
                    icon={Users} 
                    color="blue"
                    onClick={() => setShowAddStudentModal(true)}
                />
                <QuickActionCard 
                    title="Create Batch" 
                    description="Setup new batch" 
                    icon={GraduationCap} 
                    color="indigo"
                    onClick={() => setShowCreateBatchModal(true)}
                />
                <QuickActionCard 
                    title="View Reports" 
                    description="Analytics & insights" 
                    icon={BarChart3} 
                    color="emerald"
                    onClick={() => setShowReportsModal(true)}
                />
                <QuickActionCard 
                    title="Manage Staff" 
                    description="Faculty management" 
                    icon={School} 
                    color="amber"
                    onClick={() => setShowManageStaffModal(true)}
                />
            </div>

            {/* Add Student Modal */}
            <Modal
                isOpen={showAddStudentModal}
                onClose={() => setShowAddStudentModal(false)}
                title="Add New Student"
            >
                <form className="space-y-4" onSubmit={handleAddStudent}>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            type="text"
                            value={studentForm.first_name}
                            onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                            placeholder="Enter first name"
                            required
                        />
                        <Input
                            label="Last Name"
                            type="text"
                            value={studentForm.last_name}
                            onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                            placeholder="Enter last name"
                            required
                        />
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        placeholder="student@example.com"
                        required
                    />

                    <Input
                        label="Phone Number"
                        type="tel"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                        placeholder="+91 XXXX XXXXXX"
                        required
                    />

                    <Input
                        label="Date of Birth"
                        type="date"
                        value={studentForm.date_of_birth}
                        onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                        required
                    />

                    <Select
                        label="Assign to Batch"
                        value={studentForm.batch_id}
                        onChange={(e) => setStudentForm({ ...studentForm, batch_id: e.target.value })}
                        required
                    >
                        <option value="">Select a batch</option>
                        {allBatches.map((batch: any) => (
                            <option key={batch.id} value={batch.id}>
                                {batch.name}
                            </option>
                        ))}
                    </Select>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowAddStudentModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            Add Student
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Create Batch Modal */}
            <Modal
                isOpen={showCreateBatchModal}
                onClose={() => setShowCreateBatchModal(false)}
                title="Create New Batch"
            >
                <form className="space-y-4" onSubmit={handleCreateBatch}>
                    <Input
                        label="Batch Name"
                        type="text"
                        value={batchForm.name}
                        onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                        placeholder="e.g., Grade 10-A, Class XII-B"
                        required
                    />

                    <Input
                        label="Batch Code"
                        type="text"
                        value={batchForm.batch_code}
                        onChange={(e) => setBatchForm({ ...batchForm, batch_code: e.target.value })}
                        placeholder="e.g., G10A, XII-B"
                        required
                    />

                    <Input
                        label="Description"
                        type="text"
                        value={batchForm.description}
                        onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })}
                        placeholder="Enter batch description or capacity"
                    />

                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div className="text-xs text-blue-800 dark:text-blue-300">
                                <p className="font-semibold mb-1">Create Structure</p>
                                <p>Batches help organize students by grade and section for better class management.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowCreateBatchModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            Create Batch
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* View Reports Modal */}
            <Modal
                isOpen={showReportsModal}
                onClose={() => setShowReportsModal(false)}
                title="Analytics & Reports"
            >
                <div className="space-y-4">
                    <div className="p-4 rounded-lg  dark:bg-slate-700/50 border dark:border-slate-600">
                        <h3 className="font-semibold text-sm dark:text-white mb-3">Available Reports</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg dark:bg-slate-600/50 hover:dark:bg-slate-600 transition-colors cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <p className="font-medium text-sm dark:text-white">Student Performance</p>
                                        <p className="text-xs  dark:text-slate-400">By subject and batch</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded">Export</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg dark:bg-slate-600/50 hover:dark:bg-slate-600 transition-colors cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="font-medium text-sm dark:text-white">Attendance Summary</p>
                                        <p className="text-xs  dark:text-slate-400">Monthly & yearly trends</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">Export</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg dark:bg-slate-600/50 hover:dark:bg-slate-600 transition-colors cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    <div>
                                        <p className="font-medium text-sm dark:text-white">Revenue Analysis</p>
                                        <p className="text-xs  dark:text-slate-400">Fee collection & payments</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">Export</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg dark:bg-slate-600/50 hover:dark:bg-slate-600 transition-colors cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    <div>
                                        <p className="font-medium text-sm dark:text-white">Staff Engagement</p>
                                        <p className="text-xs  dark:text-slate-400">Teacher activities & metrics</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-blue-100 dark:bg-blue-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded">Export</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowReportsModal(false)}
                        >
                            Close
                        </Button>
                        <Button type="button" variant="primary" className="flex-1">
                            Generate Report
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Manage Staff Modal */}
            <Modal
                isOpen={showManageStaffModal}
                onClose={() => setShowManageStaffModal(false)}
                title="Add Staff Member"
            >
                <form className="space-y-4" onSubmit={handleAddStaff}>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            type="text"
                            value={staffForm.first_name}
                            onChange={(e) => setStaffForm({ ...staffForm, first_name: e.target.value })}
                            placeholder="Enter first name"
                            required
                        />
                        <Input
                            label="Last Name"
                            type="text"
                            value={staffForm.last_name}
                            onChange={(e) => setStaffForm({ ...staffForm, last_name: e.target.value })}
                            placeholder="Enter last name"
                            required
                        />
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                        placeholder="staff@example.com"
                        required
                    />

                    <Input
                        label="Phone Number"
                        type="tel"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                        placeholder="+91 XXXX XXXXXX"
                        required
                    />

                    <Select
                        label="Department"
                        value={staffForm.department}
                        onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                        required
                    >
                        <option value="">Select department</option>
                        <option value="Academic">Academic</option>
                        <option value="Administration">Administration</option>
                        <option value="Support Staff">Support Staff</option>
                        <option value="Management">Management</option>
                    </Select>

                    <Select
                        label="Position"
                        value={staffForm.position}
                        onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                        required
                    >
                        <option value="">Select position</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Principal">Principal</option>
                        <option value="Vice Principal">Vice Principal</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Support Staff">Support Staff</option>
                    </Select>

                    <Input
                        label="Date of Hire"
                        type="date"
                        value={staffForm.hire_date}
                        onChange={(e) => setStaffForm({ ...staffForm, hire_date: e.target.value })}
                        required
                    />

                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div className="text-xs text-blue-800 dark:text-blue-300">
                                <p className="font-semibold mb-1">Onboarding</p>
                                <p>Staff members will receive login credentials and can access the system immediately.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowManageStaffModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            Add Staff
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// Admin Dashboard - Branch Operations
const AdminDashboard: React.FC<any> = ({ isLoading, students, batches, totalRevenue, teachers, tests, activeBatchesCount, formatCurrency }) => {
    const { branchId, academicYearId } = useAcademicStore();
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // State for Student Form
    const [studentForm, setStudentForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        batch_id: '',
        date_of_birth: ''
    });

    // State for Batch Form
    const [batchForm, setBatchForm] = useState({
        name: '',
        batch_code: '',
        academic_year_id: academicYearId,
        description: ''
    });

    // State for Payment Form
    const [paymentForm, setPaymentForm] = useState({
        student_id: '',
        amount: '',
        payment_type: 'fee',
        description: ''
    });

    const allBatches = mockData.batches || [];
    const allStudents = mockData.students || [];

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('New student:', studentForm);
        setStudentForm({ first_name: '', last_name: '', email: '', phone: '', batch_id: '', date_of_birth: '' });
        setShowStudentModal(false);
        alert('Student admitted successfully!');
    };

    const handleCreateBatch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('New batch:', batchForm);
        setBatchForm({ name: '', batch_code: '', academic_year_id: academicYearId, description: '' });
        setShowBatchModal(false);
        alert('Batch created successfully!');
    };

    const handleRecordPayment = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Payment recorded:', paymentForm);
        setPaymentForm({ student_id: '', amount: '', payment_type: 'fee', description: '' });
        setShowPaymentModal(false);
        alert('Payment recorded successfully!');
    };

    return (
        <div className="space-y-8 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage daily operations and branch activities.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={isLoading ? '...' : students?.length.toString() || '0'}
                    icon={Users}
                    trend="+12% from last month"
                    color="primary"
                />
                <StatCard
                    title="Active Batches"
                    value={isLoading ? '...' : activeBatchesCount.toString()}
                    icon={GraduationCap}
                    trend={`${batches?.length || 0} total registered`}
                    color="green"
                />
                <StatCard
                    title="Revenue Tracking"
                    value={isLoading ? '...' : formatCurrency(totalRevenue)}
                    icon={TrendingUp}
                    trend="Total collected this year"
                    color="orange"
                />
                <StatCard
                    title="Staff on Duty"
                    value={isLoading ? '...' : teachers?.length.toString() || '0'}
                    icon={School}
                    trend="Active today"
                    color="indigo"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionCard 
                    title="Admit Student" 
                    description="Add new student to branch" 
                    icon={Users}
                    onClick={() => setShowStudentModal(true)}
                />
                <QuickActionCard 
                    title="Create Batch" 
                    description="Set up new batch schedule" 
                    icon={GraduationCap}
                    onClick={() => setShowBatchModal(true)}
                />
                <QuickActionCard 
                    title="Record Payment" 
                    description="Log fee collection" 
                    icon={CreditCard}
                    onClick={() => setShowPaymentModal(true)}
                />
            </div>

            {/* Add Student Modal */}
            <Modal
                isOpen={showStudentModal}
                onClose={() => setShowStudentModal(false)}
                title="Admit New Student"
            >
                <form className="space-y-4" onSubmit={handleAddStudent}>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            type="text"
                            value={studentForm.first_name}
                            onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                            placeholder="Enter first name"
                            required
                        />
                        <Input
                            label="Last Name"
                            type="text"
                            value={studentForm.last_name}
                            onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                            placeholder="Enter last name"
                            required
                        />
                    </div>

                    <Input
                        label="Email"
                        type="email"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        placeholder="student@example.com"
                        required
                    />

                    <Input
                        label="Phone Number"
                        type="tel"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                        placeholder="+91 XXXX XXXXXX"
                        required
                    />

                    <Input
                        label="Date of Birth"
                        type="date"
                        value={studentForm.date_of_birth}
                        onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                        required
                    />

                    <Select
                        label="Assign Batch"
                        value={studentForm.batch_id}
                        onChange={(e) => setStudentForm({ ...studentForm, batch_id: e.target.value })}
                        required
                    >
                        <option value="">Select Batch</option>
                        {allBatches.map((batch: any) => (
                            <option key={batch.id} value={batch.id}>
                                {batch.name}
                            </option>
                        ))}
                    </Select>

                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div className="text-xs text-blue-800 dark:text-blue-300">
                                <p className="font-semibold mb-1">Important</p>
                                <p>A confirmation email will be sent to the student with login credentials.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowStudentModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            Admit Student
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Create Batch Modal */}
            <Modal
                isOpen={showBatchModal}
                onClose={() => setShowBatchModal(false)}
                title="Create New Batch"
            >
                <form className="space-y-4" onSubmit={handleCreateBatch}>
                    <Input
                        label="Batch Name"
                        type="text"
                        value={batchForm.name}
                        onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                        placeholder="e.g., Class 10 - A"
                        required
                    />

                    <Input
                        label="Batch Code"
                        type="text"
                        value={batchForm.batch_code}
                        onChange={(e) => setBatchForm({ ...batchForm, batch_code: e.target.value })}
                        placeholder="e.g., X-A-2024"
                        required
                    />

                    <Input
                        label="Description"
                        type="text"
                        value={batchForm.description}
                        onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })}
                        placeholder="Batch details (optional)"
                    />

                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                            <div className="text-xs text-emerald-800 dark:text-emerald-300">
                                <p className="font-semibold mb-1">Batch Setup</p>
                                <p>The batch will be created for the current academic year. You can assign subjects and teachers after creation.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowBatchModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            Create Batch
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Record Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Record Payment"
            >
                <form className="space-y-4" onSubmit={handleRecordPayment}>
                    <Select
                        label="Student"
                        value={paymentForm.student_id}
                        onChange={(e) => setPaymentForm({ ...paymentForm, student_id: e.target.value })}
                        required
                    >
                        <option value="">Select Student</option>
                        {allStudents.slice(0, 10).map((student: any) => (
                            <option key={student.id} value={student.id}>
                                {student.first_name} {student.last_name}
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Payment Type"
                        value={paymentForm.payment_type}
                        onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                        required
                    >
                        <option value="fee">Tuition Fee</option>
                        <option value="exam">Exam Fee</option>
                        <option value="transport">Transport Fee</option>
                        <option value="activity">Activity Fee</option>
                        <option value="other">Other</option>
                    </Select>

                    <Input
                        label="Amount"
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                        required
                    />

                    <Input
                        label="Description"
                        type="text"
                        value={paymentForm.description}
                        onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                        placeholder="e.g., Fee for January 2024"
                    />

                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <div className="text-xs text-amber-800 dark:text-amber-300">
                                <p className="font-semibold mb-1">Payment Record</p>
                                <p>This payment will be recorded in the system and a receipt will be generated.</p>
                            </div>
                        </div>
                    </div>

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
            </Modal>
        </div>
    );
};

// Teacher Dashboard - My Classes
const TeacherDashboard: React.FC<any> = ({ isLoading, batches, tests }) => {
    return (
        <div className="space-y-8 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Teacher Dashboard</h1>
                <p className="text-muted-foreground mt-1">Your classes, attendance, and assessments at a glance.</p>
            </div>

            {/* Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-3xl dark:bg-slate-800 border dark:border-slate-700 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                                <Calendar className="h-5 w-5 text-primary" />
                                Today's Schedule
                            </h3>
                            <span className="text-xs font-bold text-muted-foreground dark:text-slate-400">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl  dark:from-indigo-950/30 dark:to-purple-950/30 border  dark:border-indigo-900/50 hover:shadow-sm dark:hover:shadow-indigo-900/30 transition-all">
                                    <div className="h-14 w-14 rounded-xl bg-linear-to-br from-indigo-500 to-purple-500 flex flex-col items-center justify-center text-white shadow-lg">
                                        <span className="text-xs font-bold">{8 + i * 2}:00</span>
                                        <span className="text-[10px]">AM</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm dark:text-white">8th Standard - Mathematics</p>
                                        <p className="text-xs text-muted-foreground">Batch A • Room 101</p>
                                    </div>
                                    <button className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all">
                                        Mark Attendance
                                    </button>
                                </div> 
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-card dark:bg-slate-800 border dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
                            <Target className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                            Pending Tasks
                        </h3>
                        <div className="space-y-2">
                            <TaskItem task="Enter marks for Unit Test 3 - Physics" count="28 students" />
                            <TaskItem task="Review homework submissions - Chemistry" count="15 pending" />
                            <TaskItem task="Prepare question paper for Mid-term" count="Due in 3 days" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <StatsCard title="My Batches" value="5" description="Active classes" icon={GraduationCap} gradient="from-blue-500 to-cyan-500" />
                    <StatsCard title="This Week" value="24" description="Classes completed" icon={Clock} gradient="from-green-500 to-emerald-500" />
                    <StatsCard title="Tests Pending" value="3" description="Marks entry required" icon={Award} gradient="from-orange-500 to-red-500" />
                </div>
            </div>
        </div>
    );
};

// Parent Dashboard - Child Progress
const ParentDashboard: React.FC<any> = ({ isLoading }) => {
    return (
        <div className="space-y-8 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Parent Dashboard</h1>
                <p className="text-muted-foreground mt-1">Monitor your child's academic progress and activities.</p>
            </div>

            {/* Child Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/30">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                            <span className="text-2xl font-bold">RS</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Rahul Sharma</h3>
                            <p className="text-sm opacity-90">8th Standard • Gujarati Medium</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6"> 
                        <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xl">
                            <p className="text-xs opacity-75 mb-1">Attendance</p>
                            <p className="text-2xl font-bold">92%</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xl">
                            <p className="text-xs opacity-75 mb-1">Overall Grade</p>
                            <p className="text-2xl font-bold">A</p>
                        </div>
                    </div>
                </div>

                <StatsCard title="Attendance" value="92%" description="Last 30 days" icon={Calendar} gradient="from-green-500 to-emerald-500" />
                <StatsCard title="Upcoming Tests" value="2" description="This week" icon={BookOpen} gradient="from-orange-500 to-red-500" />
            </div>

            {/* Recent Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-card dark:bg-slate-800 border dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">Recent Test Results</h3>
                    <div className="space-y-3">
                        {['Mathematics', 'Science', 'English'].map((subject, i) => (
                            <div key={subject} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 dark:bg-slate-700/50">
                                <div>
                                    <p className="font-bold text-sm dark:text-white">{subject}</p>
                                    <p className="text-xs text-muted-foreground dark:text-slate-400">Unit Test {i + 1}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{85 + i * 5}</p>
                                    <p className="text-xs text-muted-foreground dark:text-slate-400">out of 100</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-card dark:bg-slate-800 border dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">Fee Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground dark:text-slate-400">Total Fees</span>
                            <span className="font-bold dark:text-white">₹25,000</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground dark:text-slate-400">Paid</span>
                            <span className="font-bold text-green-600 dark:text-green-400">₹15,000</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground dark:text-slate-400">Balance</span>
                            <span className="font-bold text-orange-600 dark:text-orange-400">₹10,000</span>
                        </div>
                        <div className="w-full h-2 bg-secondary dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-linear-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600" style={{ width: '60%' }} />
                        </div>
                        <button className="w-full py-3 bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-lg">
                            Pay Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Student Dashboard - My Progress
const StudentDashboard: React.FC<any> = ({ isLoading }) => {
    return (
        <div className="space-y-8 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">My Dashboard</h1>
                <p className="text-muted-foreground mt-1">Track your academic progress and upcoming activities.</p>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                            <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold mb-1  dark:text-slate-300">Overall Grade</p>
                            <p className="text-2xl font-bold leading-none  dark:text-white">A</p>
                        </div>
                    </div>
                </div>
                <div className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                            <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold mb-1  dark:text-slate-300">Attendance</p>
                            <p className="text-2xl font-bold leading-none  dark:text-white">92%</p>
                        </div>
                    </div>
                </div>
                <div className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                            <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold mb-1  dark:text-slate-300">Class Rank</p>
                            <p className="text-2xl font-bold leading-none  dark:text-white">3rd</p>
                        </div>
                    </div>
                </div>
                <div className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                            <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold mb-1  dark:text-slate-300">Progress</p>
                            <p className="text-2xl font-bold leading-none  dark:text-white">+8%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Schedule & Tests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-card border shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Today's Classes
                    </h3>
                    <div className="space-y-3">
                        {['Mathematics', 'Science', 'English'].map((subject) => (
                            <div key={subject} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                    {subject[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm">{subject}</p>
                                    <p className="text-xs text-muted-foreground">Room 101 • 2:00 PM</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-card border shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-orange-500" />
                        Upcoming Tests
                    </h3>
                    <div className="space-y-3">
                        {['Physics - Unit Test', 'Chemistry - Mid-term', 'Mathematics - Quiz'].map((test, i) => (
                            <div key={test} className="flex items-center justify-between p-3 rounded-xl  dark:bg-blue-950/40 border  dark:border-blue-900/50">
                                <div>
                                    <p className="font-bold text-sm dark:text-white">{test}</p>
                                    <p className="text-xs text-muted-foreground">In {i + 2} days</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded-full text-xs font-bold">
                                    Upcoming
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const QuickActionCard: React.FC<any> = ({ title, description, icon: Icon, color, onClick }) => {
    const colorClasses: any = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', hover: 'group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', hover: 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/60' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', hover: 'group-hover:bg-amber-100 dark:group-hover:bg-amber-950/60' },
        indigo: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-indigo-600 dark:text-indigo-400', hover: 'group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60' }
    };
    
    // Check if color is a gradient (contains 'from' or 'to')
    const isGradient = color && (color.includes('from') || color.includes('to'));
    
    if (isGradient) {
        // Gradient card style
        const gradientMap: any = {
            'from-blue-500 to-cyan-500': 'from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600',
            'from-green-500 to-emerald-500': 'from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600',
            'from-orange-500 to-red-500': 'from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600',
        };
        const gradientClass = gradientMap[color] || color; 
        
        return (
            <button onClick={onClick} className={cn("group p-6 cursor-pointer rounded-xl bg-linear-to-br text-white shadow-lg hover:shadow-xl transition-all text-left", gradientClass)}>
                <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-xl flex items-center justify-center mb-4 transition-colors">
                    <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <h4 className="font-bold text-sm mb-1 text-white">{title}</h4>
                <p className="text-xs text-white/80">{description}</p>
            </button>
        );
    }
    
    // Default white card style with dark mode
    const colors = colorClasses[color] || colorClasses.blue;
    
    return (
        <button onClick={onClick} className="group p-6 cursor-pointer rounded-xl  dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left">
            <div className={`h-12 w-12 rounded-lg ${colors.bg} ${colors.hover} flex items-center justify-center mb-4 transition-colors`}>
                <Icon className={`h-6 w-6 ${colors.text}`} strokeWidth={2} />
            </div>  
            <h4 className="font-bold text-sm mb-1  dark:text-white">{title}</h4>
            <p className="text-xs dark:text-slate-400">{description}</p> 
        </button>
    );
};

const StatsCard: React.FC<any> = ({ title, value, description, icon: Icon, color, gradient }) => {
    const colorClasses: any = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
        indigo: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-indigo-600 dark:text-indigo-400' }
    };
    const colors = colorClasses[color] || colorClasses.blue;

    // Handle gradient prop
    if (gradient) {
        const gradientMap: any = {
            'from-blue-500 to-cyan-500': 'from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600',
            'from-green-500 to-emerald-500': 'from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600',
            'from-orange-500 to-red-500': 'from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600',
        };
        const gradientClass = gradientMap[gradient] || gradient;

        return (
            <div className={cn("p-5 rounded-xl bg-linear-to-br text-white shadow-lg hover:shadow-xl transition-all", gradientClass)}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-xl flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold mb-1 text-white/90">{title}</p>
                        <p className="text-2xl font-bold leading-none text-white">{value}</p>
                    </div>
                </div>
                <p className="text-xs font-medium text-white/80">{description}</p>
            </div>
        );
    }

    return (
        <div className="p-5 rounded-xl dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
                <div className={`h-12 w-12 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} strokeWidth={2} />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold mb-1 dark:text-slate-300">{title}</p>
                    <p className="text-2xl font-bold leading-none dark:text-white">{value}</p>
                </div>
            </div>
            <p className="text-xs font-medium dark:text-slate-400">{description}</p>
        </div>
    );
};

const TaskItem: React.FC<any> = ({ task, count }) => {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 dark:bg-slate-700/50 hover:bg-secondary/50 dark:hover:bg-slate-700 transition-all">
            <p className="text-sm font-medium flex-1 dark:text-white">{task}</p>
            <span className="text-xs font-bold text-muted-foreground dark:text-slate-400 ml-2">{count}</span>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => {
    const colors: any = {
        primary: "bg-primary text-primary-foreground",
        green: "bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20 dark:border-green-500/30",
        orange: "bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/20 dark:border-orange-500/30",
        indigo: "bg-blue-500/10 dark:bg-blue-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/30",
    };

    return (
        <div className="p-6 rounded-3xl bg-card dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", colors[color] || colors.primary)}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground dark:text-slate-400 font-medium">{title}</p>
                <h4 className="text-3xl font-extrabold font-display mt-1 dark:text-white">{value}</h4>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-500 opacity-60 flex items-center">
                <span className="h-1 w-1 rounded-full bg-current mr-2" />
                {trend}
            </p>
        </div>
    );
};

export default DashboardPage;


// import React from 'react';
// import MainLayout from '@/components/layout/MainLayout';
// import { useMockQuery, dal } from '@/hooks/use-mock-data';
// import { useAcademicStore, useAuthStore } from '@/hooks/use-stores';
// import { Users, GraduationCap, School, TrendingUp, AlertCircle, Calendar, BookOpen, CreditCard, Clock, Award, Target, BarChart3 } from 'lucide-react';
// import { cn } from '@/utils/cn';

// const DashboardPage: React.FC = () => {
//     const { branchId, academicYearId } = useAcademicStore();
//     const { user } = useAuthStore();

//     // Fetch data
//     const { data: students, isLoading: loadingStudents } = useMockQuery(['students', branchId?.toString() || ''], () => dal.getStudents(branchId!));
//     const { data: batches, isLoading: loadingBatches } = useMockQuery(['batches', branchId?.toString() || ''], () => dal.getBatches(branchId!));
//     const { data: transactions, isLoading: loadingTransactions } = useMockQuery(['transactions', branchId?.toString() || '', academicYearId?.toString() || ''], () => dal.getTransactions(branchId!, academicYearId!));
//     const { data: tests, isLoading: loadingTests } = useMockQuery(['tests', branchId?.toString() || ''], () => dal.getTests(branchId!));
//     const { data: teachers, isLoading: loadingTeachers } = useMockQuery(['teachers', branchId?.toString() || ''], () => dal.getTeachers(branchId!));

//     // Calculate Metrics
//     const activeBatchesCount = batches?.filter((b: any) => b.status === 'active').length || 0;
//     const totalRevenue = transactions?.filter((t: any) => t.transaction_type === 'payment').reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
//     const staffPresent = teachers?.length || 0; // Simplified for now

//     const formatCurrency = (amount: number) => {
//         if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//         if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
//         return `₹${amount}`;
//     };

//     const isLoading = loadingStudents || loadingBatches || loadingTransactions || loadingTests || loadingTeachers;

//     // Render role-specific dashboard
//     const renderRoleSpecificDashboard = () => {
//         switch (user?.role) {
//             case 'Owner':
//                 return <OwnerDashboard isLoading={isLoading} students={students} batches={batches} totalRevenue={totalRevenue} teachers={teachers} tests={tests} activeBatchesCount={activeBatchesCount} formatCurrency={formatCurrency} staffPresent={staffPresent} />;
//             case 'Admin':
//                 return <AdminDashboard isLoading={isLoading} students={students} batches={batches} totalRevenue={totalRevenue} teachers={teachers} tests={tests} activeBatchesCount={activeBatchesCount} formatCurrency={formatCurrency} />;
//             case 'Teacher':
//                 return <TeacherDashboard isLoading={isLoading} batches={batches} tests={tests} />;
//             case 'Parent':
//                 return <ParentDashboard isLoading={isLoading} />;
//             case 'Student':
//                 return <StudentDashboard isLoading={isLoading} />;
//             default:
//                 return <OwnerDashboard isLoading={isLoading} students={students} batches={batches} totalRevenue={totalRevenue} teachers={teachers} tests={tests} activeBatchesCount={activeBatchesCount} formatCurrency={formatCurrency} staffPresent={staffPresent} />;
//         }
//     };

//     return (
//         <MainLayout>
//             {renderRoleSpecificDashboard()}
//         </MainLayout>
//     );
// };

// // Owner Dashboard - Strategic Overview
// const OwnerDashboard: React.FC<any> = ({ isLoading, students, batches, totalRevenue, teachers, tests, activeBatchesCount, formatCurrency, staffPresent }) => {
//     return (
//         <div className="space-y-8">
//             <div>
//                 <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Owner Dashboard</h1>
//                 <p className="text-muted-foreground mt-1">Strategic insights and operational metrics for your institute.</p>
//             </div>

//             {/* KPI Cards - Professional Design */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
//                             <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
//                         </div>
//                         <div className="flex-1">
//                             <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">Total Students</p>
//                             <p className="text-2xl font-bold leading-none text-slate-900 dark:text-white">{isLoading ? '...' : students?.length || '0'}</p>
//                         </div>
//                     </div>
//                     <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+12% from last month</p>
//                 </div>
//                 <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
//                             <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
//                         </div>
//                         <div className="flex-1">
//                             <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">Active Batches</p>
//                             <p className="text-2xl font-bold leading-none text-slate-900 dark:text-white">{isLoading ? '...' : activeBatchesCount}</p>
//                         </div>
//                     </div>
//                     <p className="text-xs font-medium text-slate-500 dark:text-slate-500">{batches?.length || 0} total registered</p>
//                 </div>
//                 <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
//                             <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
//                         </div>
//                         <div className="flex-1">
//                             <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">Revenue</p>
//                             <p className="text-2xl font-bold leading-none text-slate-900 dark:text-white">{isLoading ? '...' : formatCurrency(totalRevenue)}</p>
//                         </div>
//                     </div>
//                     <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Collected this year</p>
//                 </div>
//                 <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50 transition-all">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
//                             <School className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
//                         </div>
//                         <div className="flex-1">
//                             <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">Staff</p>
//                             <p className="text-2xl font-bold leading-none text-slate-900 dark:text-white">{isLoading ? '...' : `${staffPresent}/${teachers?.length || 0}`}</p>
//                         </div>
//                     </div>
//                     <p className="text-xs font-medium text-slate-500 dark:text-slate-500">Active faculty</p>
//                 </div>
//             </div>

//             {/* Main Content Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Upcoming Assessments */}
//                 <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-900/30 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
//                             <Calendar className="h-5 w-5 text-primary" />
//                             Upcoming Assessments
//                         </h3>
//                         <button className="text-xs font-bold text-primary hover:underline">View All</button>
//                     </div>
//                     <div className="space-y-3">
//                         {isLoading ? (
//                             <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading assessments...</div>
//                         ) : tests && tests.length > 0 ? (
//                             tests.slice(0, 3).map((test: any) => (
//                                 <div key={test.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:border-primary dark:hover:border-primary transition-colors dark:hover:shadow-sm dark:hover:shadow-primary/10">
//                                     <div className="h-14 w-14 rounded-lg bg-blue-600 flex flex-col items-center justify-center text-white">
//                                         <span className="text-lg font-bold">{new Date(test.test_date).getDate()}</span>
//                                         <span className="text-[10px] uppercase font-medium">{new Date(test.test_date).toLocaleString('default', { month: 'short' })}</span>
//                                     </div>
//                                     <div className="flex-1">
//                                         <p className="font-bold text-sm text-slate-900 dark:text-white">{test.name}</p>
//                                         <p className="text-xs text-slate-600 dark:text-slate-400">Max Marks: {test.max_marks} • <span className="capitalize">{test.status}</span></p>
//                                     </div>
//                                 </div>
//                             ))
//                         ) : (
//                             <div className="text-center py-8 text-slate-500 dark:text-slate-400">No upcoming assessments</div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Quick Stats */}
//                 <div className="space-y-4">
//                     <StatsCard title="Avg Attendance" value="92%" description="Last 30 days" icon={Clock} color="emerald" />
//                     <StatsCard title="Test Avg" value="78%" description="Overall performance" icon={Award} color="blue" />
//                     <StatsCard title="Growth" value="+15%" description="This quarter" icon={TrendingUp} color="amber" />
//                 </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <QuickActionCard title="Add Student" description="Enroll new student" icon={Users} color="blue" />
//                 <QuickActionCard title="Create Batch" description="Setup new batch" icon={GraduationCap} color="indigo" />
//                 <QuickActionCard title="View Reports" description="Analytics & insights" icon={BarChart3} color="emerald" />
//                 <QuickActionCard title="Manage Staff" description="Faculty management" icon={School} color="amber" />
//             </div>
//         </div>
//     );
// };

// // Admin Dashboard - Branch Operations
// const AdminDashboard: React.FC<any> = ({ isLoading, students, batches, totalRevenue, teachers, tests, activeBatchesCount, formatCurrency }) => {
//     return (
//         <div className="space-y-8 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
//             <div>
//                 <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Admin Dashboard</h1>
//                 <p className="text-muted-foreground mt-1">Manage daily operations and branch activities.</p>
//             </div>

//             {/* KPI Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <StatCard
//                     title="Total Students"
//                     value={isLoading ? '...' : students?.length.toString() || '0'}
//                     icon={Users}
//                     trend="+12% from last month"
//                     color="primary"
//                 />
//                 <StatCard
//                     title="Active Batches"
//                     value={isLoading ? '...' : activeBatchesCount.toString()}
//                     icon={GraduationCap}
//                     trend={`${batches?.length || 0} total registered`}
//                     color="green"
//                 />
//                 <StatCard
//                     title="Revenue Tracking"
//                     value={isLoading ? '...' : formatCurrency(totalRevenue)}
//                     icon={TrendingUp}
//                     trend="Total collected this year"
//                     color="orange"
//                 />
//                 <StatCard
//                     title="Staff on Duty"
//                     value={isLoading ? '...' : teachers?.length.toString() || '0'}
//                     icon={School}
//                     trend="Active today"
//                     color="indigo"
//                 />
//             </div>

//             {/* Quick Actions */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <QuickActionCard title="Admit Student" description="Add new student to branch" icon={Users}  />
//                 <QuickActionCard title="Create Batch" description="Set up new batch schedule" icon={GraduationCap} />
//                 <QuickActionCard title="Record Payment" description="Log fee collection" icon={CreditCard} />
//             </div>
//         </div>
//     );
// };

// // Teacher Dashboard - My Classes
// const TeacherDashboard: React.FC<any> = ({ isLoading, batches, tests }) => {
//     return (
//         <div className="space-y-8 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
//             <div>
//                 <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Teacher Dashboard</h1>
//                 <p className="text-muted-foreground mt-1">Your classes, attendance, and assessments at a glance.</p>
//             </div>

//             {/* Today's Schedule */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <div className="lg:col-span-2 space-y-6">
//                     <div className="p-6 rounded-3xl dark:bg-slate-800 border dark:border-slate-700 transition-all">
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
//                                 <Calendar className="h-5 w-5 text-primary" />
//                                 Today's Schedule
//                             </h3>
//                             <span className="text-xs font-bold text-muted-foreground dark:text-slate-400">{new Date().toLocaleDateString()}</span>
//                         </div>
//                         <div className="space-y-3">
//                             {[1, 2, 3].map((_, i) => (
//                                 <div key={i} className="flex items-center gap-4 p-4 rounded-xl  dark:from-indigo-950/30 dark:to-purple-950/30 border  dark:border-indigo-900/50 hover:shadow-sm dark:hover:shadow-indigo-900/30 transition-all">
//                                     <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex flex-col items-center justify-center text-white shadow-lg">
//                                         <span className="text-xs font-bold">{8 + i * 2}:00</span>
//                                         <span className="text-[10px]">AM</span>
//                                     </div>
//                                     <div className="flex-1">
//                                         <p className="font-bold text-sm dark:text-white">8th Standard - Mathematics</p>
//                                         <p className="text-xs text-muted-foreground">Batch A • Room 101</p>
//                                     </div>
//                                     <button className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all">
//                                         Mark Attendance
//                                     </button>
//                                 </div> 
//                             ))}
//                         </div>
//                     </div>

//                     <div className="p-6 rounded-3xl bg-card dark:bg-slate-800 border dark:border-slate-700 shadow-sm">
//                         <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
//                             <Target className="h-5 w-5 text-orange-500 dark:text-orange-400" />
//                             Pending Tasks
//                         </h3>
//                         <div className="space-y-2">
//                             <TaskItem task="Enter marks for Unit Test 3 - Physics" count="28 students" />
//                             <TaskItem task="Review homework submissions - Chemistry" count="15 pending" />
//                             <TaskItem task="Prepare question paper for Mid-term" count="Due in 3 days" />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="space-y-6">
//                     <StatsCard title="My Batches" value="5" description="Active classes" icon={GraduationCap} gradient="from-blue-500 to-cyan-500" />
//                     <StatsCard title="This Week" value="24" description="Classes completed" icon={Clock} gradient="from-green-500 to-emerald-500" />
//                     <StatsCard title="Tests Pending" value="3" description="Marks entry required" icon={Award} gradient="from-orange-500 to-red-500" />
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Parent Dashboard - Child Progress
// const ParentDashboard: React.FC<any> = ({ isLoading }) => {
//     return (
//         <div className="space-y-8 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
//             <div>
//                 <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Parent Dashboard</h1>
//                 <p className="text-muted-foreground mt-1">Monitor your child's academic progress and activities.</p>
//             </div>

//             {/* Child Overview */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/30">
//                     <div className="flex items-center gap-4 mb-4">
//                         <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
//                             <span className="text-2xl font-bold">RS</span>
//                         </div>
//                         <div>
//                             <h3 className="text-xl font-bold">Rahul Sharma</h3>
//                             <p className="text-sm opacity-90">8th Standard • Gujarati Medium</p>
//                         </div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4 mt-6">
//                         <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xl">
//                             <p className="text-xs opacity-75 mb-1">Attendance</p>
//                             <p className="text-2xl font-bold">92%</p>
//                         </div>
//                         <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xl">
//                             <p className="text-xs opacity-75 mb-1">Overall Grade</p>
//                             <p className="text-2xl font-bold">A</p>
//                         </div>
//                     </div>
//                 </div>

//                 <StatsCard title="Attendance" value="92%" description="Last 30 days" icon={Calendar} gradient="from-green-500 to-emerald-500" />
//                 <StatsCard title="Upcoming Tests" value="2" description="This week" icon={BookOpen} gradient="from-orange-500 to-red-500" />
//             </div>

//             {/* Recent Performance */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className="p-6 rounded-3xl bg-card dark:bg-slate-800 border dark:border-slate-700 shadow-sm">
//                     <h3 className="text-lg font-bold mb-4 dark:text-white">Recent Test Results</h3>
//                     <div className="space-y-3">
//                         {['Mathematics', 'Science', 'English'].map((subject, i) => (
//                             <div key={subject} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 dark:bg-slate-700/50">
//                                 <div>
//                                     <p className="font-bold text-sm dark:text-white">{subject}</p>
//                                     <p className="text-xs text-muted-foreground dark:text-slate-400">Unit Test {i + 1}</p>
//                                 </div>
//                                 <div className="text-right">
//                                     <p className="text-2xl font-bold text-green-600 dark:text-green-400">{85 + i * 5}</p>
//                                     <p className="text-xs text-muted-foreground dark:text-slate-400">out of 100</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="p-6 rounded-3xl bg-card dark:bg-slate-800 border dark:border-slate-700 shadow-sm">
//                     <h3 className="text-lg font-bold mb-4 dark:text-white">Fee Status</h3>
//                     <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                             <span className="text-muted-foreground dark:text-slate-400">Total Fees</span>
//                             <span className="font-bold dark:text-white">₹25,000</span>
//                         </div>
//                         <div className="flex items-center justify-between">
//                             <span className="text-muted-foreground dark:text-slate-400">Paid</span>
//                             <span className="font-bold text-green-600 dark:text-green-400">₹15,000</span>
//                         </div>
//                         <div className="flex items-center justify-between">
//                             <span className="text-muted-foreground dark:text-slate-400">Balance</span>
//                             <span className="font-bold text-orange-600 dark:text-orange-400">₹10,000</span>
//                         </div>
//                         <div className="w-full h-2 bg-secondary dark:bg-slate-700 rounded-full overflow-hidden">
//                             <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600" style={{ width: '60%' }} />
//                         </div>
//                         <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-lg">
//                             Pay Now
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Student Dashboard - My Progress
// const StudentDashboard: React.FC<any> = ({ isLoading }) => {
//     return (
//         <div className="space-y-8 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
//             <div>
//                 <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">My Dashboard</h1>
//                 <p className="text-muted-foreground mt-1">Track your academic progress and upcoming activities.</p>
//             </div>

//             {/* Performance Overview */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
//                             <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
//                         </div>
//                         <div className="flex-1">
//                             <p className="text-xs font-semibold mb-1  dark:text-slate-300">Overall Grade</p>
//                             <p className="text-2xl font-bold leading-none  dark:text-white">A</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
//                             <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
//                         </div>
//                         <div className="flex-1">
//                             <p className="text-xs font-semibold mb-1  dark:text-slate-300">Attendance</p>
//                             <p className="text-2xl font-bold leading-none  dark:text-white">92%</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
//                             <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
//                         </div>
//                         <div className="flex-1">
//                             <p className="text-xs font-semibold mb-1  dark:text-slate-300">Class Rank</p>
//                             <p className="text-2xl font-bold leading-none  dark:text-white">3rd</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="p-5 rounded-xl  dark:bg-slate-800 border  dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
//                     <div className="flex items-center gap-3 mb-3">
//                         <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
//                             <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
//                         </div>
//                         <div className="flex-1">
//                             <p className="text-xs font-semibold mb-1  dark:text-slate-300">Progress</p>
//                             <p className="text-2xl font-bold leading-none  dark:text-white">+8%</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* My Schedule & Tests */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className="p-6 rounded-3xl bg-card border shadow-sm">
//                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
//                         <Clock className="h-5 w-5 text-primary" />
//                         Today's Classes
//                     </h3>
//                     <div className="space-y-3">
//                         {['Mathematics', 'Science', 'English'].map((subject) => (
//                             <div key={subject} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
//                                 <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
//                                     {subject[0]}
//                                 </div>
//                                 <div className="flex-1">
//                                     <p className="font-bold text-sm">{subject}</p>
//                                     <p className="text-xs text-muted-foreground">Room 101 • 2:00 PM</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="p-6 rounded-3xl bg-card border shadow-sm">
//                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
//                         <BookOpen className="h-5 w-5 text-orange-500" />
//                         Upcoming Tests
//                     </h3>
//                     <div className="space-y-3">
//                         {['Physics - Unit Test', 'Chemistry - Mid-term', 'Mathematics - Quiz'].map((test, i) => (
//                             <div key={test} className="flex items-center justify-between p-3 rounded-xl  dark:bg-blue-950/40 border  dark:border-blue-900/50">
//                                 <div>
//                                     <p className="font-bold text-sm dark:text-white">{test}</p>
//                                     <p className="text-xs text-muted-foreground">In {i + 2} days</p>
//                                 </div>
//                                 <span className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded-full text-xs font-bold">
//                                     Upcoming
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Helper Components
// const QuickActionCard: React.FC<any> = ({ title, description, icon: Icon, color }) => {
//     const colorClasses: any = {
//         blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', hover: 'group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60' },
//         emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', hover: 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/60' },
//         amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', hover: 'group-hover:bg-amber-100 dark:group-hover:bg-amber-950/60' },
//         indigo: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-indigo-600 dark:text-indigo-400', hover: 'group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60' }
//     };
    
//     // Check if color is a gradient (contains 'from' or 'to')
//     const isGradient = color && (color.includes('from') || color.includes('to'));
    
//     if (isGradient) {
//         // Gradient card style
//         const gradientMap: any = {
//             'from-blue-500 to-cyan-500': 'from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600',
//             'from-green-500 to-emerald-500': 'from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600',
//             'from-orange-500 to-red-500': 'from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600',
//         };
//         const gradientClass = gradientMap[color] || color; 
        
//         return (
//             <button className={cn("group p-6 rounded-xl bg-gradient-to-br text-white shadow-lg hover:shadow-xl transition-all text-left", gradientClass)}>
//                 <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-xl flex items-center justify-center mb-4 transition-colors">
//                     <Icon className="h-6 w-6 text-white" strokeWidth={2} />
//                 </div>
//                 <h4 className="font-bold text-sm mb-1 text-white">{title}</h4>
//                 <p className="text-xs text-white/80">{description}</p>
//             </button>
//         );
//     }
    
//     // Default white card style with dark mode
//     const colors = colorClasses[color] || colorClasses.blue;
    
//     return (
//         <button className="group p-6 rounded-xl  dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left">
//             <div className={`h-12 w-12 rounded-lg ${colors.bg} ${colors.hover} flex items-center justify-center mb-4 transition-colors`}>
//                 <Icon className={`h-6 w-6 ${colors.text}`} strokeWidth={2} />
//             </div>  
//             <h4 className="font-bold text-sm mb-1  dark:text-white">{title}</h4>
//             <p className="text-xs dark:text-slate-400">{description}</p>
//         </button>
//     );
// };

// const StatsCard: React.FC<any> = ({ title, value, description, icon: Icon, color, gradient }) => {
//     const colorClasses: any = {
//         blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400' },
//         emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
//         amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
//         indigo: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-indigo-600 dark:text-indigo-400' }
//     };
//     const colors = colorClasses[color] || colorClasses.blue;

//     // Handle gradient prop
//     if (gradient) {
//         const gradientMap: any = {
//             'from-blue-500 to-cyan-500': 'from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600',
//             'from-green-500 to-emerald-500': 'from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600',
//             'from-orange-500 to-red-500': 'from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600',
//         };
//         const gradientClass = gradientMap[gradient] || gradient;

//         return (
//             <div className={cn("p-5 rounded-xl bg-gradient-to-br text-white shadow-lg hover:shadow-xl transition-all", gradientClass)}>
//                 <div className="flex items-center gap-3 mb-3">
//                     <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-xl flex items-center justify-center shrink-0">
//                         <Icon className="h-6 w-6 text-white" strokeWidth={2} />
//                     </div>
//                     <div className="flex-1">
//                         <p className="text-xs font-semibold mb-1 text-white/90">{title}</p>
//                         <p className="text-2xl font-bold leading-none text-white">{value}</p>
//                     </div>
//                 </div>
//                 <p className="text-xs font-medium text-white/80">{description}</p>
//             </div>
//         );
//     }

//     return (
//         <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
//             <div className="flex items-center gap-3 mb-3">
//                 <div className={`h-12 w-12 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
//                     <Icon className={`h-6 w-6 ${colors.text}`} strokeWidth={2} />
//                 </div>
//                 <div className="flex-1">
//                     <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">{title}</p>
//                     <p className="text-2xl font-bold leading-none text-slate-900 dark:text-white">{value}</p>
//                 </div>
//             </div>
//             <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{description}</p>
//         </div>
//     );
// };

// const TaskItem: React.FC<any> = ({ task, count }) => {
//     return (
//         <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 dark:bg-slate-700/50 hover:bg-secondary/50 dark:hover:bg-slate-700 transition-all">
//             <p className="text-sm font-medium flex-1 dark:text-white">{task}</p>
//             <span className="text-xs font-bold text-muted-foreground dark:text-slate-400 ml-2">{count}</span>
//         </div>
//     );
// };

// const StatCard = ({ title, value, icon: Icon, trend, color }: any) => {
//     const colors: any = {
//         primary: "bg-primary text-primary-foreground",
//         green: "bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20 dark:border-green-500/30",
//         orange: "bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/20 dark:border-orange-500/30",
//         indigo: "bg-blue-500/10 dark:bg-blue-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/30",
//     };

//     return (
//         <div className="p-6 rounded-3xl bg-card dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:shadow-md transition-all space-y-4">
//             <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", colors[color] || colors.primary)}>
//                 <Icon className="h-6 w-6" />
//             </div>
//             <div>
//                 <p className="text-sm text-muted-foreground dark:text-slate-400 font-medium">{title}</p>
//                 <h4 className="text-3xl font-extrabold font-display mt-1 dark:text-white">{value}</h4>
//             </div>
//             <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-500 opacity-60 flex items-center">
//                 <span className="h-1 w-1 rounded-full bg-current mr-2" />
//                 {trend}
//             </p>
//         </div>
//     );
// };

// export default DashboardPage;
