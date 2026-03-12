"use client";

import { useState, Suspense } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSwitching = searchParams.get("switch") === "true";
  const { data: currentSession } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Clear any existing session first so it doesn't bleed into the new one
    if (currentSession) {
      await signOut({ redirect: false });
    }

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role;

    if (role === "STUDENT") router.push("/student/dashboard");
    else if (role === "LECTURER") router.push("/lecturer/dashboard");
    else if (role === "ADMIN") router.push("/admin/dashboard");
    else router.push("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 flex-col items-center justify-center p-12 text-white">
        <Image src="/logo.svg" alt="RollCall" width={80} height={80} className="mb-6 drop-shadow-lg" />
        <h2 className="text-3xl font-bold mb-3">Welcome back!</h2>
        <p className="text-blue-100 text-center max-w-xs">
          Sign in to manage attendance, view reports, and keep track of your classes.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-xs">
          {[
            { label: "Students", value: "1,200+" },
            { label: "Courses", value: "80+" },
            { label: "Sessions", value: "5,000+" },
            { label: "Accuracy", value: "99.9%" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-blue-100">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Image src="/logo.svg" alt="RollCall" width={36} height={36} />
            <span className="text-xl font-bold text-slate-800">RollCall</span>
          </div>

          {/* Banner when switching accounts */}
          {isSwitching && currentSession && (
            <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                {currentSession.user.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-700 truncate">
                  Signed in as <span className="font-semibold">{currentSession.user.name}</span>
                </p>
                <p className="text-xs text-slate-500">Sign in below to switch accounts</p>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {isSwitching ? "Switch account" : "Sign in"}
          </h1>
          <p className="text-slate-500 text-sm mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                placeholder="you@university.edu"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-sm shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : isSwitching ? "Switch Account →" : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              Create one
            </Link>
          </p>

          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            <p className="font-medium text-slate-600 mb-2">Demo accounts:</p>
            <p>Admin: admin@rollcall.com / Admin@123</p>
            <p>Lecturer: jane@rollcall.com / Lecturer@123</p>
            <p>Student: alice@rollcall.com / Student@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" />}>
      <LoginForm />
    </Suspense>
  );
}
