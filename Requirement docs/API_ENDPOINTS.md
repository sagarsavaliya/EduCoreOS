# EduCoreOS API Endpoints Documentation

**Version:** 1.0.0
**Base URL:** `https://api.educoreos.com/v1`
**Authentication:** Bearer Token (JWT)

---

## Table of Contents
1. [Authentication](#authentication)
2. [Institute & Branch Management](#institute--branch-management)
3. [Academic Context](#academic-context)
4. [People Management](#people-management)
5. [Routine & Scheduling](#routine--scheduling)
6. [Attendance](#attendance)
7. [Assessments](#assessments)
8. [Finance](#finance)
9. [Communication](#communication)
10. [HR & Payroll](#hr--payroll)
11. [Audit & Reports](#audit--reports)

---

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "SecurePass123!",
  "institute_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Rajesh Patel",
      "email": "owner@example.com",
      "role": "Owner",
      "institute_id": 1,
      "branches": [1, 2, 3]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2026-01-13T10:30:00Z"
  }
}
```

---

## Institute & Branch Management

### Get Institute Details
```http
GET /institutes/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Bright Future Tuition Classes",
    "type": "tuition",
    "logo_url": "https://cdn.educoreos.com/institutes/1/logo.png",
    "primary_color": "#4F46E5",
    "branches": [
      {
        "id": 1,
        "name": "Satellite Branch",
        "status": "active",
        "address": "Plot 15, Satellite Road, Ahmedabad",
        "phone": "+91 79 2630 5555",
        "capacity_max_students": 200
      }
    ],
    "created_at": "2024-06-15T09:00:00Z"
  }
}
```

### List All Branches
```http
GET /branches?institute_id=1&status=active
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "institute_id": 1,
      "name": "Satellite Branch",
      "address": "Plot 15, Satellite Road, Ahmedabad",
      "contact_person": "Mehul Shah",
      "phone": "+91 79 2630 5555",
      "email": "satellite@brightfuture.com",
      "status": "active",
      "capacity_max_students": 200,
      "current_students": 145,
      "opening_date": "2024-06-15"
    },
    {
      "id": 2,
      "institute_id": 1,
      "name": "Maninagar Branch",
      "address": "Shop 12, Maninagar Cross Road",
      "contact_person": "Priya Desai",
      "phone": "+91 79 2546 7890",
      "email": "maninagar@brightfuture.com",
      "status": "active",
      "capacity_max_students": 150,
      "current_students": 98,
      "opening_date": "2024-08-01"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "per_page": 20
  }
}
```

### Create Branch
```http
POST /branches
Authorization: Bearer {token}
Content-Type: application/json

{
  "institute_id": 1,
  "name": "Vastrapur Branch",
  "address": "15, Vastrapur Lake Road, Ahmedabad",
  "contact_person": "Amit Patel",
  "phone": "+91 79 2630 9999",
  "email": "vastrapur@brightfuture.com",
  "capacity_max_students": 180
}
```

**Response:**
```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "id": 3,
    "institute_id": 1,
    "name": "Vastrapur Branch",
    "status": "active",
    "created_at": "2026-01-12T14:30:00Z"
  }
}
```

---

## Academic Context

### List Academic Years
```http
GET /academic-years?branch_id=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "institute_id": 1,
      "branch_id": 1,
      "display_name": "2025-26",
      "start_date": "2025-06-01",
      "end_date": "2026-05-31",
      "is_active": true,
      "is_locked": false
    },
    {
      "id": 2,
      "institute_id": 1,
      "branch_id": 1,
      "display_name": "2024-25",
      "start_date": "2024-06-01",
      "end_date": "2025-05-31",
      "is_active": false,
      "is_locked": true
    }
  ]
}
```

### Get Mediums
```http
GET /mediums?branch_id=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "institute_id": 1,
      "branch_id": 1,
      "name": "Gujarati"
    },
    {
      "id": 2,
      "institute_id": 1,
      "branch_id": 1,
      "name": "English"
    }
  ]
}
```

### Get Standards
```http
GET /standards?branch_id=1&medium_id=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "institute_id": 1,
      "branch_id": 1,
      "name": "8th",
      "subjects": [
        { "id": 1, "name": "Mathematics" },
        { "id": 2, "name": "Science" },
        { "id": 3, "name": "Social Science" },
        { "id": 4, "name": "Gujarati" },
        { "id": 5, "name": "English" }
      ]
    },
    {
      "id": 2,
      "institute_id": 1,
      "branch_id": 1,
      "name": "9th",
      "subjects": [
        { "id": 6, "name": "Mathematics" },
        { "id": 7, "name": "Science" },
        { "id": 8, "name": "Social Science" }
      ]
    }
  ]
}
```

### Get Shifts
```http
GET /shifts?branch_id=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "institute_id": 1,
      "branch_id": 1,
      "name": "Morning",
      "start_time": "08:00:00",
      "end_time": "12:00:00",
      "is_active": true
    },
    {
      "id": 2,
      "institute_id": 1,
      "branch_id": 1,
      "name": "Evening",
      "start_time": "16:00:00",
      "end_time": "20:00:00",
      "is_active": true
    }
  ]
}
```

### Get Academic Calendar
```http
GET /academic-calendar?branch_id=1&academic_year_id=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "institute_id": 1,
      "branch_id": 1,
      "academic_year_id": 1,
      "event_type": "holiday",
      "title": "Diwali Vacation",
      "start_date": "2025-11-01",
      "end_date": "2025-11-05",
      "is_attendance_exempted": true
    },
    {
      "id": 2,
      "institute_id": 1,
      "branch_id": 1,
      "academic_year_id": 1,
      "event_type": "exam",
      "title": "First Term Examination",
      "start_date": "2025-09-15",
      "end_date": "2025-09-25",
      "is_attendance_exempted": false
    }
  ]
}
```

---

## People Management

### List Students
```http
GET /students?branch_id=1&standard_id=1&status=active&page=1&limit=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "institute_id": 1,
      "branch_id": 1,
      "admission_no": "BF2025001",
      "name": "Rahul Sharma",
      "standard_id": 1,
      "standard_name": "8th",
      "medium_id": 1,
      "medium_name": "Gujarati",
      "status": "active",
      "batches": [
        {
          "id": 1,
          "name": "8th Gujarati - Morning Batch A",
          "shift": "Morning"
        }
      ],
      "parents": [
        {
          "id": 1,
          "name": "Vikram Sharma",
          "relationship_type": "father",
          "is_primary_contact": true,
          "phone": "+91 98250 12345"
        }
      ],
      "created_at": "2025-06-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 145,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  }
}
```

### Get Student Details
```http
GET /students/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "institute_id": 1,
    "branch_id": 1,
    "admission_no": "BF2025001",
    "name": "Rahul Sharma",
    "standard_id": 1,
    "standard_name": "8th",
    "medium_id": 1,
    "medium_name": "Gujarati",
    "status": "active",
    "batches": [
      {
        "id": 1,
        "name": "8th Gujarati - Morning Batch A",
        "shift": "Morning"
      }
    ],
    "parents": [
      {
        "id": 1,
        "parent_id": 1,
        "name": "Vikram Sharma",
        "relationship_type": "father",
        "is_primary_contact": true,
        "is_emergency_contact": true,
        "phone": "+91 98250 12345",
        "email": "vikram.sharma@email.com",
        "can_view_fees": true,
        "can_view_attendance": true,
        "can_view_marks": true
      },
      {
        "id": 2,
        "parent_id": 2,
        "name": "Priya Sharma",
        "relationship_type": "mother",
        "is_primary_contact": false,
        "is_emergency_contact": true,
        "phone": "+91 98250 12346",
        "email": "priya.sharma@email.com",
        "can_view_fees": true,
        "can_view_attendance": true,
        "can_view_marks": true
      }
    ],
    "fees": {
      "total_fees": 25000.00,
      "paid_amount": 15000.00,
      "discount": 0.00,
      "balance": 10000.00
    },
    "attendance_summary": {
      "total_classes": 120,
      "present": 108,
      "absent": 8,
      "late": 4,
      "attendance_percentage": 90.0
    },
    "created_at": "2025-06-15T10:00:00Z"
  }
}
```

### Create Student
```http
POST /students
Authorization: Bearer {token}
Content-Type: application/json

