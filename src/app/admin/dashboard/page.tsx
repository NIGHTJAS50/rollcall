"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";

interface Stats { users: number; students: number; lecturers: number; courses: number; enrollments: number; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/admin/enrollments").then((r) => r.json()),
    ]).then(([users, courses, enrollments]) => {
      setStats({
        users: users.length,
        students: users.filter((u: { role: string }) => u.role === "STUDENT").length,
        lecturers: users.filter((u: { role: string }) => u.role === "LECTURER").length,
        courses: courses.length,
        enrollments: enrollments.length,
      });
    });
  }, []);

  const quickLinks = [
    { label: "Manage Users", desc: "Create and manage accounts", href: "/admin/users", icon: "👥", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Manage Courses", desc: "View all university courses", href: "/admin/courses", icon: "📚", color: "bg-purple-600 hover:bg-purple-700" },
    { label: "Enrollments", desc: "Enroll students into courses", href: "/admin/enrollments", icon: "📋", color: "bg-emerald-600 hover:bg-emerald-700" },
  ];

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">System overview and management tools.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Users" value={stats?.users ?? "—"} icon="👤" color="blue" />
          <StatCard label="Students" value={stats?.students ?? "—"} icon="🎓" color="green" />
          <StatCard label="Lecturers" value={stats?.lecturers ?? "—"} icon="👨‍🏫" color="purple" />
          <StatCard label="Courses" value={stats?.courses ?? "—"} icon="📚" color="orange" />
          <StatCard label="Enrollments" value={stats?.enrollments ?? "—"} icon="📋" color="cyan" />
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {quickLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className={`${l.color} text-white rounded-2xl p-6 transition shadow-sm group`}
            >
              <span className="text-3xl block mb-3">{l.icon}</span>
              <h3 className="font-semibold text-lg mb-1">{l.label}</h3>
              <p className="text-sm opacity-80">{l.desc}</p>
              <span className="block mt-4 text-sm font-medium opacity-70 group-hover:opacity-100 transition">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
