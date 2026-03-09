'use client'

import Link from 'next/link'
import { Database, BarChart3, Copy, HardDrive } from 'lucide-react'

const actions = [
  { icon: Database, label: 'Devices', description: 'Manage devices', href: '/devices', color: 'bg-[#078DEE]' },
  { icon: BarChart3, label: 'Mass Configure', description: 'Distribute accounts', href: '/mass-configure', color: 'bg-[#22C55E]' },
  { icon: Copy, label: 'Account Manager', description: 'Unassigned accounts', href: '/unassigned', color: 'bg-[#FFAB00]' },
  { icon: HardDrive, label: 'Backups', description: 'Restore backups', href: '/backups', color: 'bg-[#00B8D9]' },
]

export function QuickActions() {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-[#FFFFFF] mb-4">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="rounded-xl border border-[#333333] bg-[#28323D] p-4 hover:border-[#078DEE] hover:bg-[#1C252E] transition-all text-left group"
          >
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 text-white group-hover:scale-105 transition-transform`}>
              <action.icon size={20} />
            </div>
            <h4 className="text-[#FFFFFF] font-semibold text-sm">{action.label}</h4>
            <p className="text-xs text-[#919EAB] mt-0.5">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
