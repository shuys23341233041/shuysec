'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/sidebar'
import { Search, Plus, Grid3x3, List, Trash2 } from 'lucide-react'
import { DeviceActionMenu } from '@/components/device-action-menu'
import Link from 'next/link'

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

  const loadDevices = () => {
    fetch('/api/devices')
      .then((r) => r.json())
      .then(setDevices)
      .catch(() => setDevices([]))
  }

  useEffect(() => {
    loadDevices()
  }, [])

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.model.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedDevices = filteredDevices.slice(startIdx, startIdx + itemsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      <Sidebar />

      <main className="ml-56 overflow-auto min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Devices</h1>
                <p className="text-gray-400">Manage and monitor all your farm devices</p>
              </div>
              <button
                onClick={() => {
                  setAddCount(1)
                  setAddError('')
                  setShowAddModal(true)
                }}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5 font-semibold"
              >
                <Plus size={20} />
                Add Device
              </button>
            </div>

            {/* Modal: Add devices — count only, auto names Device 1, 2... random key */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => !addLoading && setShowAddModal(false)}>
                <div
                  className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-xl max-w-md w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-white mb-1">Add devices</h3>
                  <p className="text-sm text-gray-400 mb-6">Names auto: Device 1, Device 2, ... Each device key is generated randomly.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Number of devices to add</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={addCount}
                        onChange={(e) => setAddCount(Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                        className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    {addError && <p className="text-sm text-red-400">{addError}</p>}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => !addLoading && setShowAddModal(false)}
                      className="flex-1 py-2.5 px-4 rounded-lg border border-slate-600 text-gray-400 hover:bg-slate-700/50 transition-colors"
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
                      className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {addLoading ? 'Adding...' : `Add ${addCount} device(s)`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Confirm delete device */}
            {deviceToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => !deleteLoading && setDeviceToDelete(null)}>
                <div
                  className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-xl max-w-md w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                      <Trash2 className="text-red-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Delete device</h3>
                      <p className="text-sm text-gray-400">This action cannot be undone</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Are you sure you want to delete device <strong className="text-white">&quot;{deviceToDelete.name}&quot;</strong>? Assigned accounts will be moved back to Unassigned.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => !deleteLoading && setDeviceToDelete(null)}
                      className="flex-1 py-2.5 px-4 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-700/50 transition-colors"
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
                      className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors duration-300"
                />
              </div>

              <div className="flex items-center gap-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedDevices.map((device) => (
                  <div key={device.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/60 hover:-translate-y-1 group">
                    {/* Header: tên + model + menu */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-white truncate">{device.name}</h3>
                        <p className="text-sm text-gray-400">{device.model}</p>
                      </div>
                      <DeviceActionMenu
                        deviceId={device.id}
                        deviceName={device.name}
                        onDelete={(id, name) => setDeviceToDelete({ id, name })}
                      />
                    </div>

                    {/* Status + Total accounts */}
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${device.status === 'connected' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${device.status === 'connected' ? 'bg-green-400' : 'bg-red-400'}`} />
                        {device.status === 'connected' ? 'Connected' : 'Disconnected'}
                      </span>
                      <span className="text-gray-500">·</span>
                      <span className="text-sm text-gray-400">
                        <span className="text-white font-semibold">{device.total}</span> account(s)
                      </span>
                    </div>

                    <Link
                      href={`/devices/${device.id}`}
                      className="block w-full py-2.5 px-4 bg-slate-700/50 hover:bg-cyan-600/20 border border-slate-600/50 hover:border-cyan-500/50 text-cyan-400 rounded-lg font-semibold text-sm transition-all duration-300 text-center group-hover:text-cyan-300"
                    >
                      View details →
                    </Link>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* List View */
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-900/50">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Device</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Model</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total accounts</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDevices.map((device) => (
                      <tr key={device.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-200">
                        <td className="px-5 py-3.5 text-sm font-medium text-white">{device.name}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-400">{device.model}</td>
                        <td className="px-5 py-3.5 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${device.status === 'connected' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${device.status === 'connected' ? 'bg-green-400' : 'bg-red-400'}`} />
                            {device.status === 'connected' ? 'Connected' : 'Disconnected'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-white font-medium">{device.total}</td>
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredDevices.length)} of {filteredDevices.length} devices
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-gray-400 disabled:opacity-50 hover:border-slate-600/50 transition-colors duration-300"
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
                      className={`px-3 py-2 rounded-lg transition-all duration-300 ${currentPage === pageNum ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800 border border-slate-700/50 text-gray-400 hover:border-slate-600/50'}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700/50 text-gray-400 disabled:opacity-50 hover:border-slate-600/50 transition-colors duration-300"
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
