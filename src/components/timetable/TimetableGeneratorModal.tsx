import React, { useState, useMemo } from 'react';
import { Wand2, AlertTriangle, CheckCircle, Clock, Users, BookOpen, Loader2, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useMockQuery, dal } from '@/hooks/use-mock-data';
import { useAuthStore } from '@/hooks/use-stores';
import { generateTimetable, GeneratorInput } from '@/utils/timetable-generator';
import {
    GeneratedTimetableEntry,
    TimetableGenerationResult,
    TimetableGenerationWarning,
    DayOfWeek,
} from '@/types/timing';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    academicYearId: number;
    onGenerated?: (timetable: GeneratedTimetableEntry[]) => void;
}

interface Batch {
    id: number;
    name: string;
    standard_id: number;
    medium_id: number;
    branch_id: number;
}

interface Subject {
    id: number;
    name: string;
    standard_id: number;
    institute_id: number;
}

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
    branch_id: number;
}

const TimetableGeneratorModal: React.FC<Props> = ({ isOpen, onClose, academicYearId, onGenerated }) => {
    const { user } = useAuthStore();
    const instituteId = user?.institute_id || 1;
    const branchId = 1; // TODO: Get from context

    // State
    const [step, setStep] = useState<'config' | 'generating' | 'result'>('config');
    const [selectedBatches, setSelectedBatches] = useState<number[]>([]);
    const [result, setResult] = useState<TimetableGenerationResult | null>(null);

    // Fetch data
    const { data: batches = [] } = useMockQuery<Batch[]>(
        ['batches', branchId.toString()],
        () => dal.getBatches(branchId) as Batch[]
    );

    const { data: subjects = [] } = useMockQuery<Subject[]>(
        ['subjects', instituteId.toString()],
        () => dal.getSubjects(instituteId) as Subject[]
    );

    const { data: teachers = [] } = useMockQuery<Teacher[]>(
        ['teachers', branchId.toString()],
        () => dal.getTeachers(branchId) as Teacher[]
    );

    const { data: timingSettings } = useMockQuery(
        ['timing-settings', branchId.toString()],
        () => dal.getTimingSettings(branchId)
    );

    const { data: lectureConfigs = [] } = useMockQuery(
        ['lecture-configs', instituteId.toString()],
        () => dal.getLectureConfigsByInstitute(instituteId)
    );

    // Default timing settings if none found
    const defaultTimingSettings = {
        id: 1,
        institute_id: instituteId,
        branch_id: branchId,
        school_start_time: '08:00',
        school_end_time: '14:00',
        default_period_duration: 45,
        gap_between_periods: 5,
        breaks: [
            { id: 1, name: 'Short Break', after_period: 2, duration: 10, applies_to: 'all' as const },
            { id: 2, name: 'Lunch Break', after_period: 4, duration: 30, applies_to: 'all' as const },
        ],
        working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as DayOfWeek[],
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const effectiveTimingSettings = timingSettings || defaultTimingSettings;

    const toggleBatch = (batchId: number) => {
        setSelectedBatches(prev =>
            prev.includes(batchId)
                ? prev.filter(id => id !== batchId)
                : [...prev, batchId]
        );
    };

    const selectAllBatches = () => {
        setSelectedBatches(batches.map((b: Batch) => b.id));
    };

    const handleGenerate = async () => {
        setStep('generating');

        // Small delay for UI feedback
        await new Promise(resolve => setTimeout(resolve, 500));

        const selectedBatchObjects = batches
            .filter((b: Batch) => selectedBatches.includes(b.id))
            .map((b: Batch) => ({
                id: b.id,
                name: b.name,
                standard_id: b.standard_id,
                medium_id: b.medium_id,
            }));

        const input: GeneratorInput = {
            institute_id: instituteId,
            branch_id: branchId,
            academic_year_id: academicYearId,
            timing_settings: effectiveTimingSettings,
            batches: selectedBatchObjects,
            subjects: subjects.map((s: Subject) => ({
                id: s.id,
                name: s.name,
                standard_id: s.standard_id,
            })),
            teachers: teachers.map((t: Teacher) => ({
                id: t.id,
                name: `${t.first_name} ${t.last_name}`,
            })),
            lecture_configs: lectureConfigs,
            subject_teacher_mappings: [], // Will use auto-assignment
        };

        const generationResult = generateTimetable(input);
        setResult(generationResult);
        setStep('result');
    };

    const handleApply = () => {
        if (result && onGenerated) {
            onGenerated(result.timetable);
        }
        handleClose();
    };

    const handleClose = () => {
        setStep('config');
        setSelectedBatches([]);
        setResult(null);
        onClose();
    };

    const renderConfigStep = () => (
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Smart Timetable Generation</p>
                    <p>
                        The algorithm will create a balanced timetable based on your timing settings and lecture configurations.
                        It considers teacher availability, subject distribution, and consecutive period limits.
                    </p>
                </div>
            </div>

            {/* Timing Settings Summary */}
            <div className="bg-card border rounded-xl p-4 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-foreground dark:text-white mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timing Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground dark:text-slate-400">School Hours:</span>
                        <span className="ml-2 font-medium text-foreground dark:text-white">
                            {effectiveTimingSettings.school_start_time} - {effectiveTimingSettings.school_end_time}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground dark:text-slate-400">Period Duration:</span>
                        <span className="ml-2 font-medium text-foreground dark:text-white">
                            {effectiveTimingSettings.default_period_duration} min
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground dark:text-slate-400">Working Days:</span>
                        <span className="ml-2 font-medium text-foreground dark:text-white">
                            {effectiveTimingSettings.working_days?.length || 6} days
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground dark:text-slate-400">Breaks:</span>
                        <span className="ml-2 font-medium text-foreground dark:text-white">
                            {effectiveTimingSettings.breaks?.length || 0} configured
                        </span>
                    </div>
                </div>
            </div>

            {/* Batch Selection */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground dark:text-white flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Select Batches
                    </h3>
                    <button
                        onClick={selectAllBatches}
                        className="text-xs text-primary hover:underline"
                    >
                        Select All
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {batches.map((batch: Batch) => {
                        const isSelected = selectedBatches.includes(batch.id);
                        const hasConfig = lectureConfigs.some((lc: any) => lc.standard_id === batch.standard_id);

                        return (
                            <button
                                key={batch.id}
                                onClick={() => toggleBatch(batch.id)}
                                className={cn(
                                    "p-3 rounded-xl border text-left transition-all",
                                    isSelected
                                        ? "bg-primary/10 border-primary dark:bg-primary/20"
                                        : "bg-card border-border dark:bg-slate-800 dark:border-slate-700 hover:border-primary/50"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm text-foreground dark:text-white">
                                        {batch.name}
                                    </span>
                                    {isSelected && (
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                    )}
                                </div>
                                {!hasConfig && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400">
                                        No lecture config
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border dark:border-slate-700">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleGenerate}
                    disabled={selectedBatches.length === 0}
                >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Timetable
                </Button>
            </div>
        </div>
    );

    const renderGeneratingStep = () => (
        <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">
                Generating Timetable...
            </h3>
            <p className="text-sm text-muted-foreground dark:text-slate-400">
                Applying constraints and optimizing schedule
            </p>
        </div>
    );

    const renderResultStep = () => {
        if (!result) return null;

        return (
            <div className="space-y-6">
                {/* Status Banner */}
                <div className={cn(
                    "rounded-xl p-4 flex items-start gap-3",
                    result.success
                        ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                )}>
                    {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="text-sm">
                        <p className={cn(
                            "font-semibold mb-1",
                            result.success ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
                        )}>
                            {result.success ? 'Timetable Generated Successfully!' : 'Generation Failed'}
                        </p>
                        <p className={result.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                            {result.success
                                ? `Created ${result.statistics.total_periods_scheduled} entries for ${result.statistics.total_batches_processed} batches in ${result.statistics.generation_time_ms}ms.`
                                : result.error
                            }
                        </p>
                    </div>
                </div>

                {/* Statistics */}
                {result.success && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card border rounded-xl p-4 text-center dark:bg-slate-800 dark:border-slate-700">
                            <div className="text-2xl font-bold text-primary">
                                {result.statistics.total_periods_scheduled}
                            </div>
                            <div className="text-xs text-muted-foreground dark:text-slate-400">
                                Periods Scheduled
                            </div>
                        </div>
                        <div className="bg-card border rounded-xl p-4 text-center dark:bg-slate-800 dark:border-slate-700">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {result.statistics.total_batches_processed}
                            </div>
                            <div className="text-xs text-muted-foreground dark:text-slate-400">
                                Batches Processed
                            </div>
                        </div>
                        <div className="bg-card border rounded-xl p-4 text-center dark:bg-slate-800 dark:border-slate-700">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {result.statistics.teacher_workload.length}
                            </div>
                            <div className="text-xs text-muted-foreground dark:text-slate-400">
                                Teachers Assigned
                            </div>
                        </div>
                        <div className="bg-card border rounded-xl p-4 text-center dark:bg-slate-800 dark:border-slate-700">
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {result.statistics.generation_time_ms}ms
                            </div>
                            <div className="text-xs text-muted-foreground dark:text-slate-400">
                                Generation Time
                            </div>
                        </div>
                    </div>
                )}

                {/* Warnings */}
                {result.warnings.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Warnings ({result.warnings.length})
                        </h4>
                        <ul className="space-y-1 max-h-32 overflow-y-auto">
                            {result.warnings.map((warning: TimetableGenerationWarning, index: number) => (
                                <li key={index} className="text-xs text-amber-700 dark:text-amber-400">
                                    • {warning.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Teacher Workload Summary */}
                {result.success && result.statistics.teacher_workload.length > 0 && (
                    <div className="bg-card border rounded-xl p-4 dark:bg-slate-800 dark:border-slate-700">
                        <h4 className="text-sm font-semibold text-foreground dark:text-white mb-3">
                            Teacher Workload Summary
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {result.statistics.teacher_workload.slice(0, 5).map((teacher) => (
                                <div key={teacher.teacher_id} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground dark:text-slate-400">
                                        {teacher.teacher_name || `Teacher ${teacher.teacher_id}`}
                                    </span>
                                    <span className="font-medium text-foreground dark:text-white">
                                        {teacher.total_periods_per_week} periods/week
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border dark:border-slate-700">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('config')}>
                        Back
                    </Button>
                    {result.success && (
                        <Button variant="primary" className="flex-1" onClick={handleApply}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Apply Timetable
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={
                step === 'config' ? 'Generate Timetable' :
                step === 'generating' ? 'Processing...' :
                'Generation Result'
            }
        >
            {step === 'config' && renderConfigStep()}
            {step === 'generating' && renderGeneratingStep()}
            {step === 'result' && renderResultStep()}
        </Modal>
    );
};

export default TimetableGeneratorModal;
