'use client'

import { RefreshCw } from 'lucide-react'

const formatWelcomeDate = () => {
  const d = new Date()
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return d.toLocaleDateString('en-US', options)
}

interface WelcomeHeaderProps {
  onRefresh?: () => void
  isLoading?: boolean
}

export function WelcomeHeader({ onRefresh, isLoading }: WelcomeHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-xl px-6 py-5 shadow-lg shadow-[#078DEE]/20" style={{ background: 'var(--fs-gradient-welcome)' }}>
      <div>
        <h1 className="text-2xl font-bold text-[#FFFFFF]">Welcome to sHuysSec</h1>
        <p className="text-[#68CDF9] text-sm mt-0.5">{formatWelcomeDate()}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="bg-white/15 hover:bg-white/25 text-[#FFFFFF] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-white/20"
        >
          24H
        </button>
        <button
          type="button"
          className="bg-white/15 hover:bg-white/25 text-[#FFFFFF] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-white/20"
        >
          7D
        </button>
        <button
          type="button"
          className="bg-white/15 hover:bg-white/25 text-[#FFFFFF] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-white/20"
        >
          30D
        </button>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-[#FFFFFF] border border-white/20 disabled:opacity-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
    </div>
  )
}
