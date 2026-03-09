'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { ArrowLeft, Upload, Eye, EyeOff, Copy, Key, Edit2, Power, AlertCircle, CheckCircle2, MoreVertical, RefreshCw } from 'lucide-react'
import { safeJson } from '@/lib/safe-fetch'

interface DeviceData {
  id: string
  name: string
  device_key?: string
  status: string
  connected?: boolean
  enabled: boolean
  lastSeen: string | null
  type: string
  version: string
  total: number
  stats?: { cpu?: number; ram_mb?: number; uptime_seconds?: number }
  accounts: { id: string; username: string; password: string; cookie: string; privateServerLink?: string }[]
}

export default function DeviceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const deviceId = params.id as string

  const [device, setDevice] = useState<DeviceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isDragging, setIsDragging] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [showCookies, setShowCookies] = useState<Record<string, boolean>>({})

  const loadDevice = useCallback(() => {
    if (!deviceId) return
    setIsLoading(true)
    fetch(`/api/devices/${deviceId}`)
      .then((r) => (r.ok ? safeJson<DeviceData | null>(r, null) : Promise.resolve(null)))
      .then((d) => { setDevice(d ?? null); setIsLoading(false) })
      .catch(() => { setDevice(null); setIsLoading(false) })
  }, [deviceId])

  useEffect(() => { loadDevice() }, [loadDevice])

  const accounts = device?.accounts ?? []
  const connected = device?.status === 'connected'

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const copyDeviceKey = () => {
    if (device?.device_key) {
      navigator.clipboard.writeText(device.device_key)
      toast.success('Device key copied', { description: 'Paste into Tool/Click.py key.txt' })
    }
  }

  if (isLoading || device === null) {
    return (
      <div className="min-h-screen bg-[#141A21]">
        <Sidebar />
        <main className="overflow-auto min-h-screen flex flex-col items-center justify-center gap-4 bg-[#1C252E] transition-[margin] duration-300" style={{ marginLeft: 'var(--sidebar-width)' }}>
          {isLoading ? (
            <>
              <RefreshCw size={32} className="text-cyan-500 animate-spin" />
              <p className="text-gray-400">Loading device...</p>
            </>
          ) : (
            <>
              <p className="text-gray-400">Device not found</p>
              <button
                type="button"
                onClick={() => router.push('/devices')}
                className="px-4 py-2 rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600 transition-colors"
              >
                Back to devices
              </button>
            </>
          )}
        </main>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'settings', label: 'Settings' },
    { id: 'accounts', label: 'Accounts' },
  ]

  const statusColor = device.enabled ? 'text-green-400' : 'text-red-400'
  const statusBg = device.enabled ? 'bg-green-500/10' : 'bg-red-500/10'
  const connectedStatus = connected ? 'Connected' : 'Disconnected'

  return (
    <div className="min-h-screen bg-[#141A21]">
      <Sidebar />
      
      <main className="overflow-auto min-h-screen bg-[#1C252E] transition-[margin] duration-300" style={{ marginLeft: 'var(--sidebar-width)' }}>
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{device.name}</h1>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${statusBg} ${statusColor}`}>
                    {device.enabled ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {device.enabled ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-gray-400 text-sm">ID: {device.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={loadDevice} className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-all text-gray-400 hover:text-cyan-300" title="Refresh">
                  <RefreshCw size={20} />
                </button>
                <button className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-all text-gray-400 hover:text-cyan-300" title="View">
                  <Eye size={20} />
                </button>
                <button onClick={copyDeviceKey} className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-all text-gray-400 hover:text-cyan-300" title="Copy Key">
                  <Copy size={20} />
                </button>
                <button className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-all text-gray-400 hover:text-amber-300" title="Reset Key">
                  <Key size={20} />
                </button>
                <button className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-all text-gray-400 hover:text-blue-300" title="Edit">
                  <Edit2 size={20} />
                </button>
                <button className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-all text-gray-400 hover:text-red-400" title="Stop">
                  <Power size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">File Upload</h3>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs font-medium bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 rounded-lg transition-colors">
                  Proxy Test
                </button>
              </div>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                isDragging ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-600/50 hover:border-slate-500/50 bg-slate-800/30'
              }`}
            >
              <Upload className="mx-auto mb-3 text-gray-500" size={32} />
              <p className="text-gray-400 text-sm mb-1">Drop files here or click to upload</p>
              <p className="text-xs text-gray-500">Supported files: .zip, .tar, .gz</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex items-center gap-1 border-b border-slate-700/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'text-cyan-400 border-cyan-500'
                      : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Device Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Device Type</p>
                  <p className="text-white font-medium">{device.type}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Version</p>
                  <p className="text-white font-medium">{device.version}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <p className={`font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
                    {connectedStatus}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Last Seen</p>
                  <p className="text-white font-medium text-sm">{device.lastSeen ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Accounts</p>
                  <p className="text-white font-medium">{device.total}</p>
                </div>
                {device.stats && (
                  <>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">CPU</p>
                      <p className="text-white font-medium">{device.stats.cpu != null ? `${device.stats.cpu}%` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">RAM</p>
                      <p className="text-white font-medium">{device.stats.ram_mb != null ? `${Math.round(device.stats.ram_mb)} MB` : '—'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Device Settings</h3>
              <p className="text-gray-400">Settings configuration will appear here.</p>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-900/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cookie</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Private Server</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          No accounts yet. Use Mass Configure to assign accounts from Unassigned to this device.
                        </td>
                      </tr>
                    ) : (
                      accounts.map((account) => (
                        <tr key={account.id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors group">
                          <td className="px-6 py-4 text-sm text-white font-medium font-mono">{account.username}</td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 font-mono">
                                {showPasswords[account.id] ? account.password : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowPasswords((p) => ({ ...p, [account.id]: !p[account.id] }))}
                                className="p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                title={showPasswords[account.id] ? 'Hide' : 'Show'}
                              >
                                {showPasswords[account.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2 max-w-xs">
                              <span className="text-gray-400 font-mono truncate" title={showCookies[account.id] ? account.cookie : undefined}>
                                {account.cookie
                                  ? showCookies[account.id]
                                    ? account.cookie
                                    : `${account.cookie.slice(0, 24)}...`
                                  : '—'}
                              </span>
                              {account.cookie && (
                                <button
                                  type="button"
                                  onClick={() => setShowCookies((c) => ({ ...c, [account.id]: !c[account.id] }))}
                                  className="p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                  title={showCookies[account.id] ? 'Hide' : 'Show'}
                                >
                                  {showCookies[account.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {account.privateServerLink ? (
                              <a href={account.privateServerLink} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate inline-block max-w-[200px]">
                                {account.privateServerLink}
                              </a>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative flex justify-center">
                              <button
                                type="button"
                                onClick={() => setOpenMenuId(openMenuId === account.id ? null : account.id)}
                                className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-gray-400 hover:text-gray-300"
                              >
                                <MoreVertical size={16} />
                              </button>
                              {openMenuId === account.id && (
                                <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(account.cookie)
                                      setOpenMenuId(null)
                                      toast.success('Cookie copied')
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700/50 first:rounded-t-lg"
                                  >
                                    Copy cookie
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(account.password)
                                      setOpenMenuId(null)
                                      toast.success('Password copied')
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700/50"
                                  >
                                    Copy password
                                  </button>
                                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700/50 last:rounded-b-lg">
                                    Details
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/50">
                <p className="text-xs text-gray-500">
                  Displaying {accounts.length === 0 ? '0' : `1–${accounts.length}`} of {device.total} accounts (sync via Tool Click.py → cookie.txt)
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
