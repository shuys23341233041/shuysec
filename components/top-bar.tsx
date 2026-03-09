'use client'

import Link from 'next/link'
import { Globe, Settings, Moon, User } from 'lucide-react'

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-end gap-1 px-6 border-b border-[#28323D] backdrop-blur-sm" style={{ background: 'linear-gradient(90deg, transparent 0%, #141A21 20%, #1a2332 100%)' }}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="p-2 rounded-lg text-[#919EAB] hover:text-[#FFFFFF] hover:bg-[#28323D] transition-colors"
          title="Language"
        >
          <Globe size={20} />
        </button>
        <Link
          href="/devices"
          className="p-2 rounded-lg text-[#919EAB] hover:text-[#FFFFFF] hover:bg-[#28323D] transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </Link>
        <button
          type="button"
          className="p-2 rounded-lg text-[#919EAB] hover:text-[#FFFFFF] hover:bg-[#28323D] transition-colors"
          title="Theme"
        >
          <Moon size={20} />
        </button>
        <button
          type="button"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#FFFFFF] font-semibold text-sm hover:ring-2 hover:ring-[#68CDF9] transition-all shadow-md"
          style={{ background: 'var(--fs-gradient-primary)' }}
          title="Account"
        >
          <User size={18} />
        </button>
      </div>
    </header>
  )
}
