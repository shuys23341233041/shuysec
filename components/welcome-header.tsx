import { Settings, Eye, Grid2X2, Zap } from 'lucide-react'

export function WelcomeHeader() {
  return (
    <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 rounded-xl p-6 mb-6 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to sHuysSec</h1>
          <p className="text-blue-100 text-sm">Wednesday, March 4, 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20">24H</button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20">7D</button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20">30D</button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 backdrop-blur-sm border border-white/10 hover:border-white/20">
            <Zap size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
