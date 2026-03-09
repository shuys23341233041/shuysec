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
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const SIDEBAR_STORAGE_KEY = 'sHuysSec-sidebar-collapsed'
const SIDEBAR_WIDTH_EXPANDED = '14rem'
const SIDEBAR_WIDTH_COLLAPSED = '4.5rem' // 72px

const SidebarLink = ({
  icon: Icon,
  label,
  href,
  collapsed,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  href: string
  collapsed: boolean
}) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-lg text-sm font-medium transition-all duration-200 ${
        collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
      } ${
        isActive
          ? 'text-white shadow-md'
          : 'text-[#919EAB] hover:text-white hover:bg-[#28323D]'
      }`}
      style={isActive ? { background: 'var(--fs-gradient-primary)' } : undefined}
    >
      <Icon size={22} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}

const SectionLabel = ({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) => {
  if (collapsed) return null
  return (
    <p className="px-3 mt-5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#637381]">
      {children}
    </p>
  )
}

export function Sidebar() {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dbRequired, setDbRequired] = useState<boolean | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      setCollapsed(stored === 'true')
    } catch {
      setCollapsed(false)
    }
  }, [])

  useEffect(() => {
    const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED
    document.documentElement.style.setProperty('--sidebar-width', width)
  }, [collapsed])

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      } catch {}
      return next
    })
  }

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
    <aside
      className="fixed left-0 top-0 h-screen z-[var(--zIndex-drawer)] flex flex-col border-r border-[#28323D] transition-[width] duration-300 overflow-hidden backdrop-blur-xl"
      style={{
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        background: 'var(--fs-gradient-sidebar)',
        transitionTimingFunction: 'var(--transitions-easing-easeInOut)',
        boxShadow: 'var(--customShadows-card)',
      }}
    >
      {/* Logo */}
      <div className="flex shrink-0 items-center border-b border-[#28323D] p-3 min-h-[4rem]">
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg shrink-0"
            style={{ background: 'var(--fs-gradient-primary)' }}
          >
            <span className="text-white text-sm font-bold">sH</span>
          </div>
          {!collapsed && (
            <span className="text-[#FFFFFF] font-semibold tracking-tight truncate">sHuysSec</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        <SectionLabel collapsed={collapsed}>Overview</SectionLabel>
        <div className="space-y-0.5">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" href="/" collapsed={collapsed} />
        </div>

        <SectionLabel collapsed={collapsed}>Management</SectionLabel>
        <div className="space-y-0.5">
          <SidebarLink icon={Database} label="Devices" href="/devices" collapsed={collapsed} />
          <SidebarLink icon={BarChart3} label="Mass Configure" href="/mass-configure" collapsed={collapsed} />
        </div>

        <SectionLabel collapsed={collapsed}>Accounts</SectionLabel>
        <div className="space-y-0.5">
          <SidebarLink icon={Copy} label="Account Manager" href="/unassigned" collapsed={collapsed} />
        </div>

        <SectionLabel collapsed={collapsed}>Storage</SectionLabel>
        <div className="space-y-0.5">
          <SidebarLink icon={HardDrive} label="Backups" href="/backups" collapsed={collapsed} />
        </div>

        {isAdmin && (
          <>
            <SectionLabel collapsed={collapsed}>Admin</SectionLabel>
            <div className="space-y-0.5">
              <SidebarLink icon={Users} label="User management" href="/admin/users" collapsed={collapsed} />
            </div>
          </>
        )}
      </nav>

      {/* Toggle + Logout */}
      <div className="shrink-0 p-2 border-t border-[#28323D] space-y-0.5">
        <button
          type="button"
          onClick={toggleSidebar}
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          className={`w-full flex items-center rounded-lg text-[#919EAB] hover:text-white hover:bg-[#28323D] transition-colors ${
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
          }`}
        >
          {collapsed ? <PanelLeft size={22} /> : <PanelLeftClose size={20} />}
          {!collapsed && <span className="text-sm font-medium">Thu gọn</span>}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? 'Log out' : undefined}
          className={`w-full flex items-center rounded-lg text-sm font-medium text-[#919EAB] hover:text-[#FF5630] hover:bg-[#FF5630]/10 transition-colors disabled:opacity-50 ${
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <LogOut size={collapsed ? 22 : 18} className="shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>}
        </button>
      </div>
    </aside>
  )
}
