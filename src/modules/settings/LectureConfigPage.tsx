import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useMockQuery, dal } from '@/hooks/use-mock-data';
import { useAuthStore } from '@/hooks/use-stores';
import { BookOpen, Save, Plus, Trash2, Info, GraduationCap, Clock, Beaker, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
    StandardLectureConfig,
    SubjectAllocation,
    TimeSlotPreference,
    DEFAULT_SUBJECT_ALLOCATION,
} from '@/types/timing';

interface Standard {
    id: number;
    institute_id: number;
    name: string;
    sort_order: number;
    status: string;
}

interface Subject {
    id: number;
    institute_id: number;
    standard_id: number;
    name: string;
    code: string;
    status: string;
}

interface AcademicYear {
    id: number;
    institute_id: number;
    branch_id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_locked: boolean;
    status: string;
}

const TIME_SLOT_OPTIONS: { value: TimeSlotPreference; label: string }[] = [
    { value: 'morning', label: 'Morning (1st-3rd periods)' },
    { value: 'mid-day', label: 'Mid-Day (4th-5th periods)' },
    { value: 'afternoon', label: 'Afternoon (6th+ periods)' },
];

const LectureConfigPage: React.FC = () => {
    const { user } = useAuthStore();
    const instituteId = user?.institute_id || 1;
    const branchId = 1; // TODO: Get from context

    // Fetch data
    const { data: standards = [], isLoading: loadingStandards } = useMockQuery<Standard[]>(
        ['standards', instituteId.toString()],
        () => dal.getStandards(instituteId) as Standard[]
    );

    const { data: academicYears = [], isLoading: loadingAcademicYears } = useMockQuery<AcademicYear[]>(
        ['academic-years', instituteId.toString()],
        () => dal.getAcademicYearsByInstitute(instituteId) as AcademicYear[]
    );

    const { data: allSubjects = [], isLoading: loadingSubjects } = useMockQuery<Subject[]>(
        ['subjects', instituteId.toString()],
        () => dal.getSubjects(instituteId) as Subject[]
    );

    const { data: existingConfigs = [], isLoading: loadingConfigs } = useMockQuery<StandardLectureConfig[]>(
        ['lecture-configs', instituteId.toString()],
        () => dal.getLectureConfigsByInstitute(instituteId) as StandardLectureConfig[]
    );

    // Selection state
    const [selectedStandardId, setSelectedStandardId] = useState<number | null>(null);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | null>(null);

    // Form state
    const [periodsPerDay, setPeriodsPerDay] = useState(8);
    const [subjectAllocations, setSubjectAllocations] = useState<SubjectAllocation[]>([]);
    const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Get current academic year on load (use latest non-locked year or first available)
    React.useEffect(() => {
        if (academicYears.length > 0 && !selectedAcademicYearId) {
            const activeYear = academicYears.find((ay: AcademicYear) => !ay.is_locked && ay.status === 'active');
            setSelectedAcademicYearId(activeYear?.id || academicYears[0].id);
        }
    }, [academicYears, selectedAcademicYearId]);

    // Get subjects for selected standard
    const standardSubjects = useMemo(() => {
        if (!selectedStandardId) return [];
        return allSubjects.filter((s: Subject) => s.standard_id === selectedStandardId && s.status === 'active');
    }, [allSubjects, selectedStandardId]);

    // Load existing config when standard/academic year changes
    React.useEffect(() => {
        if (selectedStandardId && selectedAcademicYearId) {
            const existingConfig = existingConfigs.find(
                (c: StandardLectureConfig) => c.standard_id === selectedStandardId && c.academic_year_id === selectedAcademicYearId
            );

            if (existingConfig) {
                setPeriodsPerDay(existingConfig.periods_per_day);
                setSubjectAllocations(existingConfig.subject_allocations);
            } else {
                // Initialize with defaults for all subjects
                setPeriodsPerDay(8);
                setSubjectAllocations(
                    standardSubjects.map((s: Subject) => ({
                        subject_id: s.id,
                        subject_name: s.name,
                        ...DEFAULT_SUBJECT_ALLOCATION,
                    }))
                );
            }
        }
    }, [selectedStandardId, selectedAcademicYearId, existingConfigs, standardSubjects]);

    // Calculate total lectures per week
    const totalLecturesPerWeek = useMemo(() => {
        return subjectAllocations.reduce((sum, a) => sum + a.lectures_per_week, 0);
    }, [subjectAllocations]);

    // Get timing settings to calculate max periods per week
    const { data: timingSettings } = useMockQuery(
        ['timing-settings', branchId.toString()],
        () => dal.getTimingSettings(branchId)
    );

    const workingDaysCount = timingSettings?.working_days?.length || 6;
    const maxPeriodsPerWeek = periodsPerDay * workingDaysCount;

    const toggleSubjectExpanded = (subjectId: number) => {
        setExpandedSubjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(subjectId)) {
                newSet.delete(subjectId);
            } else {
                newSet.add(subjectId);
            }
            return newSet;
        });
    };

    const updateAllocation = (subjectId: number, field: keyof SubjectAllocation, value: any) => {
        setSubjectAllocations(prev =>
            prev.map(a =>
                a.subject_id === subjectId ? { ...a, [field]: value } : a
            )
        );
    };

    const togglePreferredSlot = (subjectId: number, slot: TimeSlotPreference) => {
        setSubjectAllocations(prev =>
            prev.map(a => {
                if (a.subject_id !== subjectId) return a;
                const currentSlots = a.preferred_slots || [];
                const hasSlot = currentSlots.includes(slot);
                return {
                    ...a,
                    preferred_slots: hasSlot
                        ? currentSlots.filter(s => s !== slot)
                        : [...currentSlots, slot]
                };
            })
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Saving lecture config:', {
            institute_id: instituteId,
            branch_id: branchId,
            academic_year_id: selectedAcademicYearId,
            standard_id: selectedStandardId,
            periods_per_day: periodsPerDay,
            subject_allocations: subjectAllocations,
        });

        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const isLoading = loadingStandards || loadingAcademicYears || loadingSubjects || loadingConfigs;

    const getSubjectName = (subjectId: number) => {
        const subject = allSubjects.find((s: Subject) => s.id === subjectId);
        return subject?.name || `Subject ${subjectId}`;
    };

    return (
        <MainLayout>
            <div className="space-y-8 rounded-lg dark:bg-slate-900 border dark:border-slate-700 p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white">Lecture Configuration</h1>
                            <p className="text-sm dark:text-slate-400">
                                Configure lectures per subject for each standard
                            </p>
                        </div>
                    </div>
                </div>

                {/* Selection Row */}
                <div className="bg-card border rounded-lg p-6 shadow-sm dark:bg-slate-800 dark:border-slate-700 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Academic Year Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground dark:text-white mb-2">
                                Academic Year
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedAcademicYearId || ''}
                                    onChange={(e) => setSelectedAcademicYearId(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                                    disabled={isLoading}
                                >
                                    <option value="">Select Academic Year</option>
                                    {academicYears.map((ay: AcademicYear) => (
                                        <option key={ay.id} value={ay.id}>
                                            {ay.name} {!ay.is_locked && ay.status === 'active' && '(Active)'}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" />
                            </div>
                        </div>

                        {/* Standard Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground dark:text-white mb-2">
                                Standard / Class
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedStandardId || ''}
                                    onChange={(e) => setSelectedStandardId(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                                    disabled={isLoading}
                                >
                                    <option value="">Select Standard</option>
                                    {standards.map((s: Standard) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" />
                            </div>
                        </div>

                        {/* Periods Per Day */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground dark:text-white mb-2">
                                Periods Per Day
                            </label>
                            <div className="relative">
                                <select
                                    value={periodsPerDay}
                                    onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                                    disabled={!selectedStandardId}
                                >
                                    {[6, 7, 8, 9, 10].map(num => (
                                        <option key={num} value={num}>{num} periods</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                {selectedStandardId && selectedAcademicYearId && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>Allocation Summary:</strong> {totalLecturesPerWeek} / {maxPeriodsPerWeek} periods per week allocated
                            ({workingDaysCount} working days × {periodsPerDay} periods).
                            {totalLecturesPerWeek > maxPeriodsPerWeek && (
                                <span className="text-red-600 dark:text-red-400 font-semibold ml-2">
                                    ⚠️ Over-allocated by {totalLecturesPerWeek - maxPeriodsPerWeek} periods!
                                </span>
                            )}
                            {totalLecturesPerWeek < maxPeriodsPerWeek && (
                                <span className="text-amber-600 dark:text-amber-400 ml-2">
                                    {maxPeriodsPerWeek - totalLecturesPerWeek} free periods remaining.
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Subject Allocations */}
                {selectedStandardId && selectedAcademicYearId ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground dark:text-white flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                Subject Lecture Allocations
                            </h2>
                            <span className="text-sm text-muted-foreground dark:text-slate-400">
                                {subjectAllocations.length} subjects
                            </span>
                        </div>

                        {subjectAllocations.length === 0 ? (
                            <div className="bg-card border rounded-lg p-8 shadow-sm dark:bg-slate-800 dark:border-slate-700 text-center">
                                <p className="text-muted-foreground dark:text-slate-400">
                                    No subjects found for this standard. Please add subjects in the Academic module first.
                                </p>
                            </div>
                        ) : (
                            subjectAllocations.map((allocation) => {
                                const isExpanded = expandedSubjects.has(allocation.subject_id);
                                const subjectName = allocation.subject_name || getSubjectName(allocation.subject_id);

                                return (
                                    <div
                                        key={allocation.subject_id}
                                        className="bg-card border rounded-lg shadow-sm dark:bg-slate-800 dark:border-slate-700 overflow-hidden"
                                    >
                                        {/* Subject Header */}
                                        <div
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50 dark:hover:bg-slate-700/50 transition-colors"
                                            onClick={() => toggleSubjectExpanded(allocation.subject_id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                                                    <BookOpen className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground dark:text-white">
                                                        {subjectName}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                                                        {allocation.lectures_per_week} lectures/week
                                                        {allocation.requires_lab && ` • Lab: ${allocation.lab_duration_periods} periods`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {/* Quick Lectures Input */}
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => updateAllocation(
                                                            allocation.subject_id,
                                                            'lectures_per_week',
                                                            Math.max(1, allocation.lectures_per_week - 1)
                                                        )}
                                                        className="h-8 w-8 rounded-lg bg-secondary dark:bg-slate-700 hover:bg-secondary/80 dark:hover:bg-slate-600 flex items-center justify-center text-foreground dark:text-white"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-semibold text-foreground dark:text-white">
                                                        {allocation.lectures_per_week}
                                                    </span>
                                                    <button
                                                        onClick={() => updateAllocation(
                                                            allocation.subject_id,
                                                            'lectures_per_week',
                                                            Math.min(15, allocation.lectures_per_week + 1)
                                                        )}
                                                        className="h-8 w-8 rounded-lg bg-secondary dark:bg-slate-700 hover:bg-secondary/80 dark:hover:bg-slate-600 flex items-center justify-center text-foreground dark:text-white"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="border-t border-border dark:border-slate-700 p-4 bg-secondary/30 dark:bg-slate-900/50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {/* Scheduling Constraints */}
                                                    <div>
                                                        <label className="flex items-center gap-2 text-sm font-semibold text-foreground dark:text-white mb-2">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Max Consecutive Periods</span>
                                                        </label>
                                                        <div className="relative">
                                                        <select
                                                            value={allocation.max_consecutive_periods}
                                                            onChange={(e) => updateAllocation(
                                                                allocation.subject_id,
                                                                'max_consecutive_periods',
                                                                Number(e.target.value)
                                                            )}
                                                            className="w-full px-3 py-2 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-800 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer"
                                                        >
                                                            {[1, 2, 3, 4].map(num => (
                                                                <option key={num} value={num}>{num} period{num > 1 ? 's' : ''}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground dark:text-slate-500 mt-1">
                                                            Maximum back-to-back periods
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-foreground dark:text-white mb-2">
                                                            Min Gap Between Periods
                                                        </label>
                                                        <div className="relative">
                                                        <select
                                                            value={allocation.min_gap_between_periods}
                                                            onChange={(e) => updateAllocation(
                                                                allocation.subject_id,
                                                                'min_gap_between_periods',
                                                                Number(e.target.value)
                                                            )}
                                                            className="w-full px-3 py-2 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-800 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer"
                                                        >
                                                            {[0, 1, 2, 3].map(num => (
                                                                <option key={num} value={num}>{num} period{num !== 1 ? 's' : ''}</option>
                                                            ))}
                                                                    </select>
                                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground dark:text-slate-500 mt-1">
                                                            If same subject repeats in a day
                                                        </p>
                                                    </div>

                                                    {/* Preferred Time Slots */}
                                                    <div>
                                                        <label className="block text-sm font-semibold text-foreground dark:text-white mb-2">
                                                            Preferred Time Slots
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {TIME_SLOT_OPTIONS.map(slot => {
                                                                const isSelected = (allocation.preferred_slots || []).includes(slot.value);
                                                                return (
                                                                    <button
                                                                        key={slot.value}
                                                                        onClick={() => togglePreferredSlot(allocation.subject_id, slot.value)}
                                                                        className={cn(
                                                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                                                            isSelected
                                                                                ? "bg-primary text-white"
                                                                                : "bg-secondary dark:bg-slate-700 text-foreground dark:text-slate-300 hover:bg-secondary/80 dark:hover:bg-slate-600"
                                                                        )}
                                                                    >
                                                                        {slot.value}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground dark:text-slate-500 mt-1">
                                                            Optional scheduling preference
                                                        </p>
                                                    </div>

                                                    {/* Lab Configuration */}
                                                    <div className="md:col-span-2 lg:col-span-3">
                                                        <div className="flex items-center gap-4">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={allocation.requires_lab}
                                                                    onChange={(e) => updateAllocation(
                                                                        allocation.subject_id,
                                                                        'requires_lab',
                                                                        e.target.checked
                                                                    )}
                                                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                                                />
                                                                <span className="text-sm font-semibold text-foreground dark:text-white flex items-center gap-2">
                                                                    <Beaker className="h-4 w-4" />
                                                                    Requires Lab/Practical
                                                                </span>
                                                            </label>

                                                            {allocation.requires_lab && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-muted-foreground dark:text-slate-400">
                                                                        Lab Duration:
                                                                    </span>
                                                                    <div className="relative">
                                                                    <select
                                                                        value={allocation.lab_duration_periods}
                                                                        onChange={(e) => updateAllocation(
                                                                            allocation.subject_id,
                                                                            'lab_duration_periods',
                                                                            Number(e.target.value)
                                                                        )}
                                                                        className="px-3 py-1.5 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-800 text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer"
                                                                    >
                                                                        {[2, 3, 4].map(num => (
                                                                            <option key={num} value={num}>{num} periods</option>
                                                                        ))}
                                                                    </select>                                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
                                                                    </div>                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground dark:text-slate-500 mt-1">
                                                            Enable for subjects requiring lab sessions (will be scheduled as consecutive periods)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || subjectAllocations.length === 0}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all",
                                    saveSuccess
                                        ? "bg-green-500 text-white"
                                        : "bg-primary text-white hover:bg-primary/90",
                                    (isSaving || subjectAllocations.length === 0) && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Save className="h-5 w-5" />
                                {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card border rounded-lg p-12 shadow-sm dark:bg-slate-800 dark:border-slate-700 text-center">
                        <GraduationCap className="h-12 w-12 text-muted-foreground dark:text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">
                            Select Standard & Academic Year
                        </h3>
                        <p className="text-muted-foreground dark:text-slate-400">
                            Choose a standard and academic year to configure lecture allocations for each subject.
                        </p>
                    </div>
                )}

                {/* Summary Card */}
                {selectedStandardId && selectedAcademicYearId && subjectAllocations.length > 0 && (
                    <div className="mt-6 bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-foreground dark:text-white mb-4">Configuration Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {subjectAllocations.length}
                                </div>
                                <div className="text-sm text-muted-foreground dark:text-slate-400">Subjects</div>
                            </div>
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {totalLecturesPerWeek}
                                </div>
                                <div className="text-sm text-muted-foreground dark:text-slate-400">Periods/Week</div>
                            </div>
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {periodsPerDay}
                                </div>
                                <div className="text-sm text-muted-foreground dark:text-slate-400">Periods/Day</div>
                            </div>
                            <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                    {subjectAllocations.filter(a => a.requires_lab).length}
                                </div>
                                <div className="text-sm text-muted-foreground dark:text-slate-400">Lab Subjects</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default LectureConfigPage;
