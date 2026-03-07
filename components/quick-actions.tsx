import { Database, Zap, Settings, Key } from 'lucide-react'

const actions = [
  { icon: Database, label: 'Devices', description: 'Manage devices', bgColor: 'bg-gradient-to-br from-blue-600 to-blue-700', shadow: 'shadow-blue-500/20' },
  { icon: Zap, label: 'Scripts', description: 'Browse scripts', bgColor: 'bg-gradient-to-br from-cyan-600 to-blue-600', shadow: 'shadow-cyan-500/20' },
  { icon: Settings, label: 'Configs', description: 'Configurations', bgColor: 'bg-gradient-to-br from-orange-600 to-amber-600', shadow: 'shadow-orange-500/20' },
  { icon: Key, label: 'Licenses', description: 'View licenses', bgColor: 'bg-gradient-to-br from-green-600 to-emerald-600', shadow: 'shadow-green-500/20' },
]

export function QuickActions() {
  return (
    <div className="mb-6">
      <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action, i) => (
          <button key={i} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/60 hover:-translate-y-1 text-left group">
            <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center mb-3 shadow-lg ${action.shadow} group-hover:scale-125 transition-all duration-300`}>
              <action.icon size={20} className="text-white transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <h4 className="text-white font-semibold text-sm transition-colors duration-300 group-hover:text-cyan-300">{action.label}</h4>
            <p className="text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