{
  "institute_id": 1,
  "branch_id": 1,
  "name": "Priya Patel",
  "standard_id": 1,
  "medium_id": 1,
  "admission_no": "BF2025150"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student admitted successfully",
  "data": {
    "id": 150,
    "admission_no": "BF2025150",
    "name": "Priya Patel",
    "status": "active",
    "created_at": "2026-01-12T15:00:00Z"
  }
}
```

### List Teachers
```http
GET /teachers?branch_id=1&is_active=true
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "institute_id": 1,
      "name": "Kirti Desai",
      "email": "kirti.desai@brightfuture.com",
      "phone": "+91 98250 98765",
      "expertise": ["Mathematics", "Science"],
      "salary_base": 35000.00,
      "is_active": true,
      "assigned_batches": [
        {
          "batch_id": 1,
          "batch_name": "8th Gujarati - Morning Batch A",
          "subject": "Mathematics"
        },
        {
          "batch_id": 2,
          "batch_name": "9th Gujarati - Morning Batch A",
          "subject": "Mathematics"
        }
      ],
      "weekly_hours": 24,
      "created_at": "2024-06-10T09:00:00Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "per_page": 20
  }
}
```

### Get Teacher Availability
```http
GET /teachers/1/availability
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher_id": 1,
    "teacher_name": "Kirti Desai",
    "availability": [
      {
        "day_of_week": 1,
        "day_name": "Monday",
        "available_from": "08:00:00",
        "available_to": "20:00:00",
        "is_active": true
      },
      {
        "day_of_week": 2,
        "day_name": "Tuesday",
        "available_from": "08:00:00",
        "available_to": "20:00:00",
        "is_active": true
      }
    ],
    "unavailability": [
      {
        "unavailable_date": "2026-01-20",
        "from_time": null,
        "to_time": null,
        "reason": "Medical appointment"
      }
    ],
    "workload_constraints": {
      "max_weekly_hours": 40,
      "max_daily_hours": 8,
      "max_consecutive_hours": 3,
      "min_break_minutes": 15,
      "current_weekly_hours": 24
    }
  }
}
```

---

## Routine & Scheduling

### List Batches
```http
GET /batches?branch_id=1&standard_id=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "institute_id": 1,
      "branch_id": 1,
      "standard_id": 1,
      "standard_name": "8th",
      "medium_id": 1,
      "medium_name": "Gujarati",
      "name": "8th Gujarati - Morning Batch A",
      "shift": "Morning",
      "student_count": 28,
      "teachers": [
        {
          "teacher_id": 1,
          "teacher_name": "Kirti Desai",
          "subject_id": 1,
          "subject_name": "Mathematics"
        },
        {
          "teacher_id": 2,
          "teacher_name": "Prakash Mehta",
          "subject_id": 2,
          "subject_name": "Science"
        }
      ],
      "created_at": "2025-06-01T10:00:00Z"
    }
  ]
}
```

### Get Timetable
```http
GET /timetables?batch_id=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "batch_id": 1,
      "batch_name": "8th Gujarati - Morning Batch A",
      "teacher_id": 1,
      "teacher_name": "Kirti Desai",
      "subject_id": 1,
      "subject_name": "Mathematics",
      "day_of_week": 1,
      "day_name": "Monday",
      "start_time": "08:00:00",
      "end_time": "09:30:00"
    },
    {
      "id": 2,
      "batch_id": 1,
      "batch_name": "8th Gujarati - Morning Batch A",
      "teacher_id": 2,
      "teacher_name": "Prakash Mehta",
      "subject_id": 2,
      "subject_name": "Science",
      "day_of_week": 1,
      "day_name": "Monday",
      "start_time": "09:45:00",
      "end_time": "11:15:00"
    }
  ]
}
```

### Create Timetable Entry
```http
POST /timetables
Authorization: Bearer {token}
Content-Type: application/json

