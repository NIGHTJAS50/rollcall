"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/shared/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";

interface Session { id: string; date: string; isActive: boolean; openedAt: string; closedAt: string | null; }
interface Course { id: string; name: string; code: string; department: string; _count: { enrollments: number; sessions: number }; sessions: Session[]; }

export default function LecturerCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    fetch(`/api/courses/${id}`).then((r) => r.json()).then((d) => { setCourse(d); setLoading(false); });
  }, [id]);

  async function openSession() {
    setOpening(true);
    setSessionError("");
    const res = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: id }) });
    const data = await res.json();
    if (res.ok) router.push(`/lecturer/session/${data.id}`);
    else setSessionError(data.error || `Error ${res.status}`);
    setOpening(false);
  }

  const activeSession = course?.sessions.find((s) => s.isActive);

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
        ) : !course ? (
          <p className="text-red-500">Course not found.</p>
        ) : (
          <>
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{course.code}</span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">{course.name}</h1>
                <p className="text-slate-500 text-sm">{course.department}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/lecturer/reports/${id}`}
                  className="text-sm font-medium text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition"
                >
                  📊 View Report
                </Link>
                {sessionError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{sessionError}</p>}
                {activeSession ? (
                  <Link href={`/lecturer/session/${activeSession.id}`}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                  >
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> Active Session
                  </Link>
                ) : (
                  <button onClick={openSession} disabled={opening}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                  >
                    {opening ? "Opening..." : "▶ Open Session"}
                  </button>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <StatCard label="Enrolled Students" value={course._count.enrollments} icon="🎓" color="blue" />
              <StatCard label="Total Sessions" value={course._count.sessions} icon="📅" color="cyan" />
              <StatCard label="Status" value={activeSession ? "Active" : "Inactive"} icon={activeSession ? "🟢" : "⚫"} color={activeSession ? "green" : "orange"} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Session History</h2>
              </div>
              {course.sessions.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <p className="text-3xl mb-2">📅</p>
                  <p>No sessions yet. Open the first one above.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>{["Date","Opened At","Closed At","Status",""].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {course.sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          {new Date(s.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{new Date(s.openedAt).toLocaleTimeString()}</td>
                        <td className="px-5 py-3.5 text-slate-500">{s.closedAt ? new Date(s.closedAt).toLocaleTimeString() : "—"}</td>
                        <td className="px-5 py-3.5">
                          {s.isActive
                            ? <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">Active</span>
                            : <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">Closed</span>
                          }
                        </td>
                        <td className="px-5 py-3.5">
                          <Link href={`/lecturer/session/${s.id}`} className="text-blue-600 hover:underline text-xs font-medium">View →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
