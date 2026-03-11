"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";

interface CourseAttendance {
  id: string; name: string; code: string; department: string;
  lecturer: { name: string }; totalSessions: number; attended: number; percentage: number;
}

function AttendanceBar({ value }: { value: number }) {
  const color = value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-600 w-10 text-right">{value}%</span>
    </div>
  );
}

export default function StudentAttendancePage() {
  const [courses, setCourses] = useState<CourseAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json()).then(async (list) => {
      const withData = await Promise.all(list.map(async (c: CourseAttendance) => {
        const res = await fetch(`/api/attendance/${c.id}`);
        const data = await res.json();
        return { ...c, totalSessions: data.totalSessions ?? 0, attended: data.attended ?? 0, percentage: data.percentage ?? 0 };
      }));
      setCourses(withData); setLoading(false);
    });
  }, []);

  const overall = courses.length > 0 ? Math.round(courses.reduce((s, c) => s + c.percentage, 0) / courses.length) : 0;
  const atRisk = courses.filter((c) => c.percentage < 75 && c.totalSessions > 0);

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Track your attendance across all enrolled courses.</p>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <StatCard label="Overall Attendance" value={`${overall}%`} icon="📊" color="blue" />
              <StatCard label="Enrolled Courses" value={courses.length} icon="📚" color="green" />
              <StatCard label="At Risk Courses" value={atRisk.length} icon="⚠️" color="red" subtitle="Below 75% attendance" />
            </div>

            {atRisk.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-700 text-sm">Attendance Warning</p>
                  <p className="text-sm text-red-600 mt-0.5">
                    You are below 75% in: <strong>{atRisk.map((c) => c.code).join(", ")}</strong>. Attend more sessions to avoid academic issues.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {courses.map((course) => {
                const status = course.totalSessions === 0 ? null : course.percentage >= 75 ? "good" : course.percentage >= 50 ? "warning" : "risk";
                const badge = { good: "bg-emerald-100 text-emerald-700", warning: "bg-amber-100 text-amber-700", risk: "bg-red-100 text-red-600" };
                const label = { good: "Good Standing", warning: "Needs Improvement", risk: "At Risk" };
                return (
                  <Link key={course.id} href={`/student/course/${course.id}`}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition p-5 block group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{course.code}</span>
                        <h2 className="font-semibold text-slate-800">{course.name}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        {status && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge[status]}`}>{label[status]}</span>}
                        <span className="text-slate-300 group-hover:text-blue-400 transition">→</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{course.department} · {course.lecturer?.name} · {course.attended}/{course.totalSessions} sessions attended</p>
                    <AttendanceBar value={course.percentage} />
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
