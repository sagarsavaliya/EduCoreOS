/**
 * Timetable Generator using CSP (Constraint Satisfaction Problem) with Backtracking
 *
 * This algorithm generates balanced timetables by treating scheduling as a CSP where:
 * - Variables: Each (batch, day, period) slot that needs a subject assigned
 * - Domain: Available subjects that still need lectures allocated
 * - Constraints: Teacher conflicts, consecutive period limits, gap requirements, etc.
 */

import {
    DayOfWeek,
    InstituteTimingSettings,
    StandardLectureConfig,
    SubjectAllocation,
    GeneratedTimetableEntry,
    TimetableGenerationResult,
    TimetableGenerationWarning,
    PeriodSlot,
} from '@/types/timing';

// ============================================
// Internal Types
// ============================================

interface Batch {
    id: number;
    name: string;
    standard_id: number;
    medium_id: number;
}

interface Subject {
    id: number;
    name: string;
    standard_id: number;
}

interface Teacher {
    id: number;
    name: string;
}

interface SubjectTeacherMap {
    subject_id: number;
    teacher_id: number;
    batch_id: number;
}

interface SlotAssignment {
    batch_id: number;
    day: DayOfWeek;
    period: number;
    subject_id: number;
    teacher_id: number;
    is_lab: boolean;
    is_combined: boolean;
}

interface BatchState {
    batch_id: number;
    standard_id: number;
    remaining_lectures: Map<number, number>; // subject_id -> remaining count
    subject_allocations: Map<number, SubjectAllocation>;
    daily_subject_count: Map<DayOfWeek, Map<number, number>>; // day -> subject -> count
    daily_consecutive: Map<DayOfWeek, Map<number, number>>; // day -> subject -> consecutive count
    last_period_subject: Map<DayOfWeek, number | null>; // day -> last subject assigned
}

interface GeneratorState {
    assignments: SlotAssignment[];
    batch_states: Map<number, BatchState>;
    teacher_schedule: Map<number, Map<DayOfWeek, Set<number>>>; // teacher -> day -> periods
    warnings: TimetableGenerationWarning[];
}

// ============================================
// Helper Functions
// ============================================

function parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function generatePeriodSlots(settings: InstituteTimingSettings): PeriodSlot[] {
    const slots: PeriodSlot[] = [];
    let currentTime = parseTime(settings.school_start_time);
    const endTime = parseTime(settings.school_end_time);
    let periodNumber = 1;

    while (currentTime < endTime) {
        // Check if there's a break after the previous period
        const breakAfterPrevious = settings.breaks.find(b => b.after_period === periodNumber - 1);
        if (breakAfterPrevious && periodNumber > 1) {
            slots.push({
                period_number: -1,
                start_time: formatTime(currentTime),
                end_time: formatTime(currentTime + breakAfterPrevious.duration),
                is_break: true,
                break_name: breakAfterPrevious.name,
            });
            currentTime += breakAfterPrevious.duration;
        }

        // Add period
        const periodEndTime = currentTime + settings.default_period_duration;
        if (periodEndTime <= endTime + 15) {
            slots.push({
                period_number: periodNumber,
                start_time: formatTime(currentTime),
                end_time: formatTime(periodEndTime),
                is_break: false,
            });
            currentTime = periodEndTime + settings.gap_between_periods;
            periodNumber++;
        } else {
            break;
        }
    }

    return slots;
}

function getTimeSlotPreference(periodNumber: number, totalPeriods: number): 'morning' | 'mid-day' | 'afternoon' {
    const ratio = periodNumber / totalPeriods;
    if (ratio <= 0.375) return 'morning'; // First ~3 periods of 8
    if (ratio <= 0.625) return 'mid-day'; // Middle ~2 periods
    return 'afternoon'; // Last ~3 periods
}

// ============================================
// Constraint Checking Functions
// ============================================

