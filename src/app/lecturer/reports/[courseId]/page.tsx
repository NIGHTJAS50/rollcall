"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/shared/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  studentId: string | null;
  email: string;
}

interface StudentSummary {
  student: Student;
  attended: number;
  total: number;
  percentage: number;
}

interface Session {
  id: string;
  date: string;
  isActive: boolean;
  records: { student: { id: string } }[];
}

interface ReportData {
  course: { id: string; name: string; code: string; department: string; lecturer: { name: string } };
  sessions: Session[];
  studentSummary: StudentSummary[];
  totalSessions: number;
  totalStudents: number;
}

function PercentageBar({ value }: { value: number }) {
  const color = value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-600 w-10 text-right">{value}%</span>
    </div>
  );
}

export default function LecturerReportsPage() {
  const { courseId } = useParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "percentage">("name");

  useEffect(() => {
    fetch(`/api/reports/${courseId}`)
      .then((r) => r.json())
      .then((d) => { setReport(d); setLoading(false); });
  }, [courseId]);

  async function exportExcel() {
    setExporting(true);
    const res = await fetch(`/api/reports/${courseId}/export?format=excel`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report?.course.code}-attendance.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  async function exportPDF() {
    if (!report) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Attendance Report — ${report.course.name}`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Course Code: ${report.course.code}  |  Department: ${report.course.department}`, 14, 30);
    doc.text(`Lecturer: ${report.course.lecturer.name}`, 14, 37);
    doc.text(`Total Sessions: ${report.totalSessions}  |  Total Students: ${report.totalStudents}`, 14, 44);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 51);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Student Attendance Summary", 14, 65);

    const headers = [["Name", "Student ID", "Attended", "Total", "Percentage"]];
    const rows = report.studentSummary.map((s) => [
      s.student.name,
      s.student.studentId ?? "—",
      String(s.attended),
      String(s.total),
      `${s.percentage}%`,
    ]);

    let y = 75;
    const colWidths = [60, 35, 25, 20, 30];
    const colX = [14, 74, 109, 134, 154];

    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.rect(14, y - 5, 182, 8, "F");
    headers[0].forEach((h, i) => doc.text(h, colX[i], y));

    doc.setTextColor(0);
    doc.setFontSize(9);
    rows.forEach((row, ri) => {
      y += 10;
      if (y > 270) { doc.addPage(); y = 20; }
      if (ri % 2 === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(14, y - 5, 182, 8, "F");
      }
      row.forEach((cell, i) => doc.text(cell, colX[i], y));
    });

    doc.save(`${report.course.code}-attendance.pdf`);
  }

  const filtered = report?.studentSummary
    .filter((s) => s.student.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.student.studentId ?? "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "percentage"
      ? b.percentage - a.percentage
      : a.student.name.localeCompare(b.student.name)
    ) ?? [];

  const avgAttendance = report && report.studentSummary.length > 0
    ? Math.round(report.studentSummary.reduce((sum, s) => sum + s.percentage, 0) / report.studentSummary.length)
    : 0;

  const atRisk = report?.studentSummary.filter((s) => s.percentage < 75).length ?? 0;

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : !report ? (
          <p className="text-red-500">Report not found.</p>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {report.course.code}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">{report.course.name}</h1>
                <p className="text-slate-500 text-sm">{report.course.department} · {report.course.lecturer.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportExcel}
                  disabled={exporting}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-sm"
                >
                  {exporting ? "Exporting..." : "📊 Export Excel"}
                </button>
                <button
                  onClick={exportPDF}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
                >
                  📄 Export PDF
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Sessions" value={report.totalSessions} icon="📅" color="blue" />
              <StatCard label="Total Students" value={report.totalStudents} icon="🎓" color="cyan" />
              <StatCard label="Avg. Attendance" value={`${avgAttendance}%`} icon="📊" color="green" />
              <StatCard label="At Risk (<75%)" value={atRisk} icon="⚠️" color="red" />
            </div>

            {/* Sessions overview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-4">Sessions Overview</h2>
              <div className="flex flex-wrap gap-2">
                {report.sessions.map((s, i) => (
                  <Link
                    key={s.id}
                    href={`/lecturer/session/${s.id}`}
                    className={`text-xs px-3 py-2 rounded-xl border font-medium hover:shadow-sm transition ${
                      s.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Session {i + 1} · {new Date(s.date).toLocaleDateString()} · {s.records.length} present
                    {s.isActive && <span className="ml-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />}
                  </Link>
                ))}
              </div>
            </div>

            {/* Student table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Student Attendance</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "name" | "percentage")}
                    className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Sort: Name</option>
                    <option value="percentage">Sort: Attendance %</option>
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-sm">No students found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Student ID</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sessions</th>
                        {report.sessions.map((s, i) => (
                          <th key={s.id} className="px-2 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase w-10" title={new Date(s.date).toLocaleDateString()}>
                            S{i + 1}
                          </th>
                        ))}
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">Attendance</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(({ student, attended, total, percentage }) => (
                        <tr key={student.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {student.name[0]}
                              </div>
                              <span className="font-medium text-slate-800">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{student.studentId ?? "—"}</td>
                          <td className="px-5 py-3.5 text-slate-500 font-medium">{attended}/{total}</td>
                          {report.sessions.map((s) => {
                            const present = s.records.some((r) => r.student.id === student.id);
                            return (
                              <td key={s.id} className="px-2 py-3.5 text-center">
                                <span className={`text-xs font-bold ${present ? "text-emerald-600" : "text-red-400"}`}>
                                  {present ? "P" : "A"}
                                </span>
                              </td>
                            );
                          })}
                          <td className="px-5 py-3.5 w-40">
                            <PercentageBar value={percentage} />
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              percentage >= 75
                                ? "bg-emerald-100 text-emerald-700"
                                : percentage >= 50
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-600"
                            }`}>
                              {percentage >= 75 ? "Good" : percentage >= 50 ? "Warning" : "At Risk"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}