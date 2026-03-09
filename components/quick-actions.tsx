'use client'

import Link from 'next/link'
import { Database, BarChart3, Copy, HardDrive } from 'lucide-react'

const actions = [
  { icon: Database, label: 'Devices', description: 'Manage devices', href: '/devices', color: 'bg-gradient-to-br from-[#078DEE] to-[#00B8D9]' },
  { icon: BarChart3, label: 'Mass Configure', description: 'Distribute accounts', href: '/mass-configure', color: 'bg-gradient-to-br from-[#22C55E] to-[#16a34a]' },
  { icon: Copy, label: 'Account Manager', description: 'Unassigned accounts', href: '/unassigned', color: 'bg-gradient-to-br from-[#FFAB00] to-[#ff8f00]' },
  { icon: HardDrive, label: 'Backups', description: 'Restore backups', href: '/backups', color: 'bg-gradient-to-br from-[#00B8D9] to-[#078DEE]' },
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
            className="rounded-xl border border-[#333333] p-4 hover:border-[#078DEE] transition-all text-left group shadow-lg hover:shadow-[#078DEE]/10"
            style={{ background: 'var(--fs-gradient-card)' }}
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