{
  "batch_id": 1,
  "teacher_id": 1,
  "subject_id": 1,
  "day_of_week": 1,
  "start_time": "08:00:00",
  "end_time": "09:30:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Timetable entry created successfully",
  "data": {
    "id": 15,
    "batch_id": 1,
    "conflicts": [],
    "created_at": "2026-01-12T16:00:00Z"
  }
}
```

### Get Timetable Conflicts
```http
GET /timetables/conflicts?branch_id=1&resolved=false
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "conflict_type": "teacher_overlap",
      "entity_id": 1,
      "entity_name": "Kirti Desai",
      "timetable_1": {
        "id": 5,
        "batch_name": "8th Gujarati - Morning Batch A",
        "day": "Monday",
        "time": "08:00 - 09:30"
      },
      "timetable_2": {
        "id": 12,
        "batch_name": "9th Gujarati - Morning Batch B",
        "day": "Monday",
        "time": "08:30 - 10:00"
      },
      "detected_at": "2026-01-10T14:30:00Z",
      "resolved_at": null,
      "resolution_note": null
    }
  ]
}
```

### Create Substitution
```http
POST /timetables/substitutions
Authorization: Bearer {token}
Content-Type: application/json

{
  "timetable_id": 5,
  "original_teacher_id": 1,
  "substitute_teacher_id": 3,
  "substitution_date": "2026-01-20",
  "reason": "Original teacher on medical leave"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Substitution created successfully",
  "data": {
    "id": 1,
    "timetable_id": 5,
    "substitute_teacher_name": "Nita Shah",
    "substitution_date": "2026-01-20",
    "notification_sent": true,
    "created_at": "2026-01-12T16:30:00Z"
  }
}
```

---

## Attendance

### Mark Attendance
```http
POST /attendance/mark
Authorization: Bearer {token}
Content-Type: application/json

