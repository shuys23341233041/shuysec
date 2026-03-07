'use client'

import { Activity } from 'lucide-react'

export function RunningGames() {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/60 group cursor-default">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all duration-300 group-hover:scale-110">
          <Activity size={18} className="text-white transition-transform duration-300 group-hover:animate-pulse" />
        </div>
        <div>
          <h3 className="text-white font-semibold transition-colors duration-300 group-hover:text-purple-300">Running Games</h3>
          <p className="text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300">Distribution by game</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4">
          <div className="text-4xl font-bold text-white transition-colors duration-300 group-hover:text-purple-300">0</div>
          <p className="text-sm text-gray-400 text-center mt-2 transition-colors duration-300 group-hover:text-gray-300">Total Running</p>
        </div>
        
        <div className="mt-8 flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
          <span className="text-xs text-gray-400">0</span>
        </div>
      </div>
    </div>
  )
}
