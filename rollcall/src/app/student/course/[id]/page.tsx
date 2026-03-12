"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/shared/DashboardLayout";
import StatCard from "@/components/ui/StatCard";

const QRScanner = lazy(() => import("@/components/shared/QRScanner"));

interface AttendanceData {
  sessions: {
    id: string;
    date: string;
    isActive: boolean;
    qrToken: string;
    records: { id: string }[];
  }[];
  totalSessions: number;
  attended: number;
  percentage: number;
}

function AttendanceBar({ value }: { value: number }) {
  const color = value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-3 mt-1">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-600 w-10 text-right">{value}%</span>
    </div>
  );
}

export default function StudentCoursePage() {
  const { id } = useParams();
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [selfCheckin, setSelfCheckin] = useState(false);
  const [activeSession, setActiveSession] = useState<{ id: string; qrToken: string } | null>(null);

  function loadData() {
    fetch(`/api/attendance/${id}`)
      .then((r) => r.json())
      .then((d: AttendanceData) => {
        setData(d);
        const active = d.sessions?.find((s) => s.isActive);
        if (active) setActiveSession({ id: active.id, qrToken: active.qrToken });
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function markAttendanceSelf() {
    if (!activeSession) return;
    setSelfCheckin(true);
    setMessage("");
    const res = await fetch("/api/attendance/self-checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: activeSession.id }),
    });
    const result = await res.json();
    setMessage(res.ok ? "Attendance marked successfully!" : result.error);
    setSelfCheckin(false);
    if (res.ok) loadData();
  }

  async function markAttendance(token?: string) {
    const t = token ?? qrInput;
    if (!t) return;
    setMarking(true);
    setMessage("");
    setShowScanner(false);

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken: t }),
    });
    const result = await res.json();
    setMessage(res.ok ? "Attendance marked successfully!" : result.error);
    setMarking(false);
    if (res.ok) {
      setQrInput("");
      loadData();
    }
  }

  const pct = data?.percentage ?? 0;
  const statusColor: "green" | "orange" | "red" | "blue" =
    pct >= 75 ? "green" : pct >= 50 ? "orange" : data ? "red" : "blue";

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        {/* Camera scanner modal */}
        {showScanner && (
          <Suspense fallback={null}>
            <QRScanner
              onScan={(token) => {
                setShowScanner(false);
                markAttendance(token);
              }}
              onClose={() => setShowScanner(false)}
            />
          </Suspense>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Course Attendance</h1>
              <p className="text-slate-500 text-sm mt-1">Your attendance record for this course.</p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <StatCard label="Attendance Rate" value={`${pct}%`} icon="📊" color={statusColor} />
              <StatCard label="Sessions Attended" value={data?.attended ?? 0} icon="✅" color="blue" />
              <StatCard label="Total Sessions" value={data?.totalSessions ?? 0} icon="📅" color="cyan" />
            </div>

            {/* Progress bar */}
            {data && data.totalSessions > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-800">Overall Progress</h2>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      pct >= 75
                        ? "bg-emerald-100 text-emerald-700"
                        : pct >= 50
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {pct >= 75 ? "Good Standing" : pct >= 50 ? "Needs Improvement" : "At Risk"}
                  </span>
                </div>
                <AttendanceBar value={pct} />
                <p className="text-xs text-slate-400 mt-2">
                  Maintain at least 75% attendance to stay in good standing.
                </p>
              </div>
            )}

            {/* Active Session — QR scan */}
            {activeSession && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <h2 className="font-semibold text-blue-800 text-lg">
                    Active Session — Mark Your Attendance
                  </h2>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  A session is currently open. Mark your attendance directly, or scan the QR code.
                </p>

                {/* One-click portal check-in */}
                <button
                  onClick={markAttendanceSelf}
                  disabled={selfCheckin || marking}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold transition mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>✅</span> {selfCheckin ? "Marking..." : "Mark Attendance"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-blue-100" />
                  <span className="text-xs text-slate-400">or scan QR code</span>
                  <div className="flex-1 h-px bg-blue-100" />
                </div>

                {/* Camera scan button */}
                <button
                  onClick={() => setShowScanner(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition mb-3 flex items-center justify-center gap-2"
                >
                  <span>📷</span> Scan QR Code with Camera
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-blue-100" />
                  <span className="text-xs text-slate-400">or enter token manually</span>
                  <div className="flex-1 h-px bg-blue-100" />
                </div>

                {/* Manual token input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Paste QR token here..."
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    onClick={() => markAttendance()}
                    disabled={marking || !qrInput}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                  >
                    {marking ? "Marking..." : "✓ Mark Present"}
                  </button>
                </div>

                {message && (
                  <p
                    className={`mt-3 text-sm font-medium px-4 py-2.5 rounded-xl ${
                      message.includes("success")
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                  >
                    {message.includes("success") ? "✅ " : "❌ "}
                    {message}
                  </p>
                )}
              </div>
            )}

            {/* Session History */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Session History</h2>
              </div>
              {!data?.sessions.length ? (
                <div className="p-10 text-center text-slate-400">
                  <p className="text-3xl mb-2">📅</p>
                  <p className="text-sm">No sessions have been held yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.sessions.map((s, i) => (
                    <div
                      key={s.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {new Date(s.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {s.isActive && (
                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                              Currently Active
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                          s.records.length > 0
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {s.records.length > 0 ? "✓ Present" : "✗ Absent"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
