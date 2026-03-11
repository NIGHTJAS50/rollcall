"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavLink { label: string; href: string; icon: string; }

const roleLinks: Record<string, NavLink[]> = {
  STUDENT: [
    { label: "Dashboard", href: "/student/dashboard", icon: "🏠" },
    { label: "My Attendance", href: "/student/attendance", icon: "📊" },
  ],
  LECTURER: [
    { label: "Dashboard", href: "/lecturer/dashboard", icon: "🏠" },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Courses", href: "/admin/courses", icon: "📚" },
    { label: "Enrollments", href: "/admin/enrollments", icon: "📋" },
  ],
};

const roleBadgeColor: Record<string, string> = {
  STUDENT: "bg-emerald-100 text-emerald-700",
  LECTURER: "bg-blue-100 text-blue-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role ?? "";
  const links = roleLinks[role] ?? [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="RollCall" width={36} height={36} className="rounded-lg" />
            <span className="text-xl font-bold text-slate-800">RollCall</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        {session && (
          <div className="px-4 py-4 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {session.user.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{session.user.name}</p>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${roleBadgeColor[role]}`}>
                  {role}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition text-left font-medium"
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
