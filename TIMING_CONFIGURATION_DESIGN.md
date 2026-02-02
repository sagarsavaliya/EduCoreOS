# Timing Configuration Feature - Design Document

**Date:** February 2, 2026
**Feature:** Institute Timing Configuration & Smart Timetable Generation
**Access:** Owner, Admin only

---

## 1. Data Models / TypeScript Interfaces

### 1.1 Institute Timing Settings

```typescript
// src/types/timing.ts

export interface InstituteTimingSettings {
    id: number;
    institute_id: number;
    branch_id: number;

    // School Hours
    school_start_time: string;          // "08:00" (HH:mm format)
    school_end_time: string;            // "14:00"

    // Period Configuration
    default_period_duration: number;    // in minutes (e.g., 45)
    gap_between_periods: number;        // in minutes (e.g., 5)

    // Break Configuration
    breaks: BreakConfig[];

    // Working Days
    working_days: DayOfWeek[];          // ["Monday", "Tuesday", ...]

    // Metadata
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface BreakConfig {
    id: number;
    name: string;                       // "Short Break", "Lunch Break"
    start_time: string;                 // "10:30"
    duration: number;                   // in minutes
    applies_to: 'all' | 'specific';     // all batches or specific
    batch_ids?: number[];               // if specific
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
```

### 1.2 Standard-wise Lecture Configuration

```typescript
export interface StandardLectureConfig {
    id: number;
    institute_id: number;
    branch_id: number;
    academic_year_id: number;
    standard_id: number;

    // Total periods per day for this standard
    periods_per_day: number;            // e.g., 8

    // Subject-wise lecture allocation
    subject_allocations: SubjectAllocation[];

    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface SubjectAllocation {
    subject_id: number;
    subject_name?: string;              // for display (populated from join)
    lectures_per_week: number;          // e.g., 6 for Math, 4 for English

    // Constraints (optional)
    preferred_slots?: PreferredSlot[];  // "morning", "afternoon", specific periods
    max_consecutive_periods: number;    // Max back-to-back periods (default: 2)
    min_gap_between_periods: number;    // Min periods gap if same subject repeats in day
    requires_lab: boolean;              // Needs lab room (for double periods)
    lab_duration_periods: number;       // How many periods for lab (e.g., 2)
}

export type PreferredSlot = 'morning' | 'mid-day' | 'afternoon' | number; // number = specific period
```

### 1.3 Teacher Availability (for algorithm)

```typescript
export interface TeacherAvailability {
    id: number;
    teacher_id: number;
    day_of_week: DayOfWeek;
    available_from: string;             // "08:00"
    available_until: string;            // "14:00"
    unavailable_periods?: number[];     // specific period numbers they can't teach
    max_periods_per_day: number;        // workload limit
    preferred_subjects?: number[];      // subject IDs they prefer
}
```

### 1.4 Generated Period Slots (computed)

```typescript
export interface PeriodSlot {
    period_number: number;              // 1, 2, 3...
    start_time: string;                 // "08:00"
    end_time: string;                   // "08:45"
    is_break: boolean;
    break_name?: string;                // "Short Break"
}

export interface GeneratedTimetable {
    id: number;
    batch_id: number;
    academic_year_id: number;
    day_of_week: DayOfWeek;
    period_number: number;
    subject_id: number;
    teacher_id: number;
    room_id?: number;
    is_lab: boolean;
    status: 'active' | 'substituted' | 'cancelled';
}
```

---

## 2. UI Structure - Institute Timing Settings Page

**Route:** `/settings/timing` or `/routine/timing-settings`
**Access:** `['Owner', 'Admin']`
**Parent:** Can be a tab in Settings page OR separate page under Routine

### 2.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Institute Timing Configuration                    [Save Button] │
│  Configure school hours, periods, and breaks                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐   │
│  │ TABS            │  │ CONTENT AREA                        │   │
│  │                 │  │                                     │   │
│  │ ○ School Hours  │  │  (Based on selected tab)            │   │
│  │ ○ Period Setup  │  │                                     │   │
│  │ ○ Breaks        │  │                                     │   │
│  │ ○ Working Days  │  │                                     │   │
│  │                 │  │                                     │   │
│  └─────────────────┘  └─────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ PREVIEW: Generated Period Slots                             ││
│  │ ┌────────┬────────┬────────┬────────┬────────┬────────┐    ││
│  │ │ P1     │ P2     │ Break  │ P3     │ P4     │ Lunch  │... ││
│  │ │ 08:00  │ 08:50  │ 09:40  │ 09:50  │ 10:40  │ 11:30  │    ││
│  │ │ 08:45  │ 09:35  │ 09:50  │ 10:35  │ 11:25  │ 12:00  │    ││
│  │ └────────┴────────┴────────┴────────┴────────┴────────┘    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Tab Contents