{
  "batch_id": 1,
  "date": "2026-01-12",
  "attendance": [
    {
      "student_id": 1,
      "status": "P"
    },
    {
      "student_id": 2,
      "status": "A"
    },
    {
      "student_id": 3,
      "status": "L",
      "late_entry_time": "08:15:00",
      "late_entry_justification": "Transportation delay"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked for 28 students",
  "data": {
    "batch_id": 1,
    "date": "2026-01-12",
    "marked_by": 1,
    "marked_at": "2026-01-12T08:30:00Z",
    "summary": {
      "present": 25,
      "absent": 2,
      "late": 1,
      "total": 28
    }
  }
}
```

### Get Attendance
```http
GET /attendance?batch_id=1&date=2026-01-12
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batch_id": 1,
    "batch_name": "8th Gujarati - Morning Batch A",
    "date": "2026-01-12",
    "attendance": [
      {
        "id": 1,
        "student_id": 1,
        "student_name": "Rahul Sharma",
        "admission_no": "BF2025001",
        "status": "P",
        "is_locked": false,
        "marked_by": "Kirti Desai",
        "marked_at": "2026-01-12T08:30:00Z"
      },
      {
        "id": 2,
        "student_id": 2,
        "student_name": "Amit Patel",
        "admission_no": "BF2025002",
        "status": "A",
        "is_locked": false,
        "marked_by": "Kirti Desai",
        "marked_at": "2026-01-12T08:30:00Z"
      }
    ],
    "summary": {
      "present": 25,
      "absent": 2,
      "late": 1,
      "total": 28
    }
  }
}
```

### Edit Attendance
```http
PUT /attendance/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "P",
  "reason": "Student arrived late but within grace period"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "id": 1,
    "old_status": "A",
    "new_status": "P",
    "updated_by": "Mehul Shah (Admin)",
    "updated_at": "2026-01-12T14:00:00Z",
    "reason": "Student arrived late but within grace period",
    "audit_log_created": true
  }
}
```

### Get Attendance Summary
```http
GET /attendance/summary?student_id=1&from_date=2025-06-01&to_date=2026-01-12
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student_id": 1,
    "student_name": "Rahul Sharma",
    "period": {
      "from": "2025-06-01",
      "to": "2026-01-12"
    },
    "summary": {
      "total_classes": 120,
      "present": 108,
      "absent": 8,
      "late": 4,
      "attendance_percentage": 90.0
    },
    "monthly_breakdown": [
      {
        "month": "2025-06",
        "present": 18,
        "absent": 1,
        "late": 1,
        "percentage": 90.0
      }
    ]
  }
}
```

---

## Assessments

### List Tests
```http
GET /tests?batch_id=1&from_date=2025-06-01
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "batch_id": 1,
      "batch_name": "8th Gujarati - Morning Batch A",
      "subject_id": 1,
      "subject_name": "Mathematics",
      "title": "Unit Test 1 - Algebra",
      "max_marks": 50,
      "test_date": "2025-07-15",
      "marks_entered": 28,
      "total_students": 28,
      "is_published": true,
      "published_at": "2025-07-18T10:00:00Z",
      "created_at": "2025-07-10T09:00:00Z"
    }
  ]
}
```

### Create Test
```http
POST /tests
Authorization: Bearer {token}
Content-Type: application/json

