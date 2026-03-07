interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
  bgColor: string
  iconColor: string
}

export function StatCard({ icon, value, label, bgColor, iconColor }: StatCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/60 hover:-translate-y-1 cursor-default group">
      <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center mb-4 shadow-lg transition-all duration-300 group-hover:scale-110`}>
        <div className={`${iconColor} transition-transform duration-300 group-hover:rotate-12`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">{label}</div>
    </div>
  )
}