#### Tab 1: School Hours
```
┌─────────────────────────────────────────────┐
│  School Start Time      School End Time     │
│  ┌─────────────┐       ┌─────────────┐     │
│  │ 08:00      ▼│       │ 14:00      ▼│     │
│  └─────────────┘       └─────────────┘     │
│                                             │
│  Total School Hours: 6 hours                │
└─────────────────────────────────────────────┘
```

#### Tab 2: Period Setup
```
┌─────────────────────────────────────────────┐
│  Period Duration (minutes)                   │
│  ┌─────────────┐                            │
│  │ 45         ▼│  [30, 35, 40, 45, 50, 60]  │
│  └─────────────┘                            │
│                                             │
│  Gap Between Periods (minutes)              │
│  ┌─────────────┐                            │
│  │ 5          ▼│  [0, 5, 10]                │
│  └─────────────┘                            │
│                                             │
│  Calculated Periods: 7 periods/day          │
└─────────────────────────────────────────────┘
```

#### Tab 3: Breaks Configuration
```
┌─────────────────────────────────────────────────────────────┐
│  Breaks                                      [+ Add Break]  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☕ Short Break    │ After Period: 2  │ 10 mins │ [✎][🗑]│
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🍽️ Lunch Break    │ After Period: 4  │ 30 mins │ [✎][🗑]│
│  ├─────────────────────────────────────────────────────┤   │
│  │ ☕ Short Break    │ After Period: 6  │ 10 mins │ [✎][🗑]│
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Tab 4: Working Days
```
┌─────────────────────────────────────────────┐
│  Select Working Days                        │
│                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ Mon │ │ Tue │ │ Wed │ │ Thu │ │ Fri │  │
│  │  ✓  │ │  ✓  │ │  ✓  │ │  ✓  │ │  ✓  │  │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │
│                                             │
│  ┌─────┐ ┌─────┐                           │
│  │ Sat │ │ Sun │                           │
│  │  ✓  │ │     │  (Saturday: Half day?)    │
│  └─────┘ └─────┘                           │
│                                             │
│  Working Days: 6 days/week                  │
└─────────────────────────────────────────────┘
```

---

## 3. UI Structure - Lecture Configuration Page

**Route:** `/academic/lecture-config` or tab in Academic page
**Access:** `['Owner', 'Admin']`

### 3.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Lecture Configuration                                          │
│  Configure lectures per subject for each standard               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Select Standard: ┌──────────────────────┐                      │
│                   │ 10th Standard       ▼│                      │
│                   └──────────────────────┘                      │
│                                                                  │
│  Periods Per Day: ┌───────┐                                     │
│                   │ 8    ▼│                                     │
│                   └───────┘                                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Subject Allocation                           [+ Add Subject]││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Subject      │ Lectures/Week │ Max Consec. │ Lab? │ Actions ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Mathematics  │ ┌───┐ 6      │ ┌───┐ 2     │  ☐   │ [✎][🗑] ││
│  │              │ └───┘        │ └───┘       │      │         ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Science      │ ┌───┐ 5      │ ┌───┐ 2     │  ☑   │ [✎][🗑] ││
│  │              │ └───┘        │ └───┘       │ 2 per│         ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ English      │ ┌───┐ 5      │ ┌───┐ 2     │  ☐   │ [✎][🗑] ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Social Sci.  │ ┌───┐ 4      │ ┌───┐ 2     │  ☐   │ [✎][🗑] ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Gujarati     │ ┌───┐ 4      │ ┌───┐ 2     │  ☐   │ [✎][🗑] ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Hindi        │ ┌───┐ 3      │ ┌───┐ 1     │  ☐   │ [✎][🗑] ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ PT/Sports    │ ┌───┐ 3      │ ┌───┐ 1     │  ☐   │ [✎][🗑] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Summary                                                     ││
│  │ Total Lectures/Week: 30  │  Available Slots: 48 (8×6 days) ││
│  │ Remaining Slots: 18 (Free periods / Assembly / Activities)  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│                                              [Save Configuration]│
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Timetable Generation Algorithm

### 4.1 Algorithm Overview

The algorithm uses a **Constraint Satisfaction Problem (CSP)** approach with **backtracking** and **heuristics** for optimization.

### 4.2 Input Data Required

```typescript
interface TimetableGenerationInput {
    timing_settings: InstituteTimingSettings;
    standard_config: StandardLectureConfig;
    batches: Batch[];                   // batches for this standard
    teachers: Teacher[];                // available teachers
    teacher_availability: TeacherAvailability[];
    subject_teacher_mapping: SubjectTeacherMap[];  // which teacher teaches which subject
    rooms?: Room[];                     // optional room constraints
}

