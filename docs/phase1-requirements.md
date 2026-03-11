# Phase 1: Requirements Analysis

**Project Name:** RollCall
**Type:** University Automated Attendance Web Application
**Date:** 2026-03-10

---

## 1.1 Project Overview

RollCall is a web-based automated attendance management system designed for university use. It allows lecturers to open attendance sessions (via QR code), students to mark their presence, and admins to manage users and courses. The system eliminates manual paper-based attendance and provides real-time reports.

---

## 1.2 Stakeholders

| Role | Description |
|---|---|
| **Student** | Marks their own attendance per session |
| **Lecturer** | Creates courses, opens/closes sessions, views reports |
| **Admin** | Manages all users, courses, departments, and enrollments |

---

## 1.3 Functional Requirements

### Student
- Register and log in to the system
- View list of enrolled courses
- Mark attendance during an active session (within the open time window)
- View personal attendance history per course
- See attendance percentage per course

### Lecturer
- Register and log in to the system
- Create and manage courses
- Open an attendance session for a course (generates a QR code)
- Close an attendance session
- View attendance records per session and per student
- Export attendance report (PDF / Excel)

### Admin
- Log in to the system
- Create, update, and delete user accounts (students and lecturers)
- Manage departments and courses
- Enroll students into courses
- View system-wide attendance reports

---

## 1.4 Non-Functional Requirements

| Requirement | Description |
|---|---|
| **Responsiveness** | Works on mobile browsers (no app install needed) |
| **Security** | JWT-based auth, role-based access control (RBAC) |
| **Performance** | Session open/close updates in real time |
| **Data Integrity** | One attendance record per student per session (no duplicates) |
| **Usability** | Simple, clean UI suitable for non-technical users |

---

## 1.5 Constraints

- University context: one student can only mark attendance once per session
- Attendance marking is only allowed while a session is active (lecturer controls open/close)
- No native mobile app — web only (mobile-responsive)
- No biometric or RFID — QR code and manual check-in only

---

## 1.6 Use Cases

| ID | Use Case | Actor |
|---|---|---|
| UC01 | Register / Login | All roles |
| UC02 | Create a course | Lecturer |
| UC03 | Enroll students into a course | Admin |
| UC04 | Open attendance session + generate QR | Lecturer |
| UC05 | Mark attendance (scan QR or click button) | Student |
| UC06 | Close attendance session | Lecturer |
| UC07 | View attendance report per course/student | Lecturer, Admin |
| UC08 | Export attendance report (PDF/Excel) | Lecturer, Admin |
| UC09 | Manage users | Admin |
| UC10 | View personal attendance history | Student |

---

## 1.7 Assumptions

- Every student has a unique university student ID
- A course belongs to one lecturer
- A student can be enrolled in multiple courses
- Internet access is available on campus
