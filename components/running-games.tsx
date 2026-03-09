'use client'

import { Activity } from 'lucide-react'

export function RunningGames() {
  return (
    <div className="rounded-xl border border-[#333333] bg-[#28323D] p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#22C55E] flex items-center justify-center text-white">
          <Activity size={18} />
        </div>
        <div>
          <h3 className="text-[#FFFFFF] font-semibold">Running Games</h3>
          <p className="text-xs text-[#919EAB]">Distribution by game</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-10">
        <div className="text-3xl font-bold text-[#FFFFFF]">0</div>
        <p className="text-sm text-[#919EAB] mt-1">Total Running</p>
        <div className="mt-6 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#078DEE] rounded-full" />
          <span className="text-xs text-[#919EAB]">0</span>
        </div>
      </div>
    </div>
  )
}