interface SubjectTeacherMap {
    subject_id: number;
    teacher_id: number;
    batch_ids: number[];               // which batches this teacher handles
}
```

### 4.3 Constraints (Hard - Must Satisfy)

1. **No Teacher Conflict:** A teacher cannot be in two places at the same time
2. **No Batch Conflict:** A batch cannot have two subjects at the same time
3. **Teacher Availability:** Teacher must be available during assigned period
4. **Lecture Count:** Total lectures for each subject must match `lectures_per_week`
5. **Period Bounds:** All classes within school hours
6. **No Room Conflict:** (If rooms enabled) A room cannot host two classes simultaneously

### 4.4 Constraints (Soft - Optimize)

1. **Subject Distribution:** Spread subject across week (not all Math on Monday)
2. **Max Consecutive:** Don't exceed `max_consecutive_periods` for same subject
3. **Preferred Slots:** Honor `preferred_slots` (Math in morning, PT in afternoon)
4. **Teacher Workload:** Balance teacher periods per day
5. **Hard Subjects First:** Schedule difficult subjects (Math, Science) in morning
6. **Lab Scheduling:** Schedule lab periods together (double period)

### 4.5 Algorithm Pseudocode

```
FUNCTION generateTimetable(input: TimetableGenerationInput) -> Timetable[]

    // Step 1: Initialize empty timetable grid
    grid = createEmptyGrid(days, periods, batches)

    // Step 2: Calculate total slots needed per subject
    slots_needed = calculateSlotsPerSubject(input.standard_config)

    // Step 3: Sort subjects by difficulty (harder to schedule first)
    sorted_subjects = sortBySchedulingDifficulty(slots_needed)
    // Priority: Lab subjects > Most lectures > Fewer teachers available

    // Step 4: For each batch, schedule subjects
    FOR each batch IN input.batches:

        // Step 4a: Schedule lab periods first (need consecutive slots)
        FOR each lab_subject IN getLabSubjects(sorted_subjects):
            scheduleLabPeriods(grid, batch, lab_subject, input)

        // Step 4b: Schedule remaining subjects
        FOR each subject IN sorted_subjects:
            remaining = slots_needed[subject] - alreadyScheduled(grid, batch, subject)

            WHILE remaining > 0:
                // Find best slot using heuristics
                slot = findBestSlot(grid, batch, subject, input)

                IF slot IS NULL:
                    // Backtrack: try different arrangement
                    success = backtrack(grid, batch, subject)
                    IF NOT success:
                        RETURN error("Cannot generate valid timetable")

                assignSlot(grid, slot, batch, subject, teacher)
                remaining--

    // Step 5: Validate and optimize
    validateTimetable(grid)
    optimizeTimetable(grid)  // Swap slots to improve soft constraints

    RETURN convertToTimetableEntries(grid)

END FUNCTION


FUNCTION findBestSlot(grid, batch, subject, input) -> Slot

    available_slots = getEmptySlots(grid, batch)

    // Filter by hard constraints
    valid_slots = available_slots.filter(slot =>
        hasAvailableTeacher(slot, subject, input) AND
        respectsMaxConsecutive(grid, slot, subject) AND
        notInBreakTime(slot, input.timing_settings)
    )

    // Score by soft constraints
    scored_slots = valid_slots.map(slot => {
        score = 0

        // Prefer morning for hard subjects
        IF isHardSubject(subject) AND isMorningSlot(slot):
            score += 10

        // Prefer even distribution across week
        IF dayHasFewerOfSubject(grid, slot.day, subject):
            score += 8

        // Honor preferred slots
        IF matchesPreferredSlot(slot, subject.preferred_slots):
            score += 5

        // Balance teacher workload
        IF teacherHasLightDay(slot.day, teacher):
            score += 3

        RETURN { slot, score }
    })

    // Return highest scoring slot
    RETURN scored_slots.sortByScore().first()

