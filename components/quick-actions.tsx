'use client'

import Link from 'next/link'
import { Database, BarChart3, Copy, HardDrive } from 'lucide-react'

const actions = [
  { icon: Database, label: 'Devices', description: 'Manage devices', href: '/devices', color: 'bg-blue-600' },
  { icon: BarChart3, label: 'Mass Configure', description: 'Distribute accounts', href: '/mass-configure', color: 'bg-emerald-600' },
  { icon: Copy, label: 'Account Manager', description: 'Unassigned accounts', href: '/unassigned', color: 'bg-amber-600' },
  { icon: HardDrive, label: 'Backups', description: 'Restore backups', href: '/backups', color: 'bg-green-600' },
]

export function QuickActions() {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="rounded-xl border border-white/5 bg-[#161b22] p-4 hover:border-white/10 hover:bg-[#1c2128] transition-all text-left group"
          >
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 text-white group-hover:scale-105 transition-transform`}>
              <action.icon size={20} />
            </div>
            <h4 className="text-white font-semibold text-sm">{action.label}</h4>
            <p className="text-xs text-gray-400 mt-0.5">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
