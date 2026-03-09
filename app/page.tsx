'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { WelcomeHeader } from '@/components/welcome-header'
import { StatCard } from '@/components/stat-card'
import { ActivityChart } from '@/components/activity-chart'
import { RunningGames } from '@/components/running-games'
import { QuickActions } from '@/components/quick-actions'
import { Announcements } from '@/components/announcements'
import { Database, Users, CheckCircle, TrendingUp } from 'lucide-react'
import { safeJson } from '@/lib/safe-fetch'

const emptyStats = {
  totalDevices: undefined as number | undefined,
  totalAccounts: undefined as number | undefined,
  runningAccounts: undefined as number | undefined,
  uptimePercent: undefined as number | undefined,
}

export default function DashboardPage() {
  const [stats, setStats] = useState(emptyStats)
  const [isLoading, setIsLoading] = useState(true)
  const loadStats = useCallback(() => {
    setIsLoading(true)
    fetch('/api/stats')
      .then((r) => (r.ok ? safeJson<typeof emptyStats>(r, emptyStats) : emptyStats))
      .then((data) => { setStats(data ?? emptyStats); setIsLoading(false) })
      .catch(() => { setStats(emptyStats); setIsLoading(false) })
  }, [])
  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => {
    const onFocus = () => loadStats()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [loadStats])

  return (
    <div className="min-h-screen bg-[#141A21]">
      <Sidebar />
      <main className="ml-56 min-h-screen flex flex-col" style={{ background: 'var(--fs-gradient-content)' }}>
        <TopBar />
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <WelcomeHeader onRefresh={loadStats} isLoading={isLoading} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Database size={24} />}
              value={String(stats.totalDevices ?? '—')}
              label="Total Devices"
              iconBg="bg-gradient-to-br from-[#078DEE] to-[#00B8D9]"
              iconColor="text-white"
            />
            <StatCard
              icon={<Users size={24} />}
              value={String(stats.totalAccounts ?? '—')}
              label="Total Accounts"
              iconBg="bg-gradient-to-br from-[#22C55E] to-[#16a34a]"
              iconColor="text-white"
            />
            <StatCard
              icon={<CheckCircle size={24} />}
              value={String(stats.runningAccounts ?? '—')}
              label="Running Accounts"
              iconBg="bg-gradient-to-br from-[#00B8D9] to-[#078DEE]"
              iconColor="text-white"
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              value={stats.uptimePercent != null ? `${stats.uptimePercent}%` : '—'}
              label="Uptime"
              iconBg="bg-gradient-to-br from-[#FFAB00] to-[#ff8f00]"
              iconColor="text-white"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2">
              <ActivityChart />
            </div>
            <RunningGames />
          </div>

          {/* Autochange Activity */}
          <div className="rounded-xl border border-[#333333] bg-[#28323D] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#078DEE] flex items-center justify-center text-white">
                <Database size={18} />
              </div>
              <div>
                <h3 className="text-[#FFFFFF] font-semibold">Autochange Activity</h3>
                <p className="text-xs text-[#919EAB]">Exports by type over time</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg bg-[#1C252E] border border-[#333333]">
              <Database size={36} className="text-[#637381] mb-2" />
              <p className="text-sm text-[#919EAB]">No export data</p>
            </div>
          </div>

          <QuickActions />
          <Announcements />
        </div>
      </main>
    </div>
  )
}
