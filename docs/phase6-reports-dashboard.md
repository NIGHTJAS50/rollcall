# Phase 6: Reports & Dashboard

**Project Name:** RollCall
**Date:** 2026-03-11

---

## 6.1 Overview

This phase adds reporting and analytics features:
- Full attendance reports per course (lecturer/admin)
- Excel export using `xlsx`
- PDF export using `jspdf`
- Student attendance history across all courses
- Visual attendance percentage bars with colour-coded status
- At-risk student detection (below 75%)

---

## 6.2 API Routes

### `GET /api/reports/[courseId]`
Returns a full attendance report for a course.

**Response shape:**
```json
{
  "course": { "name", "code", "department", "lecturer" },
  "sessions": [ { "id", "date", "isActive", "records": [...] } ],
  "studentSummary": [
    { "student": {...}, "attended": 8, "total": 10, "percentage": 80 }
  ],
  "totalSessions": 10,
  "totalStudents": 25
}
```

**Access:** Lecturer, Admin only

---

### `GET /api/reports/[courseId]/export?format=excel`
Generates and streams an Excel file (.xlsx).

**Excel structure:**
- Row 1: Headers — Name | Student ID | Email | Session 1 | Session 2 | ... | Attended | Total | Percentage
- Row 2+: One row per student, P = Present, A = Absent per session

**Access:** Lecturer, Admin only

---

## 6.3 Lecturer Reports Page (`/lecturer/reports/[courseId]`)

### Features
| Feature | Description |
|---|---|
| Stats cards | Total sessions, total students, average attendance %, at-risk count |
| Session timeline | Clickable pills showing each session date and present count |
| Student table | Per-student attendance grid (P/A per session) |
| Progress bars | Colour-coded attendance bar (green ≥75%, yellow ≥50%, red <75%) |
| Status badges | Good / Warning / At Risk based on percentage |
| Search | Filter students by name or student ID |
| Sort | Sort by name or attendance percentage |
| Excel export | Downloads `.xlsx` file via browser |
| PDF export | Generates a formatted PDF via `jspdf` client-side |

### Status Colour Coding
| Percentage | Colour | Badge |
|---|---|---|
| ≥ 75% | Green | Good |
| 50–74% | Yellow | Warning |
| < 50% | Red | At Risk |

---

## 6.4 Student Attendance History Page (`/student/attendance`)

### Features
| Feature | Description |
|---|---|
| Overall % | Average attendance across all enrolled courses |
| Enrolled courses | Count of all courses student is in |
| At-risk count | Number of courses with attendance < 75% |
| At-risk warning | Banner listing which course codes are at risk |
| Per-course cards | Clickable — shows code, name, lecturer, sessions attended, progress bar |

---

## 6.5 Lecturer Course Page Update

Added a **"View Full Report →"** link to the course detail page (`/lecturer/course/[id]`), directing to the reports page for that course.

---

## 6.6 PDF Export Implementation

PDF is generated client-side using `jspdf`:
1. Course info header (name, code, department, lecturer, date)
2. Manual table with column headers
3. Alternating row colours (light grey for even rows)
4. Loops through all students and sessions
5. Auto page-break when content exceeds page height
6. Saved as `{COURSE_CODE}-attendance.pdf`

---

## 6.7 Next Steps
- Phase 7: Testing & Deployment — run the app, test all flows, deploy to Vercel + Railway
