interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: "blue" | "green" | "purple" | "orange" | "red" | "cyan";
  subtitle?: string;
}

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-100 text-blue-600",   text: "text-blue-700" },
  green:  { bg: "bg-emerald-50",icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-700" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", text: "text-purple-700" },
  orange: { bg: "bg-orange-50", icon: "bg-orange-100 text-orange-600", text: "text-orange-700" },
  red:    { bg: "bg-red-50",    icon: "bg-red-100 text-red-600",     text: "text-red-700" },
  cyan:   { bg: "bg-cyan-50",   icon: "bg-cyan-100 text-cyan-600",   text: "text-cyan-700" },
};

export default function StatCard({ label, value, icon, color, subtitle }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} rounded-2xl p-5 border border-white shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`${c.icon} w-11 h-11 rounded-xl flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
