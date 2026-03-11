import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { courseId } = await params;
  const format = req.nextUrl.searchParams.get("format") ?? "excel";

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const sessions = await prisma.attendanceSession.findMany({
    where: { courseId },
    include: {
      records: {
        include: { student: { select: { id: true, name: true, studentId: true } } },
      },
    },
    orderBy: { date: "asc" },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: { student: { select: { id: true, name: true, studentId: true, email: true } } },
  });

  if (format === "excel") {
    // Build header row: Name | Student ID | Email | Session1 | Session2 | ... | Total | %
    const sessionHeaders = sessions.map((s, i) =>
      `Session ${i + 1} (${new Date(s.date).toLocaleDateString()})`
    );
    const headers = ["Name", "Student ID", "Email", ...sessionHeaders, "Attended", "Total", "Percentage"];

    const rows = enrollments.map((enrollment) => {
      const student = enrollment.student;
      const sessionCols = sessions.map((s) =>
        s.records.some((r) => r.student.id === student.id) ? "P" : "A"
      );
      const attended = sessionCols.filter((c) => c === "P").length;
      const total = sessions.length;
      const percentage = total > 0 ? `${Math.round((attended / total) * 100)}%` : "0%";
      return [student.name, student.studentId ?? "", student.email, ...sessionCols, attended, total, percentage];
    });

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${course.code}-attendance.xlsx"`,
      },
    });
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}
