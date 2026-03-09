interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
  iconBg: string
  iconColor: string
}

export function StatCard({ icon, value, label, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#333333] bg-[#28323D] p-6 hover:border-[#637381] transition-colors">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4 ${iconColor}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-[#FFFFFF] tracking-tight">{value}</div>
      <div className="text-sm text-[#919EAB] mt-1">{label}</div>
    </div>
  )
}
