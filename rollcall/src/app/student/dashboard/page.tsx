"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";

interface Course {
  id: string; name: string; code: string; department: string;
  lecturer: { name: string }; _count: { sessions: number };
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json()).then((d) => { setCourses(d); setLoading(false); });
  }, []);

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="text-slate-500 text-sm mt-1">Select a course to view attendance or mark yourself present.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Enrolled Courses" value={courses.length} icon="📚" color="blue" />
          <StatCard label="Total Sessions" value={courses.reduce((s, c) => s + c._count.sessions, 0)} icon="📅" color="cyan" />
          <StatCard label="Active Now" value={0} icon="✅" color="green" subtitle="Check each course for active sessions" />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="bg-slate-100 rounded-2xl h-40 animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold text-slate-700">No courses yet</p>
            <p className="text-sm text-slate-400 mt-1">Contact your admin to be enrolled in courses.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Link key={course.id} href={`/student/course/${course.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{course.code}</span>
                  <span className="text-slate-300 group-hover:text-blue-500 transition text-lg font-light">→</span>
                </div>
                <h2 className="font-semibold text-slate-800 mb-1">{course.name}</h2>
                <p className="text-sm text-slate-400 mb-4">{course.department}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
                  <span>👨‍🏫 {course.lecturer?.name}</span>
                  <span>📅 {course._count.sessions} sessions</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
