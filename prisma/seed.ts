import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const hash = (p: string) => bcrypt.hash(p, 12);

  // --- Users ---
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@rollcall.com",
      password: await hash("Admin@123"),
      role: "ADMIN",
    },
  });

  const lecturer1 = await prisma.user.create({
    data: {
      name: "Dr. Jane Smith",
      email: "jane@rollcall.com",
      password: await hash("Lecturer@123"),
      role: "LECTURER",
    },
  });

  const lecturer2 = await prisma.user.create({
    data: {
      name: "Prof. Mark Davis",
      email: "mark@rollcall.com",
      password: await hash("Lecturer@123"),
      role: "LECTURER",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@rollcall.com",
      password: await hash("Student@123"),
      role: "STUDENT",
      studentId: "STU2024001",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Bob Williams",
      email: "bob@rollcall.com",
      password: await hash("Student@123"),
      role: "STUDENT",
      studentId: "STU2024002",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Carol Brown",
      email: "carol@rollcall.com",
      password: await hash("Student@123"),
      role: "STUDENT",
      studentId: "STU2024003",
    },
  });

  console.log("Users created.");

  // --- Courses ---
  const course1 = await prisma.course.create({
    data: {
      name: "Introduction to Computer Science",
      code: "CS101",
      department: "Computer Science",
      lecturerId: lecturer1.id,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      name: "Data Structures & Algorithms",
      code: "CS201",
      department: "Computer Science",
      lecturerId: lecturer1.id,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      name: "Database Systems",
      code: "CS301",
      department: "Computer Science",
      lecturerId: lecturer2.id,
    },
  });

  console.log("Courses created.");

  // --- Enrollments ---
  await prisma.enrollment.createMany({
    data: [
      { studentId: student1.id, courseId: course1.id },
      { studentId: student1.id, courseId: course2.id },
      { studentId: student2.id, courseId: course1.id },
      { studentId: student2.id, courseId: course3.id },
      { studentId: student3.id, courseId: course1.id },
      { studentId: student3.id, courseId: course2.id },
      { studentId: student3.id, courseId: course3.id },
    ],
  });

  console.log("Enrollments created.");

  // --- Sessions for CS101 (3 past sessions) ---
  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);

  const session1 = await prisma.attendanceSession.create({
    data: {
      courseId: course1.id,
      date: daysAgo(14),
      openedAt: daysAgo(14),
      closedAt: daysAgo(14),
      isActive: false,
    },
  });

  const session2 = await prisma.attendanceSession.create({
    data: {
      courseId: course1.id,
      date: daysAgo(7),
      openedAt: daysAgo(7),
      closedAt: daysAgo(7),
      isActive: false,
    },
  });

  const session3 = await prisma.attendanceSession.create({
    data: {
      courseId: course1.id,
      date: daysAgo(1),
      openedAt: daysAgo(1),
      closedAt: daysAgo(1),
      isActive: false,
    },
  });

  // --- Attendance Records ---
  // Session 1: Alice & Bob present
  await prisma.attendanceRecord.createMany({
    data: [
      { studentId: student1.id, sessionId: session1.id, status: "PRESENT" },
      { studentId: student2.id, sessionId: session1.id, status: "PRESENT" },
    ],
  });

  // Session 2: All 3 present
  await prisma.attendanceRecord.createMany({
    data: [
      { studentId: student1.id, sessionId: session2.id, status: "PRESENT" },
      { studentId: student2.id, sessionId: session2.id, status: "PRESENT" },
      { studentId: student3.id, sessionId: session2.id, status: "PRESENT" },
    ],
  });

  // Session 3: Only Alice present
  await prisma.attendanceRecord.createMany({
    data: [
      { studentId: student1.id, sessionId: session3.id, status: "PRESENT" },
    ],
  });

  console.log("Sessions & attendance records created.");
  console.log("\n✅ Seed complete!\n");
  console.log("Test Accounts:");
  console.log("  Admin:    admin@rollcall.com    / Admin@123");
  console.log("  Lecturer: jane@rollcall.com     / Lecturer@123");
  console.log("  Lecturer: mark@rollcall.com     / Lecturer@123");
  console.log("  Student:  alice@rollcall.com    / Student@123  (STU2024001)");
  console.log("  Student:  bob@rollcall.com      / Student@123  (STU2024002)");
  console.log("  Student:  carol@rollcall.com    / Student@123  (STU2024003)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
