"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/shared/DashboardLayout";
import QRCode from "qrcode";

interface AttendanceRecord { id: string; markedAt: string; student: { name: string; studentId: string | null }; }
interface SessionData {
  id: string; qrToken: string; isActive: boolean; date: string; openedAt: string; closedAt: string | null;
  course: { name: string; code: string }; records: AttendanceRecord[]; _count: { records: number };
}

export default function LecturerSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [closing, setClosing] = useState(false);

  const fetchSession = useCallback(() => {
    fetch(`/api/sessions/${id}`).then((r) => r.json()).then((data) => {
      setSession(data); setLoading(false);
      if (data.qrToken) QRCode.toDataURL(data.qrToken, { width: 220, margin: 2 }).then(setQrDataUrl);
    });
  }, [id]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 10000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  async function closeSession() {
    setClosing(true);
    await fetch(`/api/sessions/${id}`, { method: "PATCH" });
    router.back();
  }

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        {loading ? (
          <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
        ) : !session ? (
          <p className="text-red-500">Session not found.</p>
        ) : (
          <>
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{session.course.code}</span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">{session.course.name}</h1>
                <p className="text-slate-500 text-sm">
                  {new Date(session.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <span className={`text-sm font-semibold px-4 py-2 rounded-full ${
                session.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}>
                {session.isActive ? "🟢 Session Active" : "⚫ Session Closed"}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center">
                <h2 className="font-semibold text-slate-800 mb-5 self-start">QR Code</h2>
                {qrDataUrl ? (
                  <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner">
                    <img src={qrDataUrl} alt="QR Code" className="rounded-xl" />
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 animate-pulse">Generating...</div>
                )}
                <p className="text-xs text-slate-400 mt-4 text-center break-all max-w-xs font-mono">{session.qrToken}</p>
                {session.isActive && (
                  <button onClick={closeSession} disabled={closing}
                    className="mt-5 w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-3 rounded-xl transition disabled:opacity-50"
                  >
                    {closing ? "Closing..." : "🔒 Close Session"}
                  </button>
                )}
              </div>

              {/* Attendance list */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-800">Present Students</h2>
                  <span className="text-2xl font-bold text-blue-600">{session._count.records}</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Auto-refreshes every 10 seconds</p>
                {session.records.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-3xl mb-2">👥</p>
                    <p className="text-sm">Waiting for students to mark attendance...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {session.records.map((record, i) => (
                      <div key={record.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{record.student.name}</p>
                            <p className="text-xs text-slate-400">{record.student.studentId}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(record.markedAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
