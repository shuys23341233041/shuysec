interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
  iconBg: string
  iconColor: string
}

export function StatCard({ icon, value, label, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#161b22] p-6 hover:border-white/10 transition-colors">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4 ${iconColor}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  )
}
