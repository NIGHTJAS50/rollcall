"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";

interface Course {
  id: string; name: string; code: string; department: string;
  lecturer: { name: string }; _count: { enrollments: number; sessions: number };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json()).then((d) => { setCourses(d); setLoading(false); });
  }, []);

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">All Courses</h1>
          <p className="text-slate-500 text-sm mt-1">{courses.length} courses across the university.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No courses found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["Course","Code","Department","Lecturer","Students","Sessions"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{course.name}</td>
                    <td className="px-5 py-3.5"><span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">{course.code}</span></td>
                    <td className="px-5 py-3.5 text-slate-500">{course.department}</td>
                    <td className="px-5 py-3.5 text-slate-500">{course.lecturer?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500">{course._count.enrollments}</td>
                    <td className="px-5 py-3.5 text-slate-500">{course._count.sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
