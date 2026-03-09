'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  BarChart3,
  Database,
  Copy,
  HardDrive,
  LogOut,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const SidebarLink = ({
  icon: Icon,
  label,
  href,
}: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; href: string }) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-[#078DEE] text-white'
          : 'text-[#919EAB] hover:text-white hover:bg-[#28323D]'
      }`}
    >
      <Icon size={20} className="shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="px-3 mt-5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#637381]">
    {children}
  </p>
)

export function Sidebar() {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dbRequired, setDbRequired] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setIsAdmin(data?.role === 'admin'))
      .catch(() => setIsAdmin(false))
  }, [])

  useEffect(() => {
    fetch('/api/db-status')
      .then((r) => r.json())
      .then((data: { ok?: boolean; database?: string }) => {
        setDbRequired(data?.ok !== true || data?.database === 'not_configured')
      })
      .catch(() => setDbRequired(true))
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }

  if (dbRequired === true) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-6">
        <div className="max-w-md rounded-xl border border-amber-500/40 bg-slate-900 p-8 text-center">
          <h2 className="text-xl font-bold text-amber-400 mb-2">Database connection required</h2>
          <p className="text-gray-400 text-sm mb-4">
            This app runs only with MySQL. Set <strong className="text-gray-300">DATABASE_URL</strong> in Vercel Environment Variables (e.g. <code className="text-cyan-400 text-xs">mysql://user:pass@host:3306/dbname</code>).
          </p>
          <p className="text-gray-500 text-xs">See scripts/VIETNIX-DATABASE.md for setup.</p>
        </div>
      </div>
    )
  }

  return (
    <aside className="fixed left-0 top-0 w-56 h-screen z-50 flex flex-col bg-[#141A21] border-r border-[#28323D]">
      {/* Logo */}
      <div className="p-4 border-b border-[#28323D]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#078DEE] flex items-center justify-center">
            <span className="text-white text-sm font-bold">sH</span>
          </div>
          <span className="text-[#FFFFFF] font-semibold tracking-tight">sHuysSec</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <SectionLabel>Overview</SectionLabel>
        <div className="space-y-0.5">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" href="/" />
          {/* <SidebarLink icon={CreditCard} label="Buy License" href="/buy-license" /> */}
        </div>

        <SectionLabel>Management</SectionLabel>
        <div className="space-y-0.5">
          <SidebarLink icon={Database} label="Devices" href="/devices" />
          <SidebarLink icon={BarChart3} label="Mass Configure" href="/mass-configure" />
        </div>

        <SectionLabel>Accounts</SectionLabel>
        <div className="space-y-0.5">
          <SidebarLink icon={Copy} label="Account Manager" href="/unassigned" />
        </div>

        <SectionLabel>Storage</SectionLabel>
        <div className="space-y-0.5">
          <SidebarLink icon={HardDrive} label="Backups" href="/backups" />
        </div>

        {isAdmin && (
          <>
            <SectionLabel>Admin</SectionLabel>
            <div className="space-y-0.5">
              <SidebarLink icon={Users} label="User management" href="/admin/users" />
            </div>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#28323D]">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#919EAB] hover:text-[#FF5630] hover:bg-[#FF5630]/10 transition-colors disabled:opacity-50"
        >
          <LogOut size={18} className="shrink-0" />
          <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>
        </button>
      </div>
    </aside>
  )
}
