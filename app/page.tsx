'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { WelcomeHeader } from '@/components/welcome-header'
import { StatCard } from '@/components/stat-card'
import { ActivityChart } from '@/components/activity-chart'
import { RunningGames } from '@/components/running-games'
import { QuickActions } from '@/components/quick-actions'
import { Announcements } from '@/components/announcements'
import { Database, Users, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      <Sidebar />
      
      <main className="ml-56 overflow-auto min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <WelcomeHeader />
            <button
              type="button"
              onClick={loadStats}
              disabled={isLoading}
              className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all disabled:opacity-50"
              title="Refresh stats"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard 
              icon={<Database size={24} />}
              value={String(stats.totalDevices ?? '—')}
              label="Total Devices"
              bgColor="bg-blue-600"
              iconColor="text-blue-400"
            />
            <StatCard 
              icon={<Users size={24} />}
              value={String(stats.totalAccounts ?? '—')}
              label="Total Accounts"
              bgColor="bg-cyan-600"
              iconColor="text-cyan-400"
            />
            <StatCard 
              icon={<CheckCircle size={24} />}
              value={String(stats.runningAccounts ?? '—')}
              label="Running Accounts"
              bgColor="bg-green-600"
              iconColor="text-green-400"
            />
            <StatCard 
              icon={<TrendingUp size={24} />}
              value={stats.uptimePercent != null ? `${stats.uptimePercent}%` : '—'}
              label="Uptime"
              bgColor="bg-orange-600"
              iconColor="text-orange-400"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2">
              <ActivityChart />
            </div>
            <RunningGames />
          </div>

          {/* Autocharge Activity */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 mb-6 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Database size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Autocharge Activity</h3>
                <p className="text-xs text-gray-400">Exports by type over time</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-3 ring-1 ring-slate-600/30">
                <Database size={32} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-400">No export data</p>
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Announcements */}
          <Announcements />
        </div>
      </main>
    </div>
  )
}