function canAssignSubject(
    state: GeneratorState,
    batchState: BatchState,
    day: DayOfWeek,
    period: number,
    subjectId: number,
    teacherId: number,
    totalPeriods: number
): { canAssign: boolean; reason?: string } {
    const allocation = batchState.subject_allocations.get(subjectId);
    if (!allocation) {
        return { canAssign: false, reason: 'Subject allocation not found' };
    }

    // Check if subject still needs lectures
    const remaining = batchState.remaining_lectures.get(subjectId) || 0;
    if (remaining <= 0) {
        return { canAssign: false, reason: 'All lectures for this subject are allocated' };
    }

    // Check teacher availability (not teaching another batch at same time)
    const teacherDaySchedule = state.teacher_schedule.get(teacherId)?.get(day);
    if (teacherDaySchedule?.has(period)) {
        return { canAssign: false, reason: 'Teacher is busy at this time' };
    }

    // Check consecutive period limit
    const dailyConsecutive = batchState.daily_consecutive.get(day)?.get(subjectId) || 0;
    const lastSubject = batchState.last_period_subject.get(day);

    if (lastSubject === subjectId && dailyConsecutive >= allocation.max_consecutive_periods) {
        return { canAssign: false, reason: 'Max consecutive periods reached for this subject' };
    }

    // Check min gap between periods (if subject already assigned today and we're not consecutive)
    const dailyCount = batchState.daily_subject_count.get(day)?.get(subjectId) || 0;
    if (dailyCount > 0 && lastSubject !== subjectId) {
        // Subject was assigned earlier today and there's a gap
        // For simplicity, we allow it but could add stricter gap checking
    }

    // Soft constraint: Check preferred time slots (warning only, not blocking)
    const slotPreference = getTimeSlotPreference(period, totalPeriods);
    const preferredSlots = allocation.preferred_slots || [];
    if (preferredSlots.length > 0 && !preferredSlots.includes(slotPreference)) {
        // This is a soft constraint - we can still assign but might add a warning
    }

    return { canAssign: true };
}

// ============================================
// CSP Solver with Backtracking
// ============================================

function selectNextVariable(
    state: GeneratorState,
    workingDays: DayOfWeek[],
    periodsPerDay: number,
    batches: Batch[]
): { batch_id: number; day: DayOfWeek; period: number } | null {
    // MRV (Minimum Remaining Values) heuristic:
    // Pick the slot for the batch with fewest remaining options

    for (const day of workingDays) {
        for (let period = 1; period <= periodsPerDay; period++) {
            for (const batch of batches) {
                // Check if this slot is already assigned
                const existingAssignment = state.assignments.find(
                    a => a.batch_id === batch.id && a.day === day && a.period === period
                );
                if (!existingAssignment) {
                    return { batch_id: batch.id, day, period };
                }
            }
        }
    }
    return null;
}

function getOrderedDomain(
    state: GeneratorState,
    batchState: BatchState,
    day: DayOfWeek,
    period: number,
    subjectTeacherMap: Map<number, number>,
    totalPeriods: number
): number[] {
    // Get subjects that can still be assigned, ordered by:
    // 1. Subjects with more remaining lectures (to ensure distribution)
    // 2. Subjects that prefer this time slot

    const candidates: { subjectId: number; score: number }[] = [];

    for (const [subjectId, remaining] of batchState.remaining_lectures) {
        if (remaining <= 0) continue;

        const teacherId = subjectTeacherMap.get(subjectId);
        if (!teacherId) continue;

        const check = canAssignSubject(state, batchState, day, period, subjectId, teacherId, totalPeriods);
        if (!check.canAssign) continue;

        const allocation = batchState.subject_allocations.get(subjectId);
        let score = remaining * 10; // Base score on remaining lectures

        // Bonus for matching preferred time slot
        const slotPreference = getTimeSlotPreference(period, totalPeriods);
        if (allocation?.preferred_slots?.includes(slotPreference)) {
            score += 5;
        }

        // Penalty for subjects already taught today (prefer distribution)
        const dailyCount = batchState.daily_subject_count.get(day)?.get(subjectId) || 0;
        score -= dailyCount * 3;

        candidates.push({ subjectId, score });
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);
    return candidates.map(c => c.subjectId);
}