{
  "batch_id": 1,
  "subject_id": 1,
  "title": "Mid-Term Exam - Geometry",
  "max_marks": 100,
  "test_date": "2026-01-25"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test created successfully",
  "data": {
    "id": 15,
    "batch_id": 1,
    "title": "Mid-Term Exam - Geometry",
    "test_date": "2026-01-25",
    "created_at": "2026-01-12T17:00:00Z"
  }
}
```

### Enter Marks
```http
POST /marks
Authorization: Bearer {token}
Content-Type: application/json

{
  "test_id": 15,
  "marks": [
    {
      "student_id": 1,
      "marks_obtained": 45,
      "status": "present",
      "teacher_remarks": "Good performance"
    },
    {
      "student_id": 2,
      "marks_obtained": 0,
      "status": "absent",
      "teacher_remarks": null
    }
  ],
  "is_final": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Marks entered for 28 students",
  "data": {
    "test_id": 15,
    "marks_entered": 28,
    "finalized": true,
    "statistics": {
      "highest": 48,
      "lowest": 22,
      "average": 38.5,
      "pass_count": 26,
      "fail_count": 0,
      "absent_count": 2
    }
  }
}
```

### Get Student Performance
```http
GET /students/1/performance?academic_year_id=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student_id": 1,
    "student_name": "Rahul Sharma",
    "academic_year": "2025-26",
    "subjects": [
      {
        "subject_id": 1,
        "subject_name": "Mathematics",
        "tests": [
          {
            "test_id": 1,
            "title": "Unit Test 1 - Algebra",
            "max_marks": 50,
            "marks_obtained": 45,
            "percentage": 90.0,
            "grade": "A",
            "test_date": "2025-07-15"
          }
        ],
        "average_percentage": 88.5,
        "overall_grade": "A"
      }
    ],
    "overall_performance": {
      "total_tests": 8,
      "average_percentage": 85.2,
      "rank": 3,
      "out_of": 28
    }
  }
}
```

### Publish Test Results
```http
POST /tests/15/publish
Authorization: Bearer {token}
Content-Type: application/json

