# Phase 4: Database & Authentication

**Project Name:** RollCall
**Date:** 2026-03-10

---

## 4.1 Database Setup

### PostgreSQL
- Version: PostgreSQL 18
- Database created: `rollcall`
- Host: `localhost:5432`
- User: `postgres`

### Prisma Migration
Initial migration was generated and applied using:
```bash
npx prisma migrate dev --name init
```

This created all 5 tables in the database:
- `User`
- `Course`
- `Enrollment`
- `AttendanceSession`
- `AttendanceRecord`

### Prisma Config Note (v7)
Prisma v7 no longer allows the `url` field inside `schema.prisma`.
The database URL is now configured in `prisma.config.ts`:
```ts
datasource: {
  url: process.env["DATABASE_URL"],
}
```

---

## 4.2 Authentication Implementation

### Strategy
- **Provider:** NextAuth.js (v5 beta) with `CredentialsProvider`
- **Session strategy:** JWT (stored in cookie)
- **Password hashing:** bcryptjs (12 salt rounds)

### Files Created

#### `src/lib/auth.ts`
Core NextAuth configuration:
- Validates email + password against the database
- Compares hashed password using bcrypt
- Injects `id` and `role` into the JWT token
- Exposes `role` on the session object

#### `src/app/api/auth/[...nextauth]/route.ts`
NextAuth HTTP handler (GET + POST).

#### `src/app/api/auth/register/route.ts`
POST endpoint for user registration:
- Validates required fields
- Checks for duplicate email
- Hashes password before storing
- Supports `STUDENT`, `LECTURER`, and `ADMIN` roles
- Stores `studentId` for students only

---

## 4.3 Session Type Extension

`src/types/next-auth.d.ts` extends the default NextAuth session to include:
```ts
session.user.id    // string (UUID)
session.user.role  // Role enum (STUDENT | LECTURER | ADMIN)
```

---

## 4.4 UI Pages

### Login Page — `/auth/login`
- Email + password form
- Calls `signIn("credentials", ...)` from NextAuth
- Redirects to role-specific dashboard on success
- Shows error message on invalid credentials

### Register Page — `/auth/register`
- Fields: Full Name, Email, Password, Role, Student ID (if Student)
- Calls `POST /api/auth/register`
- Redirects to login on success

---

## 4.5 Root Layout Update

`src/app/layout.tsx` now wraps the app in a `SessionProvider` component so all client components can access the session via `useSession()`.

---

## 4.6 Environment Variables Required

```env
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/rollcall"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 4.7 Next Steps
- Phase 5: Build core features — course management, attendance sessions, QR code generation, attendance marking
