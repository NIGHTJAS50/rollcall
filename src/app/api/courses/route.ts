import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const userId = session.user.id;

  let courses;

  if (role === "LECTURER") {
    courses = await prisma.course.findMany({
      where: { lecturerId: userId },
      include: { _count: { select: { enrollments: true, sessions: true } } },
      orderBy: { createdAt: "desc" },
    });
  } else if (role === "STUDENT") {
    courses = await prisma.course.findMany({
      where: { enrollments: { some: { studentId: userId } } },
      include: {
        lecturer: { select: { name: true } },
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    courses = await prisma.course.findMany({
      include: {
        lecturer: { select: { name: true } },
        _count: { select: { enrollments: true, sessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "LECTURER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, code, department } = await req.json();
  if (!name || !code || !department)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = await prisma.course.findUnique({ where: { code } });
  if (existing)
    return NextResponse.json({ error: "Course code already exists" }, { status: 409 });

  const course = await prisma.course.create({
    data: { name, code, department, lecturerId: session.user.id },
  });

  return NextResponse.json(course, { status: 201 });
}
