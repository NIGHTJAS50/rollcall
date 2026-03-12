import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { sessionId } = await req.json();
  if (!sessionId)
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  // Find the active session
  const attendanceSession = await prisma.attendanceSession.findFirst({
    where: { id: sessionId, isActive: true },
    include: { course: true },
  });

  if (!attendanceSession)
    return NextResponse.json(
      { error: "Session not found or is no longer active" },
      { status: 404 }
    );

  // Check enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: session.user.id,
      courseId: attendanceSession.courseId,
    },
  });

  if (!enrollment)
    return NextResponse.json(
      { error: "You are not enrolled in this course" },
      { status: 403 }
    );

  // Check for duplicate
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      studentId_sessionId: {
        studentId: session.user.id,
        sessionId: attendanceSession.id,
      },
    },
  });

  if (existing)
    return NextResponse.json(
      { error: "Attendance already marked" },
      { status: 409 }
    );

  const record = await prisma.attendanceRecord.create({
    data: {
      studentId: session.user.id,
      sessionId: attendanceSession.id,
      status: "PRESENT",
    },
  });

  return NextResponse.json(
    { message: "Attendance marked successfully", record },
    { status: 201 }
  );
}
