import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const features = [
    { icon: "📱", title: "QR Code Check-in", desc: "Students scan a QR code to mark attendance instantly" },
    { icon: "📊", title: "Live Reports", desc: "Real-time attendance tracking with exportable reports" },
    { icon: "🔔", title: "At-Risk Alerts", desc: "Automatic warnings for students below 75% attendance" },
    { icon: "🔒", title: "Role-Based Access", desc: "Separate dashboards for students, lecturers & admins" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="RollCall" width={36} height={36} className="rounded-lg" />
          <span className="text-xl font-bold text-slate-800">RollCall</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition px-4 py-2">
            Sign In
          </Link>
          <Link href="/register" className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-100">
          <span>✓</span> Built for universities
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Attendance made <span className="text-blue-600">simple</span> and <span className="text-cyan-600">smart</span>
        </h1>
        <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto">
          RollCall automates university attendance with QR codes, real-time tracking, and instant reports — no more paper registers.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition shadow-sm shadow-blue-200">
            Create Account
          </Link>
          <Link href="/login" className="bg-white text-slate-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-slate-50 transition border border-slate-200 shadow-sm">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} RollCall — University Attendance System
      </footer>
    </div>
  );
}
