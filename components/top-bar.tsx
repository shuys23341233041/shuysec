'use client'

import Link from 'next/link'
import { Globe, Settings, Moon, User } from 'lucide-react'

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-end gap-1 px-6 border-b border-white/5 bg-[#0f1419]/80 backdrop-blur-sm">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Language"
        >
          <Globe size={20} />
        </button>
        <Link
          href="/devices"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </Link>
        <button
          type="button"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Theme"
        >
          <Moon size={20} />
        </button>
        <button
          type="button"
          className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-semibold text-sm hover:ring-2 hover:ring-amber-400/50 transition-all"
          title="Account"
        >
          <User size={18} />
        </button>
      </div>
    </header>
  )
}
