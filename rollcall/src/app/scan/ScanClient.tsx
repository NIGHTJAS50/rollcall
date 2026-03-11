"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ScanClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/scan?token=${token}`)}`);
      return;
    }

    if (session?.user.role !== "STUDENT") {
      setMessage("Only students can mark attendance via QR code.");
      setLoading(false);
      return;
    }

    if (!token) {
      setMessage("Invalid QR code — no token found.");
      setLoading(false);
      return;
    }

    fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken: token }),
    }).then(async (res) => {
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMessage("Attendance marked successfully!");
      } else {
        setMessage(data.error || "Failed to mark attendance.");
      }
      setLoading(false);
    });
  }, [status, token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        {loading ? (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">📱</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Processing...</h2>
            <p className="text-slate-500 text-sm mt-1">Marking your attendance</p>
          </>
        ) : success ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-emerald-700">Present!</h2>
            <p className="text-slate-500 text-sm mt-2">{message}</p>
            <Link
              href="/student/attendance"
              className="mt-6 block w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              View My Attendance
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-red-700">Failed</h2>
            <p className="text-slate-500 text-sm mt-2">{message}</p>
            <Link
              href="/student/dashboard"
              className="mt-6 block w-full bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-semibold hover:bg-slate-200 transition"
            >
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
