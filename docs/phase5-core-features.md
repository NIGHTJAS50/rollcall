# Phase 5: Core Features

**Project Name:** RollCall
**Date:** 2026-03-10

---

## 5.1 Overview

This phase implements all core business logic of the application:
- Route protection via middleware
- Course management (create, list, view)
- Attendance session lifecycle (open, QR generate, close)
- Student attendance marking
- Admin enrollment management
- Role-specific dashboards and pages

---

## 5.2 Middleware (`src/middleware.ts`)

Protects all routes based on authentication and role:

| Condition | Action |
|---|---|
| Not logged in, accessing protected page | Redirect to `/auth/login` |
| Logged in, accessing `/auth/*` | Redirect to role dashboard |
| Student accessing `/lecturer/*` | Redirect to `/auth/login` |
| Lecturer accessing `/student/*` | Redirect to `/auth/login` |
| Admin accessing `/student/*` or `/lecturer/*` | Redirect to `/auth/login` |

---

## 5.3 API Routes

### Courses
| Method | Route | Description |
|---|---|---|
| GET | `/api/courses` | Returns courses filtered by role (own for lecturer, enrolled for student, all for admin) |
| POST | `/api/courses` | Lecturer creates a new course |
| GET | `/api/courses/[id]` | Full course detail with sessions and enrollments |

### Attendance Sessions
| Method | Route | Description |
|---|---|---|
| POST | `/api/sessions` | Lecturer opens a new session (auto-closes existing active session) |
| GET | `/api/sessions/[id]` | Session detail with QR token and attendance records |
| PATCH | `/api/sessions/[id]` | Lecturer closes the session |

### Attendance Records
| Method | Route | Description |
|---|---|---|
| POST | `/api/attendance` | Student marks attendance using a QR token |
| GET | `/api/attendance/[courseId]` | Student: personal records + percentage. Lecturer/Admin: all records |

### Admin
| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Admin creates a user |
| GET | `/api/admin/enrollments` | List all enrollments |
| POST | `/api/admin/enrollments` | Admin enrolls a student into a course |

---

## 5.4 Business Rules Enforced

- A student can only mark attendance **once per session** (unique constraint enforced at DB level)
- A student must be **enrolled** in the course to mark attendance
- QR token must belong to an **active session** (not closed)
- Opening a new session **auto-closes** any existing active session for the same course
- Lecturers can only manage **their own courses**

---

## 5.5 Pages Built

### Shared
- `src/components/shared/Navbar.tsx` — role-aware navigation with sign out

### Student
| Page | Route | Description |
|---|---|---|
| Dashboard | `/student/dashboard` | Lists all enrolled courses |
| Course Detail | `/student/course/[id]` | Attendance summary + session history + mark attendance |

### Lecturer
| Page | Route | Description |
|---|---|---|
| Dashboard | `/lecturer/dashboard` | Lists all courses, create course form |
| Course Detail | `/lecturer/course/[id]` | Stats, session list, open new session button |
| Session View | `/lecturer/session/[id]` | QR code display, live attendance list, close session |

### Admin
| Page | Route | Description |
|---|---|---|
| Dashboard | `/admin/dashboard` | System stats cards + quick links |
| Users | `/admin/users` | Full user table with filter by role, create user form |
| Courses | `/admin/courses` | All courses across university |
| Enrollments | `/admin/enrollments` | All enrollments, enroll student form |

### Landing
| Page | Route | Description |
|---|---|---|
| Home | `/` | Landing page with Sign In / Register links |

---

## 5.6 QR Code Flow

1. Lecturer opens a session → server creates session with a UUID `qrToken`
2. Session page generates a QR code image from the token using the `qrcode` npm package
3. Student scans the QR or copies the token
4. Student submits token via `POST /api/attendance`
5. Server validates: token exists, session is active, student is enrolled, no duplicate
6. Attendance record created with `status: PRESENT`

---

## 5.7 Next Steps
- Phase 6: Reports & Dashboard — attendance summary charts, PDF/Excel export
