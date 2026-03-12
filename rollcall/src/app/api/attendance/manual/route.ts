import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "LECTURER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { sessionId, studentUserId, registrationNumber } = await req.json();

  if (!sessionId || (!studentUserId && !registrationNumber))
    return NextResponse.json(
      { error: "sessionId and one of studentUserId or registrationNumber are required" },
      { status: 400 }
    );

  // Find the active session and verify it belongs to this lecturer
  const attendanceSession = await prisma.attendanceSession.findFirst({
    where: { id: sessionId, isActive: true },
    include: { course: true },
  });

  if (!attendanceSession)
    return NextResponse.json(
      { error: "Session not found or is no longer active" },
      { status: 404 }
    );

  if (attendanceSession.course.lecturerId !== session.user.id)
    return NextResponse.json(
      { error: "You do not own this course" },
      { status: 403 }
    );

  // Resolve the student
  let student;
  if (studentUserId) {
    student = await prisma.user.findUnique({
      where: { id: studentUserId },
    });
  } else {
    student = await prisma.user.findFirst({
      where: { studentId: registrationNumber, role: "STUDENT" },
    });
  }

  if (!student)
    return NextResponse.json({ error: "Student not found" }, { status: 404 });

  // Check enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: student.id,
      courseId: attendanceSession.courseId,
    },
  });

  if (!enrollment)
    return NextResponse.json(
      { error: "Student is not enrolled in this course" },
      { status: 403 }
    );

  // Check for duplicate
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      studentId_sessionId: {
        studentId: student.id,
        sessionId: attendanceSession.id,
      },
    },
  });

  if (existing)
    return NextResponse.json(
      { error: "Attendance already marked for this student" },
      { status: 409 }
    );

  const record = await prisma.attendanceRecord.create({
    data: {
      studentId: student.id,
      sessionId: attendanceSession.id,
      status: "PRESENT",
    },
  });

  return NextResponse.json(
    { message: `Attendance marked for ${student.name}`, record },
    { status: 201 }
  );
}
