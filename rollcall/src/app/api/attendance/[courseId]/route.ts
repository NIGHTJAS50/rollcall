import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  const userId = session.user.id;
  const role = session.user.role;

  if (role === "STUDENT") {
    // Return this student's records for this course
    const sessions = await prisma.attendanceSession.findMany({
      where: { courseId },
      include: {
        records: {
          where: { studentId: userId },
        },
      },
      orderBy: { date: "asc" },
    });

    const totalSessions = sessions.length;
    const attended = sessions.filter((s) => s.records.length > 0).length;
    const percentage = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;

    return NextResponse.json({ sessions, totalSessions, attended, percentage });
  }

  // Lecturer/Admin: return all records for all students
  const sessions = await prisma.attendanceSession.findMany({
    where: { courseId },
    include: {
      records: {
        include: { student: { select: { name: true, studentId: true, email: true } } },
      },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(sessions);
}