{
  "visible_to_students_at": "2026-01-28T10:00:00Z",
  "visible_to_parents_at": "2026-01-28T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test results published successfully",
  "data": {
    "test_id": 15,
    "published_at": "2026-01-12T17:30:00Z",
    "notifications_sent": 56,
    "visible_from": "2026-01-28T10:00:00Z"
  }
}
```

---

## Finance

### Get Fee Structure
```http
GET /fee-structures?branch_id=1&standard_id=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "institute_id": 1,
      "branch_id": 1,
      "standard_id": 1,
      "standard_name": "8th",
      "total_amount": 25000.00,
      "installment_plan": [
        {
          "installment_number": 1,
          "due_date": "2025-06-15",
          "amount": 10000.00
        },
        {
          "installment_number": 2,
          "due_date": "2025-09-15",
          "amount": 7500.00
        },
        {
          "installment_number": 3,
          "due_date": "2025-12-15",
          "amount": 7500.00
        }
      ],
      "created_at": "2025-05-01T10:00:00Z"
    }
  ]
}
```

### Get Student Ledger
```http
GET /students/1/ledger
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student_id": 1,
    "student_name": "Rahul Sharma",
    "admission_no": "BF2025001",
    "ledger": {
      "total_fees": 25000.00,
      "paid_amount": 15000.00,
      "discount": 0.00,
      "balance": 10000.00
    },
    "installments": [
      {
        "id": 1,
        "installment_number": 1,
        "due_date": "2025-06-15",
        "amount_due": 10000.00,
        "amount_paid": 10000.00,
        "paid_date": "2025-06-10",
        "status": "paid",
        "aging_bucket": "0-30"
      },
      {
        "id": 2,
        "installment_number": 2,
        "due_date": "2025-09-15",
        "amount_due": 7500.00,
        "amount_paid": 5000.00,
        "paid_date": "2025-09-20",
        "status": "partial",
        "aging_bucket": "0-30"
      },
      {
        "id": 3,
        "installment_number": 3,
        "due_date": "2025-12-15",
        "amount_due": 7500.00,
        "amount_paid": 0.00,
        "paid_date": null,
        "status": "pending",
        "aging_bucket": "0-30"
      }
    ],
    "payments": [
      {
        "id": 1,
        "amount": 10000.00,
        "method": "UPI",
        "transaction_id": "UPI2025061012345",
        "payment_date": "2025-06-10",
        "receipt_no": "REC/2025/001"
      }
    ]
  }
}
```

### Record Payment
```http
POST /payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "student_id": 1,
  "amount": 7500.00,
  "method": "Cash",
  "transaction_id": null,
  "payment_date": "2026-01-12",
  "installment_allocation": [
    {
      "installment_id": 2,
      "amount": 2500.00
    },
    {
      "installment_id": 3,
      "amount": 5000.00
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "payment_id": 45,
    "receipt_no": "REC/2026/045",
    "student_name": "Rahul Sharma",
    "amount": 7500.00,
    "balance_remaining": 2500.00,
    "payment_date": "2026-01-12",
    "receipt_url": "https://cdn.educoreos.com/receipts/REC-2026-045.pdf"
  }
}
```

### Get Fee Collection Report
```http
GET /finance/reports/collection?branch_id=1&from_date=2026-01-01&to_date=2026-01-12
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2026-01-01",
      "to": "2026-01-12"
    },
    "summary": {
      "total_collected": 125000.00,
      "cash": 45000.00,
      "upi": 65000.00,
      "bank_transfer": 15000.00,
      "total_receipts": 18
    },
    "aging_analysis": {
      "current": 85000.00,
      "30_plus": 25000.00,
      "60_plus": 15000.00,
      "90_plus": 5000.00
    },
    "pending_amount": 130000.00,
    "collection_efficiency": 49.0
  }
}
```

### Apply Discount
```http
POST /students/1/ledger/discount
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 2500.00,
  "reason": "Sibling discount - 10%",
  "approved_by": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Discount applied successfully",
  "data": {
    "adjustment_id": 5,
    "student_id": 1,
    "discount_amount": 2500.00,
    "new_balance": 7500.00,
    "approved_by": "Rajesh Patel (Owner)",
    "created_at": "2026-01-12T18:00:00Z"
  }
}
```

---

## Communication

### Send Announcement
```http
POST /announcements
Authorization: Bearer {token}
Content-Type: application/json

{
  "institute_id": 1,
  "branch_id": 1,
  "target_role": "parent",
  "target_batch_id": 1,
  "title": "Parent-Teacher Meeting",
  "message": "Parent-Teacher meeting scheduled for 25th January 2026 at 5:00 PM. Your presence is highly appreciated."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Announcement created and notifications queued",
  "data": {
    "id": 15,
    "title": "Parent-Teacher Meeting",
    "recipients_count": 56,
    "notifications_queued": 56,
    "created_at": "2026-01-12T18:30:00Z"
  }
}
```

### Get Announcements
```http
GET /announcements?branch_id=1&target_role=parent&limit=10
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "institute_id": 1,
      "branch_id": 1,
      "target_role": "parent",
      "target_batch_id": 1,
      "batch_name": "8th Gujarati - Morning Batch A",
      "title": "Parent-Teacher Meeting",
      "message": "Parent-Teacher meeting scheduled for 25th January 2026 at 5:00 PM.",
      "created_by": "Mehul Shah",
      "created_at": "2026-01-12T18:30:00Z"
    }
  ]
}
```

### Create Assignment
```http
POST /assignments
Authorization: Bearer {token}
Content-Type: application/json

