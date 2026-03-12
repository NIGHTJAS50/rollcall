"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/shared/DashboardLayout";
import QRCode from "qrcode";

interface AttendanceRecord {
  id: string;
  markedAt: string;
  student: { id: string; name: string; studentId: string | null };
}

interface EnrolledStudent {
  id: string;
  name: string;
  studentId: string | null;
}

interface SessionData {
  id: string;
  qrToken: string;
  isActive: boolean;
  date: string;
  openedAt: string;
  closedAt: string | null;
  course: { id: string; name: string; code: string };
  records: AttendanceRecord[];
  _count: { records: number };
}

const QR_ROTATE_SECONDS = 120; // rotate every 2 minutes

export default function LecturerSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [closing, setClosing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [kioskInput, setKioskInput] = useState("");
  const [kioskLoading, setKioskLoading] = useState(false);
  const [kioskMsg, setKioskMsg] = useState("");
  const [overrideLoading, setOverrideLoading] = useState<string | null>(null);
  const [overrideMsg, setOverrideMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [countdown, setCountdown] = useState(QR_ROTATE_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buildScanUrl = useCallback((token: string) => {
    if (typeof window === "undefined") return token;
    return `${window.location.origin}/scan?token=${token}`;
  }, []);

  const generateQR = useCallback(
    async (token: string) => {
      const url = buildScanUrl(token);
      const dataUrl = await QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
    },
    [buildScanUrl]
  );

  const fetchSession = useCallback(
    (silent = false) => {
      if (!silent) setLoading(true);
      fetch(`/api/sessions/${id}`)
        .then((r) => r.json())
        .then((data: SessionData) => {
          setSession(data);
          setLoading(false);
          if (data.qrToken) generateQR(data.qrToken);
        });
    },
    [id, generateQR]
  );

  // Refresh QR token on the server
  const refreshQR = useCallback(
    async (auto = false) => {
      if (!session?.isActive) return;
      if (!auto) setRefreshing(true);
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh-qr" }),
      });
      if (res.ok) {
        const data: SessionData = await res.json();
        setSession((prev) => (prev ? { ...prev, qrToken: data.qrToken } : prev));
        await generateQR(data.qrToken);
        setCountdown(QR_ROTATE_SECONDS);
      }
      if (!auto) setRefreshing(false);
    },
    [id, session?.isActive, generateQR]
  );

  // Download QR as PNG
  function downloadQR() {
    if (!qrDataUrl || !session) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${session.course.code}-${new Date(session.date).toISOString().slice(0, 10)}.png`;
    a.click();
  }

  async function closeSession() {
    setClosing(true);
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close" }),
    });
    router.back();
  }

  // Initial load + attendance polling every 10s
  useEffect(() => {
    fetchSession();
    const poll = setInterval(() => fetchSession(true), 10000);
    return () => clearInterval(poll);
  }, [fetchSession]);

  // Load enrolled students once course ID is known
  useEffect(() => {
    if (!session?.course?.id) return;
    fetch(`/api/courses/${session.course.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.enrollments) {
          setEnrolledStudents(
            data.enrollments.map((e: { student: EnrolledStudent }) => e.student)
          );
        }
      });
  }, [session?.course?.id]);

  // Countdown timer + auto-rotate
  useEffect(() => {
    if (!session?.isActive) return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return QR_ROTATE_SECONDS;
        return prev - 1;
      });
    }, 1000);

    autoRefreshRef.current = setInterval(() => {
      refreshQR(true);
    }, QR_ROTATE_SECONDS * 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [session?.isActive, refreshQR]);

  const countdownPct = (countdown / QR_ROTATE_SECONDS) * 100;

  async function kioskCheckin(e: React.FormEvent) {
    e.preventDefault();
    if (!kioskInput.trim() || !session) return;
    setKioskLoading(true);
    setKioskMsg("");
    const res = await fetch("/api/attendance/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id, registrationNumber: kioskInput.trim() }),
    });
    const data = await res.json();
    setKioskMsg(res.ok ? data.message : data.error);
    setKioskLoading(false);
    if (res.ok) {
      setKioskInput("");
      fetchSession(true);
    }
  }

  async function overrideStudent(studentUserId: string) {
    if (!session) return;
    setOverrideLoading(studentUserId);
    setOverrideMsg(null);
    const res = await fetch("/api/attendance/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id, studentUserId }),
    });
    const data = await res.json();
    setOverrideMsg({ id: studentUserId, text: res.ok ? data.message : data.error, ok: res.ok });
    setOverrideLoading(null);
    if (res.ok) fetchSession(true);
  }

  // Build a set of student user IDs (UUIDs) that are already marked present
  const presentStudentIds = new Set(session?.records.map((r) => r.student.id) ?? []);

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !session ? (
          <p className="text-red-500">Session not found.</p>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {session.course.code}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">{session.course.name}</h1>
                <p className="text-slate-500 text-sm">
                  {new Date(session.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`text-sm font-semibold px-4 py-2 rounded-full ${
                  session.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {session.isActive ? "🟢 Session Active" : "⚫ Session Closed"}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* QR Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-5">
                  <h2 className="font-semibold text-slate-800">QR Code</h2>
                  {session.isActive && (
                    <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                      Rotates in {countdown}s
                    </span>
                  )}
                </div>

                {qrDataUrl ? (
                  <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner">
                    <img src={qrDataUrl} alt="QR Code" className="rounded-xl" width={240} height={240} />
                  </div>
                ) : (
                  <div className="w-60 h-60 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 animate-pulse">
                    Generating...
                  </div>
                )}

                {/* Countdown bar */}
                {session.isActive && (
                  <div className="w-full mt-4">
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${countdownPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 text-center mt-1.5">
                      QR auto-rotates every {QR_ROTATE_SECONDS / 60} min for security
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 w-full mt-4">
                  <button
                    onClick={downloadQR}
                    disabled={!qrDataUrl}
                    className="flex-1 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-medium py-2.5 rounded-xl transition disabled:opacity-40"
                  >
                    ⬇ Download
                  </button>
                  {session.isActive && (
                    <button
                      onClick={() => refreshQR(false)}
                      disabled={refreshing}
                      className="flex-1 border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium py-2.5 rounded-xl transition disabled:opacity-50"
                    >
                      {refreshing ? "Refreshing..." : "↻ Refresh QR"}
                    </button>
                  )}
                </div>

                {session.isActive && (
                  <button
                    onClick={closeSession}
                    disabled={closing}
                    className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-3 rounded-xl transition disabled:opacity-50"
                  >
                    {closing ? "Closing..." : "🔒 Close Session"}
                  </button>
                )}

                <p className="text-xs text-slate-300 mt-3 text-center break-all max-w-xs font-mono">
                  {session.qrToken}
                </p>
              </div>

              {/* Attendance list */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-800">Present Students</h2>
                  <span className="text-2xl font-bold text-blue-600">{session._count.records}</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Auto-refreshes every 10 seconds</p>

                {session.records.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <p className="text-4xl mb-2">👥</p>
                    <p className="text-sm">Waiting for students to scan...</p>
                    <p className="text-xs mt-1 text-slate-300">
                      Students can scan the QR or use the scan URL
                    </p>
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
                        <span className="text-xs text-slate-400">
                          {new Date(record.markedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fallback attendance panels — only shown while session is active */}
            {session.isActive && (
              <div className="grid md:grid-cols-2 gap-6">

                {/* Panel A: Manual Check-In (Kiosk) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h2 className="font-semibold text-slate-800 mb-1">Manual Check-In</h2>
                  <p className="text-xs text-slate-400 mb-4">
                    Enter a student&apos;s registration number to mark them present.
                  </p>
                  <form onSubmit={kioskCheckin} className="flex gap-3">
                    <input
                      type="text"
                      value={kioskInput}
                      onChange={(e) => setKioskInput(e.target.value)}
                      placeholder="e.g. STU2024001"
                      className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={kioskLoading || !kioskInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                    >
                      {kioskLoading ? "Marking..." : "Mark Present"}
                    </button>
                  </form>
                  {kioskMsg && (
                    <p
                      className={`mt-3 text-sm font-medium px-4 py-2.5 rounded-xl ${
                        kioskMsg.toLowerCase().includes("marked")
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {kioskMsg}
                    </p>
                  )}
                </div>

                {/* Panel B: Enrolled Students Override */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-800">Enrolled Students</h2>
                    <span className="text-sm text-slate-400">{enrolledStudents.length} enrolled</span>
                  </div>
                  {enrolledStudents.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No enrolled students found.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {enrolledStudents.map((student) => {
                        const isPresent = presentStudentIds.has(student.id);
                        const isLoading = overrideLoading === student.id;
                        const msg = overrideMsg?.id === student.id ? overrideMsg : null;
                        return (
                          <div key={student.id} className="py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate">{student.name}</p>
                              <p className="text-xs text-slate-400">{student.studentId ?? "—"}</p>
                              {msg && !msg.ok && (
                                <p className="text-xs text-red-500 mt-0.5">{msg.text}</p>
                              )}
                            </div>
                            {isPresent ? (
                              <span className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
                                ✓ Present
                              </span>
                            ) : (
                              <button
                                onClick={() => overrideStudent(student.id)}
                                disabled={isLoading}
                                className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition disabled:opacity-50"
                              >
                                {isLoading ? "..." : "Mark Present"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}