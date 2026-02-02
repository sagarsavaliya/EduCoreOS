/**
 * Timing Configuration Types
 *
 * These types define the data models for institute timing settings,
 * lecture configuration, and timetable generation.
 *
 * Access: Owner, Admin only
 */

// ============================================
// Common Types
// ============================================

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type Status = 'active' | 'inactive';

export type TimeSlotPreference = 'morning' | 'mid-day' | 'afternoon';

// ============================================
// Institute Timing Settings
// ============================================

export interface BreakConfig {
    id: number;
    name: string;                       // "Short Break", "Lunch Break"
    after_period: number;               // Break comes after this period number
    duration: number;                   // Duration in minutes
    applies_to: 'all' | 'specific';     // All batches or specific ones
    batch_ids?: number[];               // If applies_to is 'specific'
}

export interface InstituteTimingSettings {
    id: number;
    institute_id: number;
    branch_id: number;

    // School Hours
    school_start_time: string;          // "08:00" (HH:mm format)
    school_end_time: string;            // "14:00"

    // Period Configuration
    default_period_duration: number;    // Duration in minutes (e.g., 45)
    gap_between_periods: number;        // Gap in minutes (e.g., 5)

    // Break Configuration
    breaks: BreakConfig[];

    // Working Days
    working_days: DayOfWeek[];

    // Metadata
    status: Status;
    created_at: string;
    updated_at: string;
}

// ============================================
// Lecture / Subject Allocation Configuration
// ============================================

export interface SubjectAllocation {
    subject_id: number;
    subject_name?: string;              // Populated from join for display

    // Core allocation
    lectures_per_week: number;          // e.g., 6 for Math, 4 for English

    // Scheduling constraints
    max_consecutive_periods: number;    // Max back-to-back periods (default: 2)
    min_gap_between_periods: number;    // Min periods gap if same subject repeats in day
    preferred_slots?: TimeSlotPreference[]; // "morning", "afternoon", etc.

    // Lab configuration
    requires_lab: boolean;              // Needs lab room (for double periods)
    lab_duration_periods: number;       // How many periods for lab (e.g., 2)
}

export interface StandardLectureConfig {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    standard_id: number;
    standard_name?: string;             // Populated from join for display

    // Total periods per day for this standard
    periods_per_day: number;            // e.g., 8

    // Subject-wise lecture allocation
    subject_allocations: SubjectAllocation[];

    // Metadata
    status: Status;
    created_at: string;
    updated_at: string;
}

// ============================================
// Teacher Availability (for algorithm)
// ============================================

export interface TeacherAvailability {
    id: number;
    teacher_id: number;
    teacher_name?: string;              // Populated from join for display
    day_of_week: DayOfWeek;
    available_from: string;             // "08:00"
    available_until: string;            // "14:00"
    unavailable_periods?: number[];     // Specific period numbers they can't teach
    max_periods_per_day: number;        // Workload limit
    preferred_subjects?: number[];      // Subject IDs they prefer to teach
}

export interface SubjectTeacherMapping {
    id: number;
    subject_id: number;
    subject_name?: string;
    teacher_id: number;
    teacher_name?: string;
    batch_ids: number[];                // Which batches this teacher handles for this subject
    is_primary: boolean;                // Primary teacher for this subject-batch combo
}

// ============================================
// Generated/Computed Types
// ============================================

export interface PeriodSlot {
    period_number: number;              // 1, 2, 3...
    start_time: string;                 // "08:00"
    end_time: string;                   // "08:45"
    is_break: boolean;
    break_name?: string;                // "Short Break", "Lunch Break"
}

export interface GeneratedTimetableEntry {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_id: number;
    batch_name?: string;

    // Schedule details
    day_of_week: DayOfWeek;
    period_number: number;
    start_time: string;
    end_time: string;

    // Assignment
    subject_id: number;
    subject_name?: string;
    teacher_id: number;
    teacher_name?: string;
    room_id?: number;
    room_name?: string;

