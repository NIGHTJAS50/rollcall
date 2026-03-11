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

  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id },
    include: {
      course: { select: { name: true, code: true } },
      records: {
        include: { student: { select: { name: true, studentId: true } } },
        orderBy: { markedAt: "asc" },
      },
      _count: { select: { records: true } },
    },
  });

  if (!attendanceSession)
    return NextResponse.json({ error: "Session not found" }, { status: 404 });

  return NextResponse.json(attendanceSession);
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "LECTURER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const updated = await prisma.attendanceSession.update({
    where: { id },
    data: { isActive: false, closedAt: new Date() },
  });

  return NextResponse.json(updated);
}
