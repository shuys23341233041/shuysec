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
        className="p-2 hover:bg-[#1C252E] rounded-lg transition-colors"
      >
        <MoreVertical size={18} className="text-[#919EAB] hover:text-[#FFFFFF]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#28323D] border border-[#333333] rounded-lg shadow-xl z-50 overflow-hidden">
          <button
            onClick={handleView}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#919EAB] hover:bg-[#1C252E] hover:text-[#68CDF9] transition-colors border-b border-[#333333]"
          >
            <Eye size={18} />
            <span>View</span>
          </button>

          <button
            onClick={handleCopyKey}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#919EAB] hover:bg-[#1C252E] hover:text-[#68CDF9] transition-colors border-b border-[#333333]"
          >
            <Copy size={18} />
            <span>Copy Key</span>
          </button>

          <button
            onClick={handleResetKey}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#FFAB00] hover:bg-[#1C252E] hover:text-[#FFAB00] transition-colors border-b border-[#333333]"
          >
            <Key size={18} />
            <span>Reset Key</span>
          </button>

          <button
            onClick={handleEdit}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#919EAB] hover:bg-[#1C252E] hover:text-[#68CDF9] transition-colors border-b border-[#333333]"
          >
            <Edit2 size={18} />
            <span>Edit</span>
          </button>

          <button
            onClick={handleStop}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#919EAB] hover:bg-[#1C252E] hover:text-[#68CDF9] transition-colors border-b border-[#333333]"
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
              className="w-full flex items-center gap-3 px-4 py-3 text-[#FF5630] hover:bg-[#FF5630]/10 transition-colors"
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
