# Phase 2: System Design

**Project Name:** RollCall
**Date:** 2026-03-10

---

## 2.1 Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, file-based routing, full-stack in one framework |
| Styling | Tailwind CSS | Utility-first, fast to build responsive UI |
| Backend | Next.js API Routes | No separate server needed, co-located with frontend |
| Database | PostgreSQL | Relational DB, ideal for structured attendance data |
| ORM | Prisma | Type-safe queries, auto-migrations, easy schema management |
| Authentication | NextAuth.js | Built-in session handling, supports role-based access |
| QR Code (generate) | `qrcode` (npm) | Generate QR codes server-side for sessions |
| QR Code (scan) | `html5-qrcode` (npm) | Scan QR codes from the browser camera |
| Reports | `xlsx` + `jspdf` | Export attendance data to Excel and PDF |

---

## 2.2 System Architecture

```
┌─────────────────────────────────────────┐
│              BROWSER (Client)           │
│  Student UI | Lecturer UI | Admin UI    │
└────────────────┬────────────────────────┘
                 │ HTTP / REST
┌────────────────▼────────────────────────┐
│         Next.js App (Server)            │
│  Pages/Components  │  API Routes        │
│  /app/...          │  /api/...          │
└────────────────┬────────────────────────┘
                 │ Prisma ORM
┌────────────────▼────────────────────────┐
│           PostgreSQL Database           │
└─────────────────────────────────────────┘
```

### Flow Summary
1. User visits the web app in a browser
2. Next.js serves pages (SSR or client-side)
3. Actions (mark attendance, open session) call API routes
4. API routes use Prisma to read/write to PostgreSQL
5. NextAuth manages login sessions and role access

---

## 2.3 Database Schema

### Tables

#### User
| Column | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| name | String | Full name |
| email | String | Unique |
| password | String | Hashed (bcrypt) |
| role | Enum | STUDENT, LECTURER, ADMIN |
| studentId | String? | University student ID (students only) |
| createdAt | DateTime | Auto-generated |

#### Course
| Column | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| name | String | Course name |
| code | String | Unique course code (e.g. CS101) |
| department | String | Faculty/department name |
| lecturerId | String (FK) | References User |
| createdAt | DateTime | Auto-generated |

#### Enrollment
| Column | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| studentId | String (FK) | References User |
| courseId | String (FK) | References Course |
| enrolledAt | DateTime | Auto-generated |

#### AttendanceSession
| Column | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| courseId | String (FK) | References Course |
| date | DateTime | Date of the session |
| openedAt | DateTime | When session was opened |
| closedAt | DateTime? | When session was closed (null if still active) |
| qrToken | String | Unique token embedded in QR code |
| isActive | Boolean | True while session is open |

#### AttendanceRecord
| Column | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| studentId | String (FK) | References User |
| sessionId | String (FK) | References AttendanceSession |
| markedAt | DateTime | When student marked attendance |
| status | Enum | PRESENT, ABSENT |

### Entity Relationship Diagram (text)
```
User (LECTURER) ──< Course >──< Enrollment >── User (STUDENT)
                      │
                      ▼
              AttendanceSession
                      │
                      ▼
              AttendanceRecord ──── User (STUDENT)
```

---

## 2.4 UI Pages Map

```
/                            → Landing page (about RollCall)
/auth/login                  → Login page (all roles)
/auth/register               → Register page

-- STUDENT --
/student/dashboard           → My courses + attendance summary
/student/course/[id]         → Course detail + mark attendance button
/student/attendance          → Full attendance history across all courses

-- LECTURER --
/lecturer/dashboard          → Overview of all my courses
/lecturer/course/[id]        → Course detail + list of sessions
/lecturer/session/[id]       → Active session view + QR code display
/lecturer/reports/[courseId] → Attendance report for a course

-- ADMIN --
/admin/dashboard             → System-wide stats
/admin/users                 → Manage all users (CRUD)
/admin/courses               → Manage all courses (CRUD)
/admin/enrollments           → Enroll students into courses
```

---

## 2.5 API Routes

| Method | Route | Description | Role |
|---|---|---|---|
| POST | `/api/auth/[...nextauth]` | Login / logout (NextAuth) | All |
| GET | `/api/courses` | List courses | All |
| POST | `/api/courses` | Create course | Lecturer |
| GET | `/api/courses/[id]` | Get course detail | All |
| POST | `/api/sessions` | Open a new session | Lecturer |
| PATCH | `/api/sessions/[id]` | Close a session | Lecturer |
| GET | `/api/sessions/[id]/qr` | Get QR code for session | Lecturer |
| POST | `/api/attendance` | Mark attendance | Student |
| GET | `/api/attendance/[courseId]` | Get records for a course | Lecturer, Admin |
| GET | `/api/reports/[courseId]` | Full attendance report | Lecturer, Admin |
| GET | `/api/reports/export` | Export report (PDF/Excel) | Lecturer, Admin |
| GET | `/api/admin/users` | List all users | Admin |
| POST | `/api/admin/users` | Create user | Admin |
| DELETE | `/api/admin/users/[id]` | Delete user | Admin |
| POST | `/api/admin/enrollments` | Enroll student in course | Admin |

---

## 2.6 Folder Structure (Planned)

```
RollCall/
├── docs/                        # All phase documentation
├── prisma/
│   └── schema.prisma            # Database schema
├── public/                      # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── student/
│   │   ├── lecturer/
│   │   ├── admin/
│   │   └── api/
│   │       ├── auth/
│   │       ├── courses/
│   │       ├── sessions/
│   │       ├── attendance/
│   │       ├── reports/
│   │       └── admin/
│   ├── components/              # Reusable UI components
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client instance
│   │   └── auth.ts              # NextAuth config
│   └── types/                   # TypeScript types
├── .env                         # Environment variables
├── package.json
└── tailwind.config.ts
```

---

## 2.7 Security Considerations

- Passwords hashed with **bcrypt** before storing
- All API routes protected by **NextAuth session checks**
- Role-based guards: each route checks the user's role before proceeding
- QR tokens are **UUID-based**, expire when session is closed
- No sensitive data exposed in client-side code
