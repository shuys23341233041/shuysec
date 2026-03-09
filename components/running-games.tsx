'use client'

import { Activity } from 'lucide-react'

export function RunningGames() {
  return (
    <div className="rounded-xl border border-white/5 bg-[#161b22] p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
          <Activity size={18} />
        </div>
        <div>
          <h3 className="text-white font-semibold">Running Games</h3>
          <p className="text-xs text-gray-400">Distribution by game</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-10">
        <div className="text-3xl font-bold text-white">0</div>
        <p className="text-sm text-gray-400 mt-1">Total Running</p>
        <div className="mt-6 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
          <span className="text-xs text-gray-400">0</span>
        </div>
      </div>
    </div>
  )
}
