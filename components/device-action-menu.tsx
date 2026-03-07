'use client'

import { useState, useRef, useEffect } from 'react'
import { Eye, Copy, Key, Edit2, Power, MoreVertical, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeviceActionMenuProps {
  deviceId: string | number
  deviceName?: string
  onView?: () => void
  onEdit?: () => void
  onStop?: () => void
  onDelete?: (id: string, name: string) => void
}

export function DeviceActionMenu({ deviceId, deviceName, onView, onEdit, onStop, onDelete }: DeviceActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleView = () => {
    router.push(`/devices/${deviceId}`)
    setIsOpen(false)
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(`device_key_${deviceId}`)
    setIsOpen(false)
  }

  const handleResetKey = () => {
    console.log('[v0] Reset key for device:', deviceId)
    setIsOpen(false)
  }

  const handleEdit = () => {
    console.log('[v0] Edit device:', deviceId)
    onEdit?.()
    setIsOpen(false)
  }

  const handleStop = () => {
    console.log('[v0] Stop device:', deviceId)
    onStop?.()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
      >
        <MoreVertical size={18} className="text-gray-400 hover:text-gray-200" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg shadow-xl shadow-slate-900/50 z-50 overflow-hidden">
          <button
            onClick={handleView}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-700/50 hover:text-cyan-300 transition-all duration-200 border-b border-slate-700/30"
          >
            <Eye size={18} />
            <span>View</span>
          </button>

          <button
            onClick={handleCopyKey}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-700/50 hover:text-cyan-300 transition-all duration-200 border-b border-slate-700/30"
          >
            <Copy size={18} />
            <span>Copy Key</span>
          </button>

          <button
            onClick={handleResetKey}
            className="w-full flex items-center gap-3 px-4 py-3 text-amber-400 hover:bg-slate-700/50 hover:text-amber-300 transition-all duration-200 border-b border-slate-700/30"
          >
            <Key size={18} />
            <span>Reset Key</span>
          </button>

          <button
            onClick={handleEdit}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-700/50 hover:text-cyan-300 transition-all duration-200 border-b border-slate-700/30"
          >
            <Edit2 size={18} />
            <span>Edit</span>
          </button>

          <button
            onClick={handleStop}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-700/50 hover:text-cyan-300 transition-all duration-200 border-b border-slate-700/30"
          >
            <Power size={18} />
            <span>Stop</span>
          </button>

          {onDelete && (
            <button
              onClick={() => {
                onDelete(String(deviceId), deviceName ?? String(deviceId))
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <Trash2 size={18} />
              <span>Delete device</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
