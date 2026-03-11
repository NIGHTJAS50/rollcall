import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "LECTURER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { courseId } = await req.json();
  if (!courseId)
    return NextResponse.json({ error: "courseId required" }, { status: 400 });

  // Check course belongs to this lecturer
  const course = await prisma.course.findFirst({
    where: { id: courseId, lecturerId: session.user.id },
  });
  if (!course)
    return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // Close any existing active session for this course
  await prisma.attendanceSession.updateMany({
    where: { courseId, isActive: true },
    data: { isActive: false, closedAt: new Date() },
  });

  const newSession = await prisma.attendanceSession.create({
    data: { courseId },
  });

  return NextResponse.json(newSession, { status: 201 });
}