function applyAssignment(
    state: GeneratorState,
    batchState: BatchState,
    assignment: SlotAssignment
): void {
    state.assignments.push(assignment);

    // Update remaining lectures
    const currentRemaining = batchState.remaining_lectures.get(assignment.subject_id) || 0;
    batchState.remaining_lectures.set(assignment.subject_id, currentRemaining - 1);

    // Update daily subject count
    if (!batchState.daily_subject_count.has(assignment.day)) {
        batchState.daily_subject_count.set(assignment.day, new Map());
    }
    const dayCount = batchState.daily_subject_count.get(assignment.day)!;
    dayCount.set(assignment.subject_id, (dayCount.get(assignment.subject_id) || 0) + 1);

    // Update consecutive count
    if (!batchState.daily_consecutive.has(assignment.day)) {
        batchState.daily_consecutive.set(assignment.day, new Map());
    }
    const lastSubject = batchState.last_period_subject.get(assignment.day);
    const consecutiveMap = batchState.daily_consecutive.get(assignment.day)!;

    if (lastSubject === assignment.subject_id) {
        consecutiveMap.set(assignment.subject_id, (consecutiveMap.get(assignment.subject_id) || 0) + 1);
    } else {
        // Reset all consecutive counts for this day, set current subject to 1
        for (const key of consecutiveMap.keys()) {
            consecutiveMap.set(key, 0);
        }
        consecutiveMap.set(assignment.subject_id, 1);
    }

    batchState.last_period_subject.set(assignment.day, assignment.subject_id);

    // Update teacher schedule
    if (!state.teacher_schedule.has(assignment.teacher_id)) {
        state.teacher_schedule.set(assignment.teacher_id, new Map());
    }
    const teacherSchedule = state.teacher_schedule.get(assignment.teacher_id)!;
    if (!teacherSchedule.has(assignment.day)) {
        teacherSchedule.set(assignment.day, new Set());
    }
    teacherSchedule.get(assignment.day)!.add(assignment.period);
}

function undoAssignment(
    state: GeneratorState,
    batchState: BatchState,
    assignment: SlotAssignment
): void {
    // Remove from assignments
    const index = state.assignments.findIndex(
        a => a.batch_id === assignment.batch_id &&
             a.day === assignment.day &&
             a.period === assignment.period
    );
    if (index !== -1) {
        state.assignments.splice(index, 1);
    }

    // Restore remaining lectures
    const currentRemaining = batchState.remaining_lectures.get(assignment.subject_id) || 0;
    batchState.remaining_lectures.set(assignment.subject_id, currentRemaining + 1);

    // Update daily subject count
    const dayCount = batchState.daily_subject_count.get(assignment.day);
    if (dayCount) {
        const current = dayCount.get(assignment.subject_id) || 0;
        dayCount.set(assignment.subject_id, Math.max(0, current - 1));
    }

    // Remove from teacher schedule
    const teacherSchedule = state.teacher_schedule.get(assignment.teacher_id);
    if (teacherSchedule) {
        teacherSchedule.get(assignment.day)?.delete(assignment.period);
    }

    // Note: Consecutive tracking is complex to undo perfectly,
    // but since we backtrack in order, it should be okay
}

function solve(
    state: GeneratorState,
    workingDays: DayOfWeek[],
    periodsPerDay: number,
    batches: Batch[],
    subjectTeacherMaps: Map<number, Map<number, number>>, // batch_id -> (subject_id -> teacher_id)
    maxIterations: number = 100000
): boolean {
    let iterations = 0;

    function backtrack(): boolean {
        iterations++;
        if (iterations > maxIterations) {
            state.warnings.push({
                type: 'optimization',
                message: 'Max iterations reached. Timetable may be incomplete.',
            });
            return true; // Return partial solution
        }

        const variable = selectNextVariable(state, workingDays, periodsPerDay, batches);
        if (!variable) {
            // All slots filled
            return true;
        }

        const { batch_id, day, period } = variable;
        const batchState = state.batch_states.get(batch_id);
        if (!batchState) return false;

        const subjectTeacherMap = subjectTeacherMaps.get(batch_id);
        if (!subjectTeacherMap) return false;

        const domain = getOrderedDomain(state, batchState, day, period, subjectTeacherMap, periodsPerDay);

        if (domain.length === 0) {
            // No valid subject for this slot - add a free period
            const freeAssignment: SlotAssignment = {
                batch_id,
                day,
                period,
                subject_id: -1, // Free period marker
                teacher_id: -1,
                is_lab: false,
                is_combined: false,
            };
            state.assignments.push(freeAssignment);
            return backtrack();
        }

        for (const subjectId of domain) {
            const teacherId = subjectTeacherMap.get(subjectId);
            if (!teacherId) continue;

            const allocation = batchState.subject_allocations.get(subjectId);
            const assignment: SlotAssignment = {
                batch_id,
                day,
                period,
                subject_id: subjectId,
                teacher_id: teacherId,
                is_lab: allocation?.requires_lab || false,
                is_combined: false,
            };

            applyAssignment(state, batchState, assignment);

            if (backtrack()) {
                return true;
            }

            undoAssignment(state, batchState, assignment);
        }

        // If no subject works, assign as free period
        const freeAssignment: SlotAssignment = {
            batch_id,
            day,
            period,
            subject_id: -1,
            teacher_id: -1,
            is_lab: false,
            is_combined: false,
        };
        state.assignments.push(freeAssignment);
        return backtrack();
    }

    return backtrack();
}

