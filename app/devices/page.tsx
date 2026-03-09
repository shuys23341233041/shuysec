'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/sidebar'
import { Search, Plus, Grid3x3, List, Trash2, RefreshCw } from 'lucide-react'
import { DeviceActionMenu } from '@/components/device-action-menu'
import Link from 'next/link'
import { safeJson } from '@/lib/safe-fetch'
import { useDebounce } from '@/hooks/use-debounce'

interface Device {
  id: string
  name: string
  model: string
  status: 'connected' | 'disconnected'
  enabled: boolean
  assetId: string
  daysLeft: number
  total: number
  active: number
  inactive: number
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [showAddModal, setShowAddModal] = useState(false)
  const [addCount, setAddCount] = useState(1)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [deviceToDelete, setDeviceToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const debouncedSearch = useDebounce(searchQuery, 300)

  const loadDevices = useCallback(() => {
    setIsLoading(true)
    fetch('/api/devices')
      .then((r) => (r.ok ? safeJson<Device[]>(r, []) : []))
      .then((data) => { setDevices(Array.isArray(data) ? data : []); setIsLoading(false) })
      .catch(() => { setDevices([]); setIsLoading(false) })
  }, [])

  useEffect(() => { loadDevices() }, [loadDevices])
  useEffect(() => {
    const onFocus = () => loadDevices()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [loadDevices])

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      device.model.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedDevices = filteredDevices.slice(startIdx, startIdx + itemsPerPage)

  return (
    <div className="min-h-screen bg-[#141A21]">
      <Sidebar />

      <main className="ml-56 overflow-auto min-h-screen bg-[#1C252E]">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-[#FFFFFF] mb-2">Devices</h1>
                <p className="text-[#919EAB]">Manage and monitor all your farm devices</p>
              </div>
              <button
                onClick={() => {
                  setAddCount(1)
                  setAddError('')
                  setShowAddModal(true)
                }}
                className="bg-[#078DEE] hover:bg-[#68CDF9] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-semibold border border-[#078DEE]"
              >
                <Plus size={20} />
                Add Device
              </button>
            </div>

            {/* Modal: Add devices — count only, auto names Device 1, 2... random key */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60" onClick={() => !addLoading && setShowAddModal(false)}>
                <div
                  className="bg-[#28323D] border border-[#333333] rounded-xl shadow-xl max-w-md w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-[#FFFFFF] mb-1">Add devices</h3>
                  <p className="text-sm text-[#919EAB] mb-6">Names auto: Device 1, Device 2, ... Each device key is generated randomly.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#919EAB] mb-2">Number of devices to add</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={addCount}
                        onChange={(e) => setAddCount(Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                        className="w-full bg-[#1C252E] border border-[#333333] rounded-lg px-4 py-3 text-[#FFFFFF] placeholder-[#808080] focus:outline-none focus:border-[#078DEE]"
                      />
                    </div>
                    {addError && <p className="text-sm text-[#FF5630]">{addError}</p>}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => !addLoading && setShowAddModal(false)}
                      className="flex-1 py-2.5 px-4 rounded-lg border border-[#333333] text-[#919EAB] hover:bg-[#1C252E] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={addLoading}
                      onClick={async () => {
                        setAddLoading(true)
                        setAddError('')
                        try {
                          const res = await fetch('/api/devices', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ count: addCount }),
                          })
                          const data = await res.json()
                          if (data.error) {
                            setAddError(data.error)
                            return
                          }
                          const list = data.devices ?? []
                          if (list.length > 0) {
                            setDevices((prev) => [
                              ...prev,
                              ...list.map((d: { id: string; device_name: string }) => ({
                                id: d.id,
                                name: d.device_name,
                                model: 'LDPlayer',
                                status: 'disconnected' as const,
                                enabled: true,
                                assetId: '',
                                daysLeft: 0,
                                total: 0,
                                active: 0,
                                inactive: 0,
                              })),
                            ])
                            setShowAddModal(false)
                            if (list[0].device_key) navigator.clipboard.writeText(list[0].device_key)
                            toast.success(`Added ${list.length} device(s)`, { description: list.length === 1 ? 'First device key copied to clipboard.' : `Devices 1–${list.length}: first device key copied.` })
                          }
                        } finally {
                          setAddLoading(false)
                        }
                      }}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-[#078DEE] text-white font-semibold hover:bg-[#68CDF9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {addLoading ? 'Adding...' : `Add ${addCount} device(s)`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Confirm delete device */}
            {deviceToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60" onClick={() => !deleteLoading && setDeviceToDelete(null)}>
                <div
                  className="bg-[#28323D] border border-[#333333] rounded-xl shadow-xl max-w-md w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-[#FF5630]/20 border border-[#FF5630]/40">
                      <Trash2 className="text-[#FF5630]" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#FFFFFF]">Delete device</h3>
                      <p className="text-sm text-[#919EAB]">This action cannot be undone</p>
                    </div>
                  </div>
                  <p className="text-[#919EAB] mb-6">
                    Are you sure you want to delete device <strong className="text-[#FFFFFF]">&quot;{deviceToDelete.name}&quot;</strong>? Assigned accounts will be moved back to Unassigned.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => !deleteLoading && setDeviceToDelete(null)}
                      className="flex-1 py-2.5 px-4 rounded-lg border border-[#333333] text-[#919EAB] hover:bg-[#1C252E] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!deviceToDelete) return
                        setDeleteLoading(true)
                        try {
                          const res = await fetch(`/api/devices/${deviceToDelete.id}`, { method: 'DELETE' })
                          if (!res.ok) {
                            const data = await res.json().catch(() => ({}))
                            toast.error(data.error ?? 'Failed to delete device')
                            return
                          }
                          setDevices((prev) => prev.filter((d) => d.id !== deviceToDelete.id))
                          setDeviceToDelete(null)
                          toast.success('Device deleted')
                        } finally {
                          setDeleteLoading(false)
                        }
                      }}
                      disabled={deleteLoading}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-[#FF5630] hover:bg-[#FF5630]/90 text-white font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Search & Controls */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#637381]" size={20} />
                <input
                  type="text"
                  placeholder="Search by device name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full bg-[#28323D] border border-[#333333] rounded-lg pl-12 pr-4 py-3 text-[#FFFFFF] placeholder-[#808080] focus:outline-none focus:border-[#078DEE] transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={loadDevices}
                disabled={isLoading}
                className="p-2.5 rounded-lg bg-[#28323D] border border-[#333333] text-[#919EAB] hover:text-[#68CDF9] hover:border-[#078DEE] transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <div className="flex items-center gap-0.5 bg-[#28323D] border border-[#333333] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#078DEE] text-white' : 'text-[#919EAB] hover:text-[#FFFFFF]'}`}
                  title="Grid view"
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#078DEE] text-white' : 'text-[#919EAB] hover:text-[#FFFFFF]'}`}
                  title="List view"
                >
                  <List size={20} />
                </button>
              </div>
            </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#28323D] border border-[#333333] rounded-xl p-6 animate-pulse">
                  <div className="flex justify-between mb-4">
                    <div className="h-5 bg-[#333333] rounded w-1/3" />
                    <div className="h-8 w-8 bg-[#333333] rounded" />
                  </div>
                  <div className="h-4 bg-[#333333] rounded w-2/3 mb-4" />
                  <div className="h-10 bg-[#333333] rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Grid View */}
          {!isLoading && viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedDevices.map((device) => (
                  <div key={device.id} className="bg-[#28323D] border border-[#333333] rounded-xl p-6 hover:border-[#637381] transition-colors group">
                    {/* Header: tên + model + menu */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-[#FFFFFF] truncate">{device.name}</h3>
                        <p className="text-sm text-[#919EAB]">{device.model}</p>
                      </div>
                      <DeviceActionMenu
                        deviceId={device.id}
                        deviceName={device.name}
                        onDelete={(id, name) => setDeviceToDelete({ id, name })}
                      />
                    </div>

                    {/* Status tags: Available, Connected, Enabled, Days Left */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#333333] text-[#919EAB]">
                        Available
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${device.status === 'connected' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#FF5630]/20 text-[#FF5630]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'connected' ? 'bg-[#22C55E]' : 'bg-[#FF5630]'}`} />
                        {device.status === 'connected' ? 'Connected' : 'Disconnected'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#22C55E]/20 text-[#22C55E]">
                        Enabled
                      </span>
                      {device.daysLeft > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#00B8D9]/20 text-[#00B8D9]">
                          {device.daysLeft} Days Left
                        </span>
                      )}
                    </div>

                    {/* Stats: Total / Active / Inactive */}
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <span className="text-[#FFFFFF]"><span className="font-semibold">{device.total}</span> Total</span>
                      <span className="text-[#22C55E]"><span className="font-semibold">{device.active}</span> Active</span>
                      <span className="text-[#FF5630]"><span className="font-semibold">{device.inactive}</span> Inactive</span>
                    </div>

                    <Link
                      href={`/devices/${device.id}`}
                      className="block w-full py-2.5 px-4 bg-[#1C252E] hover:bg-[#078DEE] border border-[#333333] hover:border-[#078DEE] text-[#68CDF9] hover:text-white rounded-lg font-semibold text-sm transition-colors text-center"
                    >
                      View details →
                    </Link>
                  </div>
                ))}
              </div>
            </>
          ) : !isLoading ? (
            /* List View */
            <div className="bg-[#28323D] border border-[#333333] rounded-xl overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#333333] bg-[#1C252E]">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#919EAB] uppercase tracking-wider">Device</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#919EAB] uppercase tracking-wider">Model</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#919EAB] uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#919EAB] uppercase tracking-wider">Total accounts</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#919EAB] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDevices.map((device) => (
                      <tr key={device.id} className="border-b border-[#333333] hover:bg-[#1C252E] transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-[#FFFFFF]">{device.name}</td>
                        <td className="px-5 py-3.5 text-sm text-[#919EAB]">{device.model}</td>
                        <td className="px-5 py-3.5 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${device.status === 'connected' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#FF5630]/20 text-[#FF5630]'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${device.status === 'connected' ? 'bg-[#22C55E]' : 'bg-[#FF5630]'}`} />
                            {device.status === 'connected' ? 'Connected' : 'Disconnected'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#FFFFFF] font-medium">{device.total}</td>
                        <td className="px-5 py-3.5 text-right">
                          <DeviceActionMenu
                            deviceId={device.id}
                            deviceName={device.name}
                            onDelete={(id, name) => setDeviceToDelete({ id, name })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-[#919EAB]">
                Showing {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredDevices.length)} of {filteredDevices.length} devices
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-[#28323D] border border-[#333333] text-[#919EAB] disabled:opacity-50 hover:border-[#078DEE] hover:text-[#68CDF9] transition-colors"
                >
                  ←
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i
                  }
                  if (pageNum > totalPages) return null
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNum ? 'bg-[#078DEE] text-white' : 'bg-[#28323D] border border-[#333333] text-[#919EAB] hover:border-[#078DEE]'}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-[#28323D] border border-[#333333] text-[#919EAB] disabled:opacity-50 hover:border-[#078DEE] hover:text-[#68CDF9] transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