    // Flags
    is_lab: boolean;
    is_combined_period: boolean;        // Part of a double period
    combined_with_period?: number;      // Which period it's combined with

    // Status
    status: 'active' | 'substituted' | 'cancelled';
    substituted_by_teacher_id?: number;
    cancellation_reason?: string;

    // Metadata
    created_at: string;
    updated_at: string;
}

// ============================================
// Timetable Generation Types
// ============================================

export interface TimetableGenerationInput {
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    batch_ids: number[];                // Batches to generate timetable for
    timing_settings: InstituteTimingSettings;
    lecture_configs: StandardLectureConfig[];
    teacher_mappings: SubjectTeacherMapping[];
    teacher_availability?: TeacherAvailability[];
    force_regenerate?: boolean;         // Overwrite existing timetable
}

export interface TimetableGenerationWarning {
    type: 'soft_constraint' | 'optimization' | 'info';
    message: string;
    affected_batch_id?: number;
    affected_subject_id?: number;
    affected_teacher_id?: number;
}

export interface TeacherWorkloadSummary {
    teacher_id: number;
    teacher_name?: string;
    total_periods_per_week: number;
    periods_per_day: Record<DayOfWeek, number>;
}

export interface SubjectDistributionSummary {
    subject_id: number;
    subject_name?: string;
    periods_per_day: Record<DayOfWeek, number>;
    is_evenly_distributed: boolean;
}

export interface TimetableGenerationResult {
    success: boolean;
    timetable: GeneratedTimetableEntry[];
    warnings: TimetableGenerationWarning[];
    statistics: {
        total_periods_scheduled: number;
        total_batches_processed: number;
        teacher_workload: TeacherWorkloadSummary[];
        subject_distribution: SubjectDistributionSummary[];
        generation_time_ms: number;
    };
    error?: string;                     // Only if success is false
}

// ============================================
// Form Types (for UI)
// ============================================

export interface TimingSettingsFormData {
    school_start_time: string;
    school_end_time: string;
    default_period_duration: number;
    gap_between_periods: number;
    breaks: Omit<BreakConfig, 'id'>[];
    working_days: DayOfWeek[];
}

export interface SubjectAllocationFormData {
    subject_id: number;
    lectures_per_week: number;
    max_consecutive_periods: number;
    min_gap_between_periods: number;
    preferred_slots: TimeSlotPreference[];
    requires_lab: boolean;
    lab_duration_periods: number;
}

export interface LectureConfigFormData {
    standard_id: number;
    periods_per_day: number;
    subject_allocations: SubjectAllocationFormData[];
}

// ============================================
// Utility Types
// ============================================

export type PartialTimingSettings = Partial<Omit<InstituteTimingSettings, 'id' | 'created_at' | 'updated_at'>>;

export type PartialLectureConfig = Partial<Omit<StandardLectureConfig, 'id' | 'created_at' | 'updated_at'>>;

// Default values for new configurations
export const DEFAULT_TIMING_SETTINGS: TimingSettingsFormData = {
    school_start_time: '08:00',
    school_end_time: '14:00',
    default_period_duration: 45,
    gap_between_periods: 5,
    breaks: [
        { name: 'Short Break', after_period: 2, duration: 10, applies_to: 'all' },
        { name: 'Lunch Break', after_period: 4, duration: 30, applies_to: 'all' },
    ],
    working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

export const DEFAULT_SUBJECT_ALLOCATION: Omit<SubjectAllocationFormData, 'subject_id'> = {
    lectures_per_week: 4,
    max_consecutive_periods: 2,
    min_gap_between_periods: 1,
    preferred_slots: [],
    requires_lab: false,
    lab_duration_periods: 2,
};

export const ALL_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WEEKDAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const PERIOD_DURATION_OPTIONS = [30, 35, 40, 45, 50, 55, 60] as const;

export const GAP_DURATION_OPTIONS = [0, 5, 10, 15] as const;
