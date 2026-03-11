import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lecturer: { select: { name: true, email: true } },
      enrollments: { include: { student: { select: { id: true, name: true, studentId: true } } } },
      sessions: { orderBy: { date: "desc" }, take: 10 },
      _count: { select: { enrollments: true, sessions: true } },
    },
  });

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  return NextResponse.json(course);
}
