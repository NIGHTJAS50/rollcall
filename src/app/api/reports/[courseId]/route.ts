import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lecturer: { select: { name: true } } },
  });

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const sessions = await prisma.attendanceSession.findMany({
    where: { courseId },
    include: {
      records: {
        include: { student: { select: { id: true, name: true, studentId: true, email: true } } },
      },
    },
    orderBy: { date: "asc" },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: { student: { select: { id: true, name: true, studentId: true, email: true } } },
  });

  // Build per-student summary
  const studentSummary = enrollments.map((enrollment) => {
    const student = enrollment.student;
    const attended = sessions.filter((s) =>
      s.records.some((r) => r.student.id === student.id)
    ).length;
    const total = sessions.length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
    return { student, attended, total, percentage };
  });

  return NextResponse.json({
    course,
    sessions,
    studentSummary,
    totalSessions: sessions.length,
    totalStudents: enrollments.length,
  });
}
