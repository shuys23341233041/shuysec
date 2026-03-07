'use client'

import { useState, useEffect } from 'react'
import { LayoutDashboard, BarChart3, Database, Copy, HardDrive, LogOut, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const SidebarLink = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 group ${isActive ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-gray-100 hover:bg-slate-800/60'}`}>
      <Icon size={20} className="group-hover:scale-110 transition-transform duration-300" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

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
    <div className="fixed left-0 top-0 w-56 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 flex flex-col h-screen z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-850">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-white text-xs font-bold">sH</span>
          </div>
          <span className="text-white font-semibold tracking-tight">sHuysSec</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        <div className="px-2 py-1 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">Main</p>
        </div>
        
        <SidebarLink icon={LayoutDashboard} label="Dashboard" href="/" />
        {/* <SidebarLink icon={BarChart3} label="Buy License" href="/buy-license" /> */}

        <div className="px-2 py-3 mt-6 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">Management</p>
        </div>

        <SidebarLink icon={Database} label="Devices" href="/devices" />
        {/* <SidebarLink icon={Zap} label="Scripts" href="/scripts" /> */}
        {/* <SidebarLink icon={Settings} label="Configs" href="/configs" /> */}
        <SidebarLink icon={BarChart3} label="Mass Configure" href="/mass-configure" />

        <div className="px-2 py-3 mt-6 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">Accounts</p>
        </div>

        {/* <SidebarLink icon={LayoutDashboard} label="Search Accounts" href="/search-accounts" /> */}
        <SidebarLink icon={Copy} label="Unassigned" href="/unassigned" />
        {/* <SidebarLink icon={Copy} label="Replace Cookie" href="/replace-cookie" /> */}

        <div className="px-2 py-3 mt-6 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">Storage</p>
        </div>

        <SidebarLink icon={HardDrive} label="Backups" href="/backups" />

        {isAdmin && (
          <>
            <div className="px-2 py-3 mt-6 mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Admin</p>
            </div>
            <SidebarLink icon={Users} label="User management" href="/admin/users" />
          </>
        )}
      </div>

      {/* Footer: Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">{loggingOut ? 'Logging out...' : 'Log out'}</span>
        </button>
      </div>
    </div>
  )
}
