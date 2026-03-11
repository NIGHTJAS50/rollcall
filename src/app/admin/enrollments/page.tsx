"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";

interface Enrollment { id: string; enrolledAt: string; student: { name: string; studentId: string | null; email: string }; course: { name: string; code: string }; }
interface User { id: string; name: string; studentId: string | null; }
interface Course { id: string; name: string; code: string; }

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/enrollments").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ]).then(([e, u, c]) => {
      setEnrollments(e);
      setStudents(u.filter((user: { role: string }) => user.role === "STUDENT"));
      setCourses(c); setLoading(false);
    });
  }, []);

  async function enroll(e: React.FormEvent) {
    e.preventDefault(); setCreating(true); setError("");
    const res = await fetch("/api/admin/enrollments", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setCreating(false); return; }
    fetch("/api/admin/enrollments").then((r) => r.json()).then(setEnrollments);
    setForm({ studentId: "", courseId: "" }); setShowForm(false); setCreating(false);
  }

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Enrollments</h1>
            <p className="text-slate-500 text-sm mt-1">{enrollments.length} total enrollments.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <span>+</span> Enroll Student
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Enroll Student into Course</h2>
            <form onSubmit={enroll} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Select Student</label>
                  <select value={form.studentId} onChange={(e) => setForm({...form, studentId: e.target.value})} required className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Choose a student...</option>
                    {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>)}
                  </select></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Select Course</label>
                  <select value={form.courseId} onChange={(e) => setForm({...form, courseId: e.target.value})} required className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Choose a course...</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                  </select></div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={creating} className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50">{creating ? "Enrolling..." : "Enroll"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 text-sm border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["Student","Student ID","Course","Code","Enrolled"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">{e.student.name[0]}</div>
                        <span className="font-medium text-slate-800">{e.student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{e.student.studentId ?? "—"}</td>
                    <td className="px-5 py-3.5 text-slate-700">{e.course.name}</td>
                    <td className="px-5 py-3.5"><span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">{e.course.code}</span></td>
                    <td className="px-5 py-3.5 text-slate-400">{new Date(e.enrolledAt).toLocaleDateString()}</td>
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
