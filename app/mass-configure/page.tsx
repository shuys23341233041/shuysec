'use client'

import { toast } from 'sonner'
import { Sidebar } from '@/components/sidebar'
import { Settings, AlertCircle, Info, RefreshCw } from 'lucide-react'
import { useState, useMemo, useEffect, useCallback } from 'react'

interface Device {
  id: string
  name: string
  currentAccounts: number
}

export default function MassConfigurePage() {
  const [allDevices, setAllDevices] = useState<Device[]>([])
  const [unassignedAccounts, setUnassignedAccounts] = useState(0)
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const [distributionAmount, setDistributionAmount] = useState(5)
  const [fillToTarget, setFillToTarget] = useState(false)
  const [targetAmount, setTargetAmount] = useState(75)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const safeJson = (r: Response, fallback: unknown) =>
    r.text().then((t) => {
      if (!t.trim()) return fallback
      try {
        return JSON.parse(t) as unknown
      } catch {
        return fallback
      }
    })

  const refreshData = useCallback(() => {
    return Promise.all([
      fetch('/api/devices').then((r) => (r.ok ? safeJson(r, []) : [])),
      fetch('/api/accounts/unassigned').then((r) => (r.ok ? safeJson(r, []) : [])),
    ])
      .then(([devices, accounts]) => {
        setAllDevices(
          (Array.isArray(devices) ? devices : []).map((d: { id: string; name: string; total?: number }) => ({
            id: d.id,
            name: d.name,
            currentAccounts: d.total ?? 0,
          }))
        )
        setUnassignedAccounts(Array.isArray(accounts) ? accounts.length : 0)
      })
      .catch(() => {
        setAllDevices([])
        setUnassignedAccounts(0)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const selectedDevices = allDevices.filter((d) => selectedDeviceIds.includes(d.id))

  // Calculate distribution preview
  const distributionPreview = useMemo(() => {
    if (fillToTarget) {
      // Fill to target amount mode
      const devicesNeedingAccounts = selectedDevices.filter(d => d.currentAccounts < targetAmount)
      const totalNeeded = devicesNeedingAccounts.reduce((sum, d) => sum + (targetAmount - d.currentAccounts), 0)
      const canDistribute = totalNeeded <= unassignedAccounts

      return selectedDevices.map(device => ({
        deviceId: device.id,
        deviceName: device.name,
        current: device.currentAccounts,
        after: device.currentAccounts < targetAmount ? targetAmount : device.currentAccounts,
        willReceive: device.currentAccounts < targetAmount ? targetAmount - device.currentAccounts : 0,
        skipped: device.currentAccounts >= targetAmount,
      }))
    } else {
      // Fixed amount mode
      const canDistribute = distributionAmount * selectedDevices.length <= unassignedAccounts

      return selectedDevices.map(device => ({
        deviceId: device.id,
        deviceName: device.name,
        current: device.currentAccounts,
        after: device.currentAccounts + distributionAmount,
        willReceive: distributionAmount,
        skipped: false,
      }))
    }
  }, [selectedDeviceIds, fillToTarget, distributionAmount, targetAmount, unassignedAccounts, selectedDevices])

  const totalAccountsToDistribute = distributionPreview.reduce((sum, d) => sum + d.willReceive, 0)
  const hasEnoughAccounts = totalAccountsToDistribute <= unassignedAccounts
  const accountsRemaining = unassignedAccounts - totalAccountsToDistribute

  const [distributing, setDistributing] = useState(false)

  const handleDistribute = async () => {
    if (!hasEnoughAccounts || selectedDeviceIds.length === 0) return
    setDistributing(true)
    try {
      const res = await fetch('/api/accounts/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceIds: selectedDeviceIds,
          fillToTarget,
          targetAmount: fillToTarget ? targetAmount : undefined,
          countPerDevice: fillToTarget ? undefined : distributionAmount,
        }),
      })
      const data = (await res.json()) as { assigned?: { deviceId: string; accountIds: string[] }[]; totalAssigned?: number; error?: string }
      if (!res.ok) {
        toast.error(data.error || 'Distribution failed')
        return
      }
      const totalAssigned = data.totalAssigned ?? (data.assigned?.reduce((s, a) => s + (a.accountIds?.length ?? 0), 0) ?? 0)
      await refreshData()
      if (totalAssigned > 0) {
        toast.success('Distribution complete', { description: `Assigned ${totalAssigned} account(s) to ${data.assigned?.length ?? 0} device(s). Tool Click.py will sync to cookie.txt.` })
      } else {
        toast.warning('Nothing assigned', { description: 'No unassigned accounts or devices already at target. Add accounts in Unassigned first.' })
      }
    } catch {
      toast.error('Request failed')
    } finally {
      setDistributing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#141A21]">
      <Sidebar />

      <main className="overflow-auto min-h-screen bg-[#1C252E] transition-[margin] duration-300" style={{ marginLeft: 'var(--sidebar-width)' }}>
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Mass Configure Devices</h1>
              <p className="text-gray-400 text-sm">Assign accounts from Unassigned to devices (Tool Click.py syncs to cookie.txt)</p>
            </div>
            <button
              type="button"
              onClick={() => { setLoading(true); refreshData(); }}
              disabled={loading}
              className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all duration-300 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Loading skeleton */}
          {loading && allDevices.length === 0 && (
            <div className="space-y-6 animate-pulse">
              <div className="h-32 bg-slate-800/80 border border-slate-700/50 rounded-xl" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-64 bg-slate-800/80 border border-slate-700/50 rounded-xl" />
                <div className="h-64 bg-slate-800/80 border border-slate-700/50 rounded-xl" />
              </div>
            </div>
          )}

          {/* Account Distribution Section */}
          {(!loading || allDevices.length > 0) && (
          <div className="space-y-8">
            {/* Distribution Overview */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-600 to-blue-600 rounded-full"></div>
                Account Distribution
              </h2>

              {/* Flow Diagram */}
              <div className="flex items-center justify-between mb-8 p-6 bg-slate-900/50 rounded-lg border border-slate-700/30">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
                    {unassignedAccounts}
                  </div>
                  <p className="text-sm text-gray-400">Unassigned Accounts</p>
                </div>

                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="h-1 flex-1 bg-gradient-to-r from-cyan-600 to-transparent rounded-full"></div>
                  <span className="px-4 text-gray-400">→</span>
                  <div className="h-1 flex-1 bg-gradient-to-l from-cyan-600 to-transparent rounded-full"></div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
                    {selectedDevices.length}
                  </div>
                  <p className="text-sm text-gray-400">Selected Devices</p>
                </div>

                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="h-1 flex-1 bg-gradient-to-r from-cyan-600 to-transparent rounded-full"></div>
                  <span className="px-4 text-gray-400">→</span>
                  <div className="h-1 flex-1 bg-gradient-to-l from-cyan-600 to-transparent rounded-full"></div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
                    {fillToTarget ? targetAmount : distributionAmount}
                  </div>
                  <p className="text-sm text-gray-400">{fillToTarget ? 'Target per Device' : 'Accounts per Device'}</p>
                </div>
              </div>

              {/* Device Selection Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-3">Select Devices to Configure</label>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white hover:border-slate-600/50 transition-all duration-300 focus:outline-none focus:border-cyan-600/50 focus:ring-2 focus:ring-cyan-600/20"
                  >
                    <span className="text-left">
                      {selectedDeviceIds.length === 0
                        ? 'Select devices...'
                        : selectedDeviceIds.length === allDevices.length
                        ? 'All devices selected'
                        : `${selectedDeviceIds.length} device(s) selected`}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/50 rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b border-slate-700/30">
                        <button
                          onClick={() => {
                            if (selectedDeviceIds.length === allDevices.length) {
                              setSelectedDeviceIds([])
                            } else {
                              setSelectedDeviceIds(allDevices.map(d => d.id))
                            }
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/50 text-sm text-cyan-400 font-semibold transition-colors duration-200"
                        >
                          {selectedDeviceIds.length === allDevices.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {allDevices.map(device => (
                          <button
                            key={device.id}
                            onClick={() => {
                              setSelectedDeviceIds(prev =>
                                prev.includes(device.id)
                                  ? prev.filter(id => id !== device.id)
                                  : [...prev, device.id]
                              )
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors duration-200 border-b border-slate-700/30 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDeviceIds.includes(device.id)}
                              onChange={() => {}}
                              className="w-4 h-4 rounded cursor-pointer accent-cyan-600"
                            />
                            <div className="text-left flex-1">
                              <p className="text-white font-semibold">{device.name}</p>
                              <p className="text-xs text-gray-400">{device.currentAccounts} accounts</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {selectedDeviceIds.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedDevices.map(device => (
                      <div key={device.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-600/20 border border-cyan-500/30 rounded-lg">
                        <span className="text-sm text-cyan-300">{device.name}</span>
                        <button
                          onClick={() => setSelectedDeviceIds(prev => prev.filter(id => id !== device.id))}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Distribution Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Distribution Settings */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Settings size={20} className="text-cyan-400" />
                  Distribution Settings
                </h3>

                <div className="space-y-6">
                  {/* Toggle: Fill to Target */}
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
                    <div>
                      <p className="font-semibold text-white">Fill to Target Amount</p>
                      <p className="text-xs text-gray-400 mt-1">Automatically calculate distribution to reach target</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fillToTarget}
                        onChange={(e) => setFillToTarget(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-600/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>

                  {fillToTarget ? (
                    // Target Amount Input
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Target Amount per Device</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={targetAmount}
                        onChange={(e) => {
                          const num = parseInt(e.target.value) || 0
                          setTargetAmount(Math.max(1, num))
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600/50 focus:ring-2 focus:ring-cyan-600/20 transition-all duration-300"
                        placeholder="Enter target amount"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Devices with ≥ {targetAmount} accounts will be skipped
                      </p>
                    </div>
                  ) : (
                    // Fixed Amount Input
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Accounts Per Device</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={distributionAmount}
                        onChange={(e) => {
                          const num = parseInt(e.target.value) || 0
                          setDistributionAmount(Math.max(1, num))
                        }}
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600/50 focus:ring-2 focus:ring-cyan-600/20 transition-all duration-300"
                        placeholder="Enter number of accounts"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Each selected device will receive this many accounts
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Distribution Action & Summary */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Info size={20} className="text-blue-400" />
                  Distribution Action
                </h3>

                {/* Info Box */}
                <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    {fillToTarget
                      ? `This will distribute accounts to bring all selected devices to ${targetAmount} accounts`
                      : `This will add ${distributionAmount} accounts to each of the ${selectedDevices.length} selected device(s)`}
                  </p>
                </div>

                {/* Distribution Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">Accounts to distribute:</span>
                    <span className={`font-semibold ${hasEnoughAccounts ? 'text-green-400' : 'text-red-400'}`}>
                      {totalAccountsToDistribute}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">Devices affected:</span>
                    <span className="font-semibold text-white">{selectedDevices.filter(d => !distributionPreview.find(p => p.deviceId === d.id)?.skipped).length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">Accounts remaining:</span>
                    <span className="font-semibold text-white">{accountsRemaining}</span>
                  </div>
                </div>

                {!hasEnoughAccounts && (
                  <div className="mb-6 p-3 bg-red-600/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">Insufficient accounts. Need {totalAccountsToDistribute - unassignedAccounts} more.</p>
                  </div>
                )}

                {/* Distribute Button */}
                <button
                  onClick={handleDistribute}
                  disabled={loading || distributing || !hasEnoughAccounts || selectedDevices.length === 0}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    hasEnoughAccounts && selectedDevices.length > 0
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5 active:scale-95'
                      : 'bg-slate-700/50 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  {distributing ? 'Distributing…' : 'Distribute Accounts'}
                </button>
              </div>
            </div>

            {/* Selected Devices Preview */}
            {selectedDevices.length > 0 && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-6">Selected Devices ({selectedDevices.length})</h3>

                <div className="space-y-3">
                  {distributionPreview.map((preview) => (
                    <div
                      key={preview.deviceId}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${
                        preview.skipped
                          ? 'bg-slate-900/30 border-slate-700/30'
                          : 'bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-slate-600/50'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">{preview.deviceName}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {preview.current} accounts
                          {preview.willReceive > 0 && ` → ${preview.after} accounts`}
                          {preview.skipped && ' (Already at target)'}
                        </p>
                      </div>

                      {preview.willReceive > 0 && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">+{preview.willReceive}</p>
                          <p className="text-xs text-gray-400">to add</p>
                        </div>
                      )}

                      {preview.skipped && (
                        <div className="px-3 py-1 bg-amber-600/20 border border-amber-500/30 rounded-lg">
                          <p className="text-xs font-semibold text-amber-300">Skipped</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </main>
    </div>
  )
}
