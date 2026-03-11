import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { studentId, courseId } = await req.json();

  if (!studentId || !courseId)
    return NextResponse.json({ error: "studentId and courseId required" }, { status: 400 });

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });

  if (existing)
    return NextResponse.json({ error: "Student already enrolled" }, { status: 409 });

  const enrollment = await prisma.enrollment.create({
    data: { studentId, courseId },
  });

  return NextResponse.json(enrollment, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: { select: { name: true, studentId: true, email: true } },
      course: { select: { name: true, code: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return NextResponse.json(enrollments);
}