{
  "batch_id": 1,
  "subject_id": 1,
  "title": "Chapter 5 - Algebraic Expressions - Practice Problems",
  "file_url": "https://cdn.educoreos.com/assignments/math-ch5.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assignment created and notifications sent",
  "data": {
    "id": 25,
    "batch_id": 1,
    "title": "Chapter 5 - Algebraic Expressions - Practice Problems",
    "notifications_sent": 56,
    "created_at": "2026-01-12T19:00:00Z"
  }
}
```

### Get Notification Templates
```http
GET /notification-templates?institute_id=1&channel=whatsapp&language=gu
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "template_key": "fee_reminder",
      "template_name": "Fee Payment Reminder",
      "channel": "whatsapp",
      "language": "gu",
      "subject": null,
      "body_template": "નમસ્તે {{parent_name}},\n\n{{student_name}} ({{admission_no}}) માટે ફી ચુકવણી બાકી છે.\nબાકી રકમ: ₹{{balance_amount}}\nતારીખ: {{due_date}}\n\nકૃપા કરીને તાત્કાલિક ચુકવણી કરો.\n\nબ્રાઇટ ફ્યુચર ટ્યુશન ક્લાસીસ",
      "is_active": true
    }
  ]
}
```

---

## HR & Payroll

### Get Teacher Attendance
```http
GET /teachers/1/attendance?from_date=2026-01-01&to_date=2026-01-12
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher_id": 1,
    "teacher_name": "Kirti Desai",
    "period": {
      "from": "2026-01-01",
      "to": "2026-01-12"
    },
    "attendance": [
      {
        "date": "2026-01-06",
        "status": "present"
      },
      {
        "date": "2026-01-07",
        "status": "present"
      },
      {
        "date": "2026-01-08",
        "status": "leave"
      }
    ],
    "summary": {
      "working_days": 10,
      "present": 9,
      "leave": 1,
      "attendance_percentage": 90.0
    }
  }
}
```

### Record Salary Payment
```http
POST /salary-payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "teacher_id": 1,
  "amount": 35000.00,
  "payment_date": "2026-01-05",
  "month": "2025-12",
  "payment_method": "Bank Transfer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Salary payment recorded successfully",
  "data": {
    "id": 45,
    "teacher_id": 1,
    "teacher_name": "Kirti Desai",
    "amount": 35000.00,
    "payment_date": "2026-01-05",
    "month": "December 2025",
    "status": "pending_approval"
  }
}
```

### Get Payroll Report
```http
GET /hr/payroll/report?branch_id=1&month=2025-12
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "branch_id": 1,
    "branch_name": "Satellite Branch",
    "month": "December 2025",
    "teachers": [
      {
        "teacher_id": 1,
        "teacher_name": "Kirti Desai",
        "base_salary": 35000.00,
        "substitution_bonus": 1500.00,
        "deductions": 0.00,
        "net_salary": 36500.00,
        "payment_status": "paid",
        "payment_date": "2026-01-05"
      }
    ],
    "summary": {
      "total_teachers": 8,
      "total_payroll": 285000.00,
      "paid_count": 8,
      "pending_count": 0
    }
  }
}
```

---

## Audit & Reports

### Get Audit Logs
```http
GET /audit-logs?entity=student&entity_id=1&from_date=2025-06-01
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1245,
      "user_id": 2,
      "user_name": "Mehul Shah",
      "user_role": "Admin",
      "action": "update",
      "entity": "student",
      "entity_id": 1,
      "old_value": {
        "standard_id": 7,
        "status": "active"
      },
      "new_value": {
        "standard_id": 8,
        "status": "active"
      },
      "created_at": "2025-06-15T11:00:00Z"
    },
    {
      "id": 3456,
      "user_id": 2,
      "user_name": "Mehul Shah",
      "user_role": "Admin",
      "action": "edit_attendance",
      "entity": "attendance",
      "entity_id": 123,
      "old_value": {
        "status": "A"
      },
      "new_value": {
        "status": "P",
        "reason": "Student arrived late but within grace period"
      },
      "created_at": "2026-01-12T14:00:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "per_page": 20
  }
}
```

### Export Data
```http
POST /exports
Authorization: Bearer {token}
Content-Type: application/json