END FUNCTION
```

### 4.6 Algorithm Complexity

- **Time Complexity:** O(B × S × D × P) where:
  - B = number of batches
  - S = number of subjects
  - D = number of days
  - P = number of periods

- **With backtracking:** Worst case exponential, but heuristics keep it practical

### 4.7 Output Format

```typescript
interface GeneratedTimetableResult {
    success: boolean;
    timetable: GeneratedTimetable[];
    warnings: string[];                 // soft constraints that couldn't be met
    statistics: {
        total_periods_scheduled: number;
        teacher_workload: { [teacher_id: number]: number };
        subject_distribution: { [subject_id: number]: DayDistribution };
    };
}
```

---

## 5. Reusable Components from Existing Codebase

### From SettingsPage.tsx
- Tab navigation pattern (sidebar tabs with content area)
- Form input styling (rounded-xl, border-2, focus states)
- Save button with loading state
- Success message toast pattern
- Toggle switch component (`NotificationToggle`)

### From AcademicPage.tsx
- Card-based tab selector (colored cards with icons)
- Data grid/list pattern
- Empty state component
- Modal form pattern (`AcademicForm`)
- Status badges

### Shared Patterns
- `MainLayout` wrapper
- `useMockQuery` for data fetching
- `useAuthStore` for user context
- `cn()` utility for conditional classes
- Dark mode compatible styling

---

## 6. API Endpoints (for Backend)

```typescript
// Timing Settings
GET    /api/v1/timing-settings?branch_id={id}
POST   /api/v1/timing-settings
PUT    /api/v1/timing-settings/{id}

// Lecture Configuration
GET    /api/v1/lecture-config?standard_id={id}&academic_year_id={id}
POST   /api/v1/lecture-config
PUT    /api/v1/lecture-config/{id}

// Timetable Generation
POST   /api/v1/timetable/generate
{
    batch_ids: number[],
    academic_year_id: number,
    force_regenerate: boolean
}

GET    /api/v1/timetable/validate?batch_id={id}
POST   /api/v1/timetable/optimize
```

---

## 7. Mock Data Structure

Add to `mock-data.json`:

```json
{
    "timing_settings": [
        {
            "id": 1,
            "institute_id": 1,
            "branch_id": 1,
            "school_start_time": "08:00",
            "school_end_time": "14:00",
            "default_period_duration": 45,
            "gap_between_periods": 5,
            "breaks": [
                { "id": 1, "name": "Short Break", "after_period": 2, "duration": 10 },
                { "id": 2, "name": "Lunch Break", "after_period": 4, "duration": 30 },
                { "id": 3, "name": "Short Break", "after_period": 6, "duration": 10 }
            ],
            "working_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "status": "active"
        }
    ],
    "lecture_configs": [
        {
            "id": 1,
            "institute_id": 1,
            "branch_id": 1,
            "academic_year_id": 1,
            "standard_id": 1,
            "periods_per_day": 8,
            "subject_allocations": [
                { "subject_id": 1, "lectures_per_week": 6, "max_consecutive_periods": 2, "requires_lab": false },
                { "subject_id": 2, "lectures_per_week": 5, "max_consecutive_periods": 2, "requires_lab": true, "lab_duration_periods": 2 },
                { "subject_id": 3, "lectures_per_week": 5, "max_consecutive_periods": 2, "requires_lab": false }
            ],
            "status": "active"
        }
    ]
}
```

---

## 8. Implementation Phases

### Phase 1: Data Models & Types (Low tokens)
- Create `src/types/timing.ts` with all interfaces
- Update mock data schema

### Phase 2: Institute Timing Settings UI (Medium tokens)
- Create `TimingSettingsPage.tsx`
- Reuse SettingsPage tab pattern
- Add route and navigation

### Phase 3: Lecture Configuration UI (Medium tokens)
- Create `LectureConfigPage.tsx` or add tab to AcademicPage
- Reuse AcademicPage patterns

### Phase 4: Algorithm Implementation (High tokens)
- Create `src/utils/timetable-generator.ts`
- Implement CSP algorithm with backtracking

### Phase 5: Integration (Medium tokens)
- Update TimetablePage to use dynamic settings
- Add "Generate Timetable" button
- Show generation results

---

## 9. File Structure

```
src/
├── types/
│   └── timing.ts                    # NEW: All timing interfaces
├── modules/
│   ├── settings/
│   │   └── TimingSettingsPage.tsx   # NEW: Timing configuration
│   └── academic/
│       └── LectureConfigPage.tsx    # NEW: Lecture allocation
├── services/api/
│   └── timingApi.ts                 # NEW: API service
├── utils/
│   └── timetable-generator.ts       # NEW: Generation algorithm
└── hooks/
    └── use-timing.ts                # NEW: Custom hooks
```

---

**Document Version:** 1.0
**Ready for Implementation:** Yes
