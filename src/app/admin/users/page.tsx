"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";

interface User { id: string; name: string; email: string; role: string; studentId: string | null; createdAt: string; }

const roleBadge: Record<string, string> = {
  STUDENT:  "bg-emerald-100 text-emerald-700",
  LECTURER: "bg-blue-100 text-blue-700",
  ADMIN:    "bg-purple-100 text-purple-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT", studentId: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => { setUsers(d); setLoading(false); });
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault(); setCreating(true); setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setCreating(false); return; }
    setUsers((prev) => [{ ...data, createdAt: new Date().toISOString(), studentId: form.studentId || null }, ...prev]);
    setForm({ name: "", email: "", password: "", role: "STUDENT", studentId: "" });
    setShowForm(false); setCreating(false);
  }

  const filtered = filter === "ALL" ? users : users.filter((u) => u.role === filter);

  return (
    <DashboardLayout>
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Users</h1>
            <p className="text-slate-500 text-sm mt-1">{users.length} total accounts in the system.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <span>+</span> Add User
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Create New User</h2>
            <form onSubmit={createUser} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name</label>
                  <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                  <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                  <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Role</label>
                  <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="STUDENT">Student</option>
                    <option value="LECTURER">Lecturer</option>
                    <option value="ADMIN">Admin</option>
                  </select></div>
                {form.role === "STUDENT" && (
                  <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Student ID</label>
                    <input placeholder="e.g. STU2024001" value={form.studentId} onChange={(e) => setForm({...form, studentId: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                )}
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={creating} className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50">{creating ? "Creating..." : "Create"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 text-sm border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="flex gap-2 mb-5">
          {["ALL", "STUDENT", "LECTURER", "ADMIN"].map((r) => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                filter === r ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
              }`}
            >{r}</button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["Name","Email","Role","Student ID","Joined"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {user.name[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{user.email}</td>
                    <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge[user.role]}`}>{user.role}</span></td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{user.studentId ?? "—"}</td>
                    <td className="px-5 py-3.5 text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
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
