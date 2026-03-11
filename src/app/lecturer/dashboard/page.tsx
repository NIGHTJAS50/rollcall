"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";

interface Course {
  id: string; name: string; code: string; department: string;
  _count: { enrollments: number; sessions: number };
}

export default function LecturerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", department: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json()).then((d) => { setCourses(d); setLoading(false); });
  }, []);

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setError("");
    const res = await fetch("/api/courses", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setCreating(false); return; }
    setCourses((prev) => [data, ...prev]);
    setForm({ name: "", code: "", department: "" });
    setShowForm(false); setCreating(false);
  }

  const totalStudents = courses.reduce((s, c) => s + c._count.enrollments, 0);
  const totalSessions = courses.reduce((s, c) => s + c._count.sessions, 0);

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your courses and run attendance sessions.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <span className="text-base">+</span> New Course
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Courses" value={courses.length} icon="📚" color="blue" />
          <StatCard label="Total Students" value={totalStudents} icon="🎓" color="green" />
          <StatCard label="Total Sessions" value={totalSessions} icon="📅" color="cyan" />
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Create New Course</h2>
            <form onSubmit={createCourse} className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Course Name</label>
                  <input placeholder="e.g. Introduction to CS" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Course Code</label>
                  <input placeholder="e.g. CS101" value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })} required
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Department</label>
                  <input placeholder="e.g. Computer Science" value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })} required
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={creating}
                  className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Course"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="text-slate-500 text-sm border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50"
                >Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="bg-slate-100 rounded-2xl h-40 animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-4xl mb-3">📂</p>
            <p className="font-semibold text-slate-700">No courses yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first course using the button above.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Link key={course.id} href={`/lecturer/course/${course.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{course.code}</span>
                  <span className="text-slate-300 group-hover:text-blue-500 transition text-lg">→</span>
                </div>
                <h2 className="font-semibold text-slate-800 mb-1">{course.name}</h2>
                <p className="text-sm text-slate-400 mb-4">{course.department}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
                  <span>🎓 {course._count.enrollments} students</span>
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
