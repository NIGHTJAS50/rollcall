# Phase 3: Project Setup

**Project Name:** RollCall
**Date:** 2026-03-10

---

## 3.1 Prerequisites

| Tool | Version Used |
|---|---|
| Node.js | v24.14.0 |
| npm | v11.9.0 |

---

## 3.2 Project Initialization

Next.js was initialized inside `RollCall/rollcall/` using:

```bash
npx create-next-app@latest rollcall \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git \
  --yes
```

> Note: The folder is named `rollcall` (lowercase) due to npm naming restrictions, inside the `RollCall` parent folder which also holds the `docs/` directory.

---

## 3.3 Dependencies Installed

### Production
| Package | Purpose |
|---|---|
| `next-auth@beta` | Authentication and session management |
| `@auth/prisma-adapter` | Connect NextAuth with Prisma/PostgreSQL |
| `prisma` | ORM CLI for migrations and schema management |
| `@prisma/client` | Prisma runtime client for DB queries |
| `bcryptjs` | Password hashing |
| `qrcode` | Generate QR codes for attendance sessions |
| `html5-qrcode` | Scan QR codes from the browser camera |
| `xlsx` | Export attendance reports to Excel |
| `jspdf` | Export attendance reports to PDF |

### Development
| Package | Purpose |
|---|---|
| `@types/bcryptjs` | TypeScript types for bcryptjs |
| `@types/qrcode` | TypeScript types for qrcode |

---

## 3.4 Prisma Setup

Prisma was initialized with:
```bash
npx prisma init
```

This created:
- `prisma/schema.prisma` — database schema file
- `.env` — environment variables file

### Database Schema (`prisma/schema.prisma`)
Defines the following models:
- `User` — students, lecturers, admins (with role enum)
- `Course` — university courses
- `Enrollment` — student-to-course relationships
- `AttendanceSession` — a single class session opened by a lecturer
- `AttendanceRecord` — a student's attendance mark for a session

---

## 3.5 Environment Variables (`.env`)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/rollcall"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

> These must be updated with real values before running the app.

---

## 3.6 Folder Structure Created

```
RollCall/
├── docs/                            # Phase documentation
└── rollcall/                        # Next.js application
    ├── prisma/
    │   └── schema.prisma            # Database schema
    ├── public/                      # Static assets
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   │   ├── login/           # Login page
    │   │   │   └── register/        # Register page
    │   │   ├── student/
    │   │   │   ├── dashboard/       # Student home
    │   │   │   ├── course/          # Course detail + attendance
    │   │   │   └── attendance/      # Attendance history
    │   │   ├── lecturer/
    │   │   │   ├── dashboard/       # Lecturer home
    │   │   │   ├── course/          # Course management
    │   │   │   ├── session/         # Active session + QR
    │   │   │   └── reports/         # Attendance reports
    │   │   ├── admin/
    │   │   │   ├── dashboard/       # Admin overview
    │   │   │   ├── users/           # User management
    │   │   │   ├── courses/         # Course management
    │   │   │   └── enrollments/     # Enrollment management
    │   │   └── api/
    │   │       ├── auth/            # NextAuth routes
    │   │       ├── courses/         # Course API
    │   │       ├── sessions/        # Session API
    │   │       ├── attendance/      # Attendance API
    │   │       ├── reports/         # Reports API
    │   │       └── admin/           # Admin API
    │   ├── components/
    │   │   ├── ui/                  # Reusable UI components
    │   │   └── shared/              # Shared layout components
    │   ├── lib/
    │   │   └── prisma.ts            # Prisma client singleton
    │   └── types/
    │       └── index.ts             # Shared TypeScript types
    ├── .env                         # Environment variables
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

---

## 3.7 Next Steps

- Update `DATABASE_URL` in `.env` with a real PostgreSQL connection string
- Run `npx prisma migrate dev --name init` to create the database tables
- Begin Phase 4: Database & Auth implementation
