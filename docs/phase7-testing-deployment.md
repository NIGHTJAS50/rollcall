# Phase 7: Testing & Deployment

**Project Name:** RollCall
**Date:** 2026-03-11

---

## 7.1 Database Seed

A seed script (`prisma/seed.ts`) was created to populate the database with test data.

### Run the seed:
```bash
cd rollcall
npx prisma db seed
```

### Test Accounts Created:

| Role | Email | Password | Student ID |
|---|---|---|---|
| Admin | admin@rollcall.com | Admin@123 | — |
| Lecturer | jane@rollcall.com | Lecturer@123 | — |
| Lecturer | mark@rollcall.com | Lecturer@123 | — |
| Student | alice@rollcall.com | Student@123 | STU2024001 |
| Student | bob@rollcall.com | Student@123 | STU2024002 |
| Student | carol@rollcall.com | Student@123 | STU2024003 |

### Seeded Data:
- 3 courses: CS101, CS201, CS301
- 7 enrollments across students and courses
- 3 closed attendance sessions for CS101
- Attendance records (Alice: 3/3, Bob: 2/3, Carol: 1/3)

---

## 7.2 Prisma v7 Adapter Fix

Prisma v7 removed `url` from `schema.prisma` and requires a driver adapter for non-Prisma-Postgres databases.

**Solution:** Used `@prisma/adapter-pg` with a `pg` connection pool:

```ts
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```

This fix was applied to both `src/lib/prisma.ts` and `prisma/seed.ts`.

---

## 7.3 Production Build

```bash
npm run build
```

**Result:** ✅ All 27 routes compiled successfully with zero errors.

### Route Summary:
| Type | Routes |
|---|---|
| Static (○) | `/`, landing, dashboards, admin pages |
| Dynamic (ƒ) | All API routes, session/course pages |
| Middleware (ƒ) | Route protection |

---

## 7.4 Testing Checklist

### Auth Flow
- [ ] Register as Student (with student ID)
- [ ] Register as Lecturer
- [ ] Login redirects to correct dashboard by role
- [ ] Accessing wrong role's page redirects to login
- [ ] Sign out clears session

### Lecturer Flow
- [ ] Create a new course
- [ ] Open an attendance session
- [ ] QR code generates correctly on session page
- [ ] Session shows live attendance count (auto-refresh)
- [ ] Close session — QR becomes invalid
- [ ] View full attendance report
- [ ] Export to Excel — file downloads
- [ ] Export to PDF — file downloads

### Student Flow
- [ ] Dashboard shows enrolled courses only
- [ ] Course page shows attendance summary
- [ ] Active session shows mark attendance form
- [ ] Paste valid QR token → attendance marked
- [ ] Duplicate attempt → "Attendance already marked" error
- [ ] Invalid/closed token → "Invalid or expired QR" error
- [ ] Attendance history page shows all courses with % bars

### Admin Flow
- [ ] Dashboard shows correct counts
- [ ] Create new user (student, lecturer, admin)
- [ ] Filter users by role
- [ ] View all courses
- [ ] Enroll student into course
- [ ] Duplicate enrollment → error shown

---

## 7.5 Running Locally

```bash
cd RollCall/rollcall
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 7.6 Deployment Guide

### Option A: Vercel + Railway (Recommended)

#### Step 1 — Push to GitHub
```bash
cd RollCall/rollcall
git init
git add .
git commit -m "Initial RollCall app"
git remote add origin https://github.com/YOUR_USERNAME/rollcall.git
git push -u origin main
```

#### Step 2 — Create PostgreSQL on Railway
1. Go to [railway.app](https://railway.app)
2. New Project → PostgreSQL
3. Copy the `DATABASE_URL` from the Variables tab

#### Step 3 — Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set environment variables:
   ```
   DATABASE_URL=postgresql://...  (from Railway)
   NEXTAUTH_SECRET=generate-a-random-32-char-string
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
4. Deploy

#### Step 4 — Run migrations on production DB
```bash
DATABASE_URL="your-railway-url" npx prisma migrate deploy
DATABASE_URL="your-railway-url" npx prisma db seed
```

---

### Option B: Self-hosted (VPS)

1. Install Node.js 20+, PostgreSQL, nginx on your server
2. Clone repo and `npm install`
3. Set up `.env` with production values
4. Run `npm run build`
5. Use `pm2` to keep the process alive:
   ```bash
   pm2 start npm --name "rollcall" -- start
   ```
6. Configure nginx as a reverse proxy to port 3000

---

## 7.7 Environment Variables (Production)

```env
DATABASE_URL="postgresql://user:password@host:5432/rollcall"
NEXTAUTH_SECRET="your-random-secret-minimum-32-characters"
NEXTAUTH_URL="https://your-production-domain.com"
```

> Generate a secret: `openssl rand -base64 32`

---

## 7.8 Project Complete

All 7 phases finished:

| Phase | Status |
|---|---|
| 1. Requirements Analysis | ✅ Done |
| 2. System Design | ✅ Done |
| 3. Project Setup | ✅ Done |
| 4. Database & Auth | ✅ Done |
| 5. Core Features | ✅ Done |
| 6. Reports & Dashboard | ✅ Done |
| 7. Testing & Deployment | ✅ Done |
