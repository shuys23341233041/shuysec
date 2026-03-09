interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
  iconBg: string
  iconColor: string
}

export function StatCard({ icon, value, label, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#333333] p-6 hover:border-[#637381] transition-all shadow-lg" style={{ background: 'var(--fs-gradient-card)' }}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBg} ${iconColor} shadow-md`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-[#FFFFFF] tracking-tight">{value}</div>
      <div className="text-sm text-[#919EAB] mt-1">{label}</div>
    </div>
  )
}