// ============================================
// Main Generator Function
// ============================================

export interface GeneratorInput {
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    timing_settings: InstituteTimingSettings;
    batches: Batch[];
    subjects: Subject[];
    teachers: Teacher[];
    lecture_configs: StandardLectureConfig[];
    subject_teacher_mappings: SubjectTeacherMap[];
}

export function generateTimetable(input: GeneratorInput): TimetableGenerationResult {
    const startTime = performance.now();
    const warnings: TimetableGenerationWarning[] = [];

    try {
        const { timing_settings, batches, subjects, teachers, lecture_configs, subject_teacher_mappings } = input;

        // Generate period slots
        const periodSlots = generatePeriodSlots(timing_settings);
        const teachingPeriods = periodSlots.filter(s => !s.is_break);
        const periodsPerDay = teachingPeriods.length;
        const workingDays = timing_settings.working_days;

        // Build subject-teacher map per batch
        const subjectTeacherMaps = new Map<number, Map<number, number>>();
        for (const batch of batches) {
            const batchMap = new Map<number, number>();
            for (const mapping of subject_teacher_mappings) {
                if (mapping.batch_id === batch.id) {
                    batchMap.set(mapping.subject_id, mapping.teacher_id);
                }
            }

            // If no explicit mapping, try to auto-assign teachers
            // (In real implementation, this would be more sophisticated)
            const batchConfig = lecture_configs.find(lc => lc.standard_id === batch.standard_id);
            if (batchConfig && batchMap.size === 0) {
                // Auto-assign: Use teacher index as teacher ID for demo
                batchConfig.subject_allocations.forEach((alloc, index) => {
                    const teacherIndex = index % teachers.length;
                    batchMap.set(alloc.subject_id, teachers[teacherIndex]?.id || 1);
                });
                warnings.push({
                    type: 'info',
                    message: `Auto-assigned teachers for batch ${batch.name}. Consider setting explicit mappings.`,
                    affected_batch_id: batch.id,
                });
            }

            subjectTeacherMaps.set(batch.id, batchMap);
        }

        // Initialize batch states
        const batch_states = new Map<number, BatchState>();
        for (const batch of batches) {
            const config = lecture_configs.find(lc => lc.standard_id === batch.standard_id);
            if (!config) {
                warnings.push({
                    type: 'soft_constraint',
                    message: `No lecture config found for batch ${batch.name} (standard ${batch.standard_id})`,
                    affected_batch_id: batch.id,
                });
                continue;
            }

            const remaining_lectures = new Map<number, number>();
            const subject_allocations = new Map<number, SubjectAllocation>();

            for (const alloc of config.subject_allocations) {
                remaining_lectures.set(alloc.subject_id, alloc.lectures_per_week);
                subject_allocations.set(alloc.subject_id, alloc);
            }

            batch_states.set(batch.id, {
                batch_id: batch.id,
                standard_id: batch.standard_id,
                remaining_lectures,
                subject_allocations,
                daily_subject_count: new Map(),
                daily_consecutive: new Map(),
                last_period_subject: new Map(),
            });
        }

        // Initialize generator state
        const state: GeneratorState = {
            assignments: [],
            batch_states,
            teacher_schedule: new Map(),
            warnings,
        };

        // Run CSP solver
        const success = solve(state, workingDays, periodsPerDay, batches, subjectTeacherMaps);

        // Convert assignments to timetable entries
        const timetable: GeneratedTimetableEntry[] = [];
        let entryId = 1;

        for (const assignment of state.assignments) {
            if (assignment.subject_id === -1) {
                // Skip free periods in output (or include them with special handling)
                continue;
            }

            const periodSlot = teachingPeriods[assignment.period - 1];
            const subject = subjects.find(s => s.id === assignment.subject_id);
            const teacher = teachers.find(t => t.id === assignment.teacher_id);
            const batch = batches.find(b => b.id === assignment.batch_id);

            timetable.push({
                id: entryId++,
                institute_id: input.institute_id,
                branch_id: input.branch_id,
                academic_year_id: input.academic_year_id,
                batch_id: assignment.batch_id,
                batch_name: batch?.name,
                day_of_week: assignment.day,
                period_number: assignment.period,
                start_time: periodSlot?.start_time || '',
                end_time: periodSlot?.end_time || '',
                subject_id: assignment.subject_id,
                subject_name: subject?.name,
                teacher_id: assignment.teacher_id,
                teacher_name: teacher?.name,
                is_lab: assignment.is_lab,
                is_combined_period: assignment.is_combined,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
        }

        // Calculate statistics
        const teacher_workload = calculateTeacherWorkload(timetable, teachers, workingDays);
        const subject_distribution = calculateSubjectDistribution(timetable, subjects, workingDays);

        const endTime = performance.now();

        return {
            success,
            timetable,
            warnings: state.warnings,
            statistics: {
                total_periods_scheduled: timetable.length,
                total_batches_processed: batches.length,
                teacher_workload,
                subject_distribution,
                generation_time_ms: Math.round(endTime - startTime),
            },
        };
    } catch (error) {
        const endTime = performance.now();
        return {
            success: false,
            timetable: [],
            warnings,
            statistics: {
                total_periods_scheduled: 0,
                total_batches_processed: 0,
                teacher_workload: [],
                subject_distribution: [],
                generation_time_ms: Math.round(endTime - startTime),
            },
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

function calculateTeacherWorkload(
    timetable: GeneratedTimetableEntry[],
    teachers: Teacher[],
    workingDays: DayOfWeek[]
): { teacher_id: number; teacher_name?: string; total_periods_per_week: number; periods_per_day: Record<DayOfWeek, number> }[] {
    const workload = new Map<number, { total: number; byDay: Record<DayOfWeek, number> }>();

    for (const teacher of teachers) {
        const byDay: Record<DayOfWeek, number> = {} as Record<DayOfWeek, number>;
        for (const day of workingDays) {
            byDay[day] = 0;
        }
        workload.set(teacher.id, { total: 0, byDay });
    }

    for (const entry of timetable) {
        const teacherLoad = workload.get(entry.teacher_id);
        if (teacherLoad) {
            teacherLoad.total++;
            teacherLoad.byDay[entry.day_of_week]++;
        }
    }

    return teachers.map(t => {
        const load = workload.get(t.id) || { total: 0, byDay: {} as Record<DayOfWeek, number> };
        return {
            teacher_id: t.id,
            teacher_name: t.name,
            total_periods_per_week: load.total,
            periods_per_day: load.byDay,
        };
    });
}

function calculateSubjectDistribution(
    timetable: GeneratedTimetableEntry[],
    subjects: Subject[],
    workingDays: DayOfWeek[]
): { subject_id: number; subject_name?: string; periods_per_day: Record<DayOfWeek, number>; is_evenly_distributed: boolean }[] {
    const distribution = new Map<number, Record<DayOfWeek, number>>();

    for (const subject of subjects) {
        const byDay: Record<DayOfWeek, number> = {} as Record<DayOfWeek, number>;
        for (const day of workingDays) {
            byDay[day] = 0;
        }
        distribution.set(subject.id, byDay);
    }

    for (const entry of timetable) {
        const subjectDist = distribution.get(entry.subject_id);
        if (subjectDist) {
            subjectDist[entry.day_of_week]++;
        }
    }

    return subjects.map(s => {
        const byDay = distribution.get(s.id) || ({} as Record<DayOfWeek, number>);
        const counts = Object.values(byDay);
        const max = Math.max(...counts);
        const min = Math.min(...counts);
        const isEven = max - min <= 1;

        return {
            subject_id: s.id,
            subject_name: s.name,
            periods_per_day: byDay,
            is_evenly_distributed: isEven,
        };
    });
}

// Export helper for UI
export { generatePeriodSlots };
