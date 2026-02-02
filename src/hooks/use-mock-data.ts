import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import mockData from '@/data/mock-data.json';

// Simulated API delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const useMockQuery = <T>(key: string[], dataFetcher: () => T, options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>) => {
    return useQuery({
        queryKey: key,
        queryFn: async () => {
            await delay(500); // simulate network latency
            return dataFetcher();
        },
        ...options,
    });
};

export const dal = {
    // Institutes & Branches
    getInstitutes: () => mockData.institutes,
    getInstitute: (id: number) => mockData.institutes.find(i => i.id === id),
    getBranches: (institute_id: number) => mockData.branches.filter(b => b.institute_id === institute_id),
    getBranch: (id: number) => mockData.branches.find(b => b.id === id),

    // Students
    getStudents: (branchId: number) => mockData.students.filter(s => s.branch_id === branchId),
    getStudent: (id: number) => mockData.students.find(s => s.id === id),
    getStudentsByBatch: (batchId: number) => {
        const batchStudents = (mockData as any).batch_students.filter((bs: any) => bs.batch_id === batchId);
        return batchStudents.map((bs: any) => mockData.students.find((s: any) => s.id === bs.student_id));
    },

    // Parents
    getParents: (branchId: number) => (mockData as any).parents.filter((p: any) => p.branch_id === branchId),
    getParent: (id: number) => (mockData as any).parents.find((p: any) => p.id === id),
    getParentsByStudent: (studentId: number) => {
        const relations = (mockData as any).student_parent_relations.filter((spr: any) => spr.student_id === studentId);
        return relations.map((rel: any) => ({
            ...(mockData as any).parents.find((p: any) => p.id === rel.parent_id),
            relation: rel.relation,
        }));
    },

    // Teachers
    getTeachers: (branchId: number) => mockData.teachers.filter(t => t.branch_id === branchId),
    getTeacher: (id: number) => mockData.teachers.find(t => t.id === id),

    // Academic Years
    getAcademicYears: (branchId: number) => mockData.academic_years.filter(ay => ay.branch_id === branchId),
    getAcademicYear: (id: number) => mockData.academic_years.find(ay => ay.id === id),
    getAcademicYearsByInstitute: (instituteId: number) => mockData.academic_years.filter(ay => ay.institute_id === instituteId),

    // Batches
    getBatches: (branchId: number) => mockData.batches.filter(b => b.branch_id === branchId),
    getBatch: (id: number) => mockData.batches.find(b => b.id === id),
    getBatchesByStudent: (studentId: number) => {
        const batchStudents = (mockData as any).batch_students.filter((bs: any) => bs.student_id === studentId);
        return batchStudents.map((bs: any) => mockData.batches.find((b: any) => b.id === bs.batch_id));
    },

    // Standards, Mediums, Subjects
    getStandards: (instituteId: number) => mockData.standards.filter(s => s.institute_id === instituteId),
    getStandard: (id: number) => mockData.standards.find(s => s.id === id),
    getMediums: (instituteId: number) => mockData.mediums.filter(m => m.institute_id === instituteId),
    getMedium: (id: number) => mockData.mediums.find(m => m.id === id),
    getSubjects: (instituteId: number, standardId?: number) => {
        let subjects = mockData.subjects.filter(s => s.institute_id === instituteId);
        if (standardId) subjects = subjects.filter(s => s.standard_id === standardId);
        return subjects;
    },
    getSubject: (id: number) => mockData.subjects.find(s => s.id === id),

    // Attendance
    getAttendance: (branchId: number, date?: string) => {
        let attendance = mockData.attendance.filter((a: any) => a.branch_id === branchId);
        if (date) attendance = attendance.filter((a: any) => a.attendance_date === date);
        return attendance;
    },
    getAttendanceByStudent: (studentId: number, startDate?: string, endDate?: string) => {
        let attendance = mockData.attendance.filter((a: any) => a.student_id === studentId);
        if (startDate) attendance = attendance.filter((a: any) => a.attendance_date >= startDate);
        if (endDate) attendance = attendance.filter((a: any) => a.attendance_date <= endDate);
        return attendance;
    },

    // Tests & Assessments
    getTests: (branchId: number, academicYearId?: number) => {
        let tests = mockData.tests.filter((t: any) => t.branch_id === branchId);
        if (academicYearId) tests = tests.filter((t: any) => t.academic_year_id === academicYearId);
        return tests;
    },
    getTest: (id: number) => mockData.tests.find((t: any) => t.id === id),

    // Finance
    getTransactions: (branchId: number, academicYearId?: number) => {
        let transactions = (mockData as any).fee_ledgers.filter((t: any) => t.branch_id === branchId);
        if (academicYearId) transactions = transactions.filter((t: any) => t.academic_year_id === academicYearId);
        return transactions;
    },
    getFeeStructures: (branchId: number) => (mockData as any).fee_structures.filter((fs: any) => fs.branch_id === branchId),
    getPayments: (branchId: number) => (mockData as any).fee_payments.filter((fp: any) => fp.branch_id === branchId),

    // Communication
    getAnnouncements: (branchId: number) => (mockData as any).announcements.filter((a: any) => a.branch_id === branchId),
    getAssignments: (branchId: number) => (mockData as any).assignments.filter((a: any) => a.branch_id === branchId),

    // Timing Settings
    getTimingSettings: (branchId: number) => (mockData as any).timing_settings?.find((ts: any) => ts.branch_id === branchId),
    getTimingSettingsByInstitute: (instituteId: number) => (mockData as any).timing_settings?.filter((ts: any) => ts.institute_id === instituteId) || [],
    getAllTimingSettings: () => (mockData as any).timing_settings || [],

    // Lecture Configurations
    getLectureConfig: (standardId: number, academicYearId: number) =>
        (mockData as any).lecture_configs?.find((lc: any) => lc.standard_id === standardId && lc.academic_year_id === academicYearId),
    getLectureConfigsByBranch: (branchId: number) =>
        (mockData as any).lecture_configs?.filter((lc: any) => lc.branch_id === branchId) || [],
    getLectureConfigsByInstitute: (instituteId: number) =>
        (mockData as any).lecture_configs?.filter((lc: any) => lc.institute_id === instituteId) || [],
    getAllLectureConfigs: () => (mockData as any).lecture_configs || [],

    // Generated Timetables
    getTimetable: (batchId: number, academicYearId: number) =>
        (mockData as any).generated_timetables?.filter((t: any) => t.batch_id === batchId && t.academic_year_id === academicYearId) || [],
    getTimetableByBranch: (branchId: number, academicYearId: number) =>
        (mockData as any).generated_timetables?.filter((t: any) => t.branch_id === branchId && t.academic_year_id === academicYearId) || [],
    getAllTimetables: () => (mockData as any).generated_timetables || [],
};
