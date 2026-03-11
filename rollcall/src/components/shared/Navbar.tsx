"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const links = {
    STUDENT: [
      { label: "Dashboard", href: "/student/dashboard" },
      { label: "Attendance", href: "/student/attendance" },
    ],
    LECTURER: [
      { label: "Dashboard", href: "/lecturer/dashboard" },
    ],
    ADMIN: [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Users", href: "/admin/users" },
      { label: "Courses", href: "/admin/courses" },
      { label: "Enrollments", href: "/admin/enrollments" },
    ],
  };

  const navLinks = role ? links[role] ?? [] : [];

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link href="/" className="text-xl font-bold tracking-tight">
        RollCall
      </Link>

      <div className="flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm hover:text-blue-200 transition"
          >
            {link.label}
          </Link>
        ))}

        {session && (
          <div className="flex items-center gap-4 ml-4 border-l border-blue-400 pl-4">
            <span className="text-sm text-blue-100">{session.user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm bg-white text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
