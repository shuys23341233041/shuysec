'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/sidebar'
import { Cloud, Download, RotateCcw, Trash2, HardDrive, Plus } from 'lucide-react'

interface Backup {
  id: string
  filename: string
  format: 'MuMu Player' | 'LDPlayer'
  fileSize: string
  created: string
  updated: string
}

interface DeviceOption {
  id: string
  name: string
}

const loadBackups = () =>
  fetch('/api/backups')
    .then((r) => r.json())
    .then((list: { id: string; filename: string; format: string; fileSize: string; created: string; updated: string }[]) =>
      (list || []).map((b) => ({
        ...b,
        created: b.created ? new Date(b.created).toLocaleDateString() : '',
        updated: b.updated ? new Date(b.updated).toLocaleDateString() : '',
      }))
    )
    .catch(() => [])

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [devices, setDevices] = useState<DeviceOption[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formFilename, setFormFilename] = useState('')
  const [formFormat, setFormFormat] = useState<'LDPlayer' | 'MuMu Player'>('LDPlayer')
  const [formDownloadUrl, setFormDownloadUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadBackups().then(setBackups)
    fetch('/api/devices')
      .then((r) => r.json())
      .then((list) => setDevices(list || []))
      .catch(() => setDevices([]))
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const addBackupFromFile = (file: File) => {
    const fileSize = file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '0 MB'
    const filename = file.name || `backup_${Date.now()}.ldbk`
    fetch('/api/backups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, format: 'LDPlayer', fileSize }),
    })
      .then((r) => r.json())
      .then(() => {
        loadBackups().then(setBackups)
        toast.success('Backup added', { description: 'You can add a download link in the form below (edit backup later).' })
      })
      .catch(() => toast.error('Failed to add backup'))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) addBackupFromFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) addBackupFromFile(file)
    e.target.value = ''
  }

  const submitAddBackupForm = () => {
    const filename = formFilename.trim() || `backup_${Date.now()}.ldbk`
    fetch('/api/backups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename,
        format: formFormat,
        fileSize: '0 MB',
        downloadUrl: formDownloadUrl.trim() || undefined,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        loadBackups().then(setBackups)
        setFormFilename('')
        setFormDownloadUrl('')
        setShowForm(false)
      })
      .catch(() => toast.error('Failed to add backup'))
  }

  const deleteBackup = (id: string) => {
    fetch(`/api/backups/${id}`, { method: 'DELETE' })
      .then((r) => (r.ok ? loadBackups().then(setBackups) : Promise.reject()))
      .catch(() => toast.error('Delete failed'))
  }

  const triggerRestore = async (backupId: string, deviceId: string) => {
    if (!deviceId) {
      toast.warning('Select a device to restore to')
      return
    }
    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId, deviceId }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        toast.success('Restore command sent', { description: 'Tool Click.py on the device will download the backup and run Restore.' })
      } else {
                toast.error(data.error || 'Restore failed')
      }
    } catch {
      toast.error('Request failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      <Sidebar />

      <main className="ml-56 overflow-auto min-h-screen">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Emulator Backups</h1>
            <p className="text-gray-400">Manage and restore your emulator backups</p>
          </div>

          {/* Upload Area */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".ldbk,.zip,.bak"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? 'border-cyan-500 bg-cyan-600/10 shadow-lg shadow-cyan-500/20'
                  : 'border-slate-700/50 hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-900/50'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${isDragActive ? 'bg-cyan-600/30' : 'bg-slate-700/50'}`}>
                  <Cloud size={48} className={isDragActive ? 'text-cyan-400' : 'text-cyan-500'} />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Add backup</h3>
                <p className="text-gray-400 mb-6">Drag and drop a file or click to select • Registers file (name + size) for restore later</p>
                <span className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg shadow-cyan-500/30">Select file</span>
                <div className="flex gap-3 mt-8">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm font-medium text-gray-300">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    MuMu Player
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm font-medium text-gray-300">
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    LDPlayer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form: Add backup manually (name + download link) */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 mb-8 hover:border-slate-600/50 transition-all duration-300">
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold mb-4"
            >
              <Plus size={20} />
              {showForm ? 'Hide form' : 'Add backup manually (name + download link)'}
            </button>
            {showForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Filename</label>
                  <input
                    type="text"
                    value={formFilename}
                    onChange={(e) => setFormFilename(e.target.value)}
                    placeholder="e.g. backup_2026.ldbk"
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Format</label>
                  <select
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value as 'LDPlayer' | 'MuMu Player')}
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="LDPlayer">LDPlayer</option>
                    <option value="MuMu Player">MuMu Player</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Download link (optional, used when restoring)</label>
                  <input
                    type="url"
                    value={formDownloadUrl}
                    onChange={(e) => setFormDownloadUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={submitAddBackupForm}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300"
                  >
                    Add backup
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Backups Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <HardDrive size={24} className="text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Your Backups</h2>
              <span className="inline-flex items-center justify-center w-7 h-7 bg-cyan-600/30 border border-cyan-500/50 text-cyan-400 text-sm font-semibold rounded-full">
                {backups.length}
              </span>
            </div>

            {backups.length > 0 ? (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/60 group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon */}
                      <div className="p-3 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                        <HardDrive size={24} className="text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1 truncate group-hover:text-cyan-300 transition-colors duration-300">
                          {backup.filename}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${backup.format === 'LDPlayer' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
                            {backup.format}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">{backup.fileSize}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">Created {backup.created}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">Updated {backup.updated}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="p-2.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95" title="Download">
                        <Download size={18} />
                      </button>
                      {devices.length > 0 && (
                        <select
                          className="bg-slate-800 text-gray-300 text-xs rounded-lg px-2 py-1.5 border border-slate-600"
                          onChange={(e) => {
                            const deviceId = e.target.value
                            if (deviceId) triggerRestore(backup.id, deviceId)
                            e.target.value = ''
                          }}
                        >
                          <option value="">Restore to device...</option>
                          {devices.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      )}
                      <button className="p-2.5 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95" title="Restore">
                        <RotateCcw size={18} />
                      </button>
                      <button
                        onClick={() => deleteBackup(backup.id)}
                        className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-12 text-center">
                <div className="inline-flex p-4 bg-slate-700/50 rounded-2xl mb-4">
                  <Cloud size={32} className="text-gray-500" />
                </div>
                <p className="text-gray-400 text-lg">No backups yet</p>
                <p className="text-gray-500 text-sm">Upload your first backup to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