{
  "module": "students",
  "format": "excel",
  "filters": {
    "branch_id": 1,
    "standard_id": 1,
    "status": "active"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Export queued successfully",
  "data": {
    "export_id": 125,
    "status": "processing",
    "estimated_completion": "2026-01-12T19:05:00Z",
    "download_url": null
  }
}
```

### Get Export Status
```http
GET /exports/125
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "export_id": 125,
    "module": "students",
    "format": "excel",
    "status": "completed",
    "download_url": "https://cdn.educoreos.com/exports/students-2026-01-12-125.xlsx",
    "expires_at": "2026-02-11T19:05:00Z",
    "created_at": "2026-01-12T19:00:00Z",
    "completed_at": "2026-01-12T19:03:00Z"
  }
}
```

### Dashboard KPIs (Owner)
```http
GET /dashboard/owner?institute_id=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "institute_id": 1,
    "institute_name": "Bright Future Tuition Classes",
    "as_of": "2026-01-12",
    "overview": {
      "total_branches": 2,
      "active_branches": 2,
      "total_students": 243,
      "total_teachers": 15,
      "total_batches": 12
    },
    "financial": {
      "total_revenue_ytd": 5875000.00,
      "pending_fees": 325000.00,
      "collection_efficiency": 94.7,
      "total_expenses_ytd": 4250000.00,
      "net_profit_ytd": 1625000.00
    },
    "academic": {
      "average_attendance": 88.5,
      "average_performance": 82.3,
      "tests_conducted": 48,
      "students_below_threshold": 12
    },
    "branch_comparison": [
      {
        "branch_id": 1,
        "branch_name": "Satellite Branch",
        "students": 145,
        "revenue": 3625000.00,
        "attendance_rate": 89.2,
        "teacher_utilization": 85.5
      },
      {
        "branch_id": 2,
        "branch_name": "Maninagar Branch",
        "students": 98,
        "revenue": 2250000.00,
        "attendance_rate": 87.5,
        "teacher_utilization": 78.3
      }
    ],
    "alerts": [
      {
        "type": "low_attendance",
        "severity": "medium",
        "message": "Batch 8th Gujarati - Morning Batch B has 75% attendance this week",
        "action_required": "Review with Admin"
      },
      {
        "type": "pending_approvals",
        "severity": "high",
        "message": "3 critical actions pending your approval",
        "action_required": "Review approvals"
      }
    ]
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes:
- `VALIDATION_ERROR` (400) - Invalid input data
- `UNAUTHORIZED` (401) - Invalid or missing authentication token
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Data conflict (e.g., duplicate entry)
- `LOCKED` (423) - Resource is locked (e.g., academic year locked)
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

---

## Rate Limits

- **Standard endpoints:** 100 requests/minute per user
- **Report/Export endpoints:** 10 requests/minute per user
- **Authentication endpoints:** 5 requests/minute per IP

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1736682000
```

---

## Pagination

All list endpoints support pagination with these query parameters:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

Paginated responses include a `meta` object:
```json
{
  "meta": {
    "total": 145,
    "page": 1,
    "per_page": 20,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Filtering & Sorting

Most list endpoints support filtering and sorting:
```http
GET /students?branch_id=1&standard_id=1&status=active&sort=name&order=asc
```

Common filter parameters:
- `branch_id`
- `status`
- `from_date` / `to_date`
- `search` (searches relevant text fields)

Common sort parameters:
- `sort` (field name)
- `order` (asc/desc)

---

**End of Documentation**
