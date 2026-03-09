'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/sidebar'
import { Users, Database, Copy, HardDrive, Plus, Shield, User } from 'lucide-react'

interface UserStats {
  username: string
  role: 'admin' | 'user'
  deviceCount: number
  unassignedCount: number
  totalAccounts: number
  assignedCount: number
  backupCount: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [addForUser, setAddForUser] = useState<string | null>(null)
  const [addPaste, setAddPaste] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  const loadUsers = () => {
    setLoading(true)
    fetch('/api/admin/users')
      .then((r) => {
        if (r.status === 403) {
          setForbidden(true)
          return []
        }
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data)) setUsers(data)
        else setUsers([])
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleAddAccounts = async () => {
    if (!addForUser || !addPaste.trim()) {
      toast.error('Enter account data (one per line: username:password:cookie)')
      return
    }
    setAddLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(addForUser)}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paste: addPaste.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to add accounts')
        return
      }
      toast.success(`Added ${data.added} account(s) to ${addForUser}`, { description: `Total unassigned: ${data.total}` })
      setAddForUser(null)
      setAddPaste('')
      loadUsers()
    } catch {
      toast.error('Request failed')
    } finally {
      setAddLoading(false)
    }
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <Sidebar />
        <main className="ml-56 flex items-center justify-center min-h-screen">
          <p className="text-red-400">Access denied. Admin only.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Sidebar />
      <main className="ml-56 overflow-auto min-h-screen">
        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">User management</h1>
            <p className="text-gray-400">View all users and their stats. Only admin can create accounts for users.</p>
          </div>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-4">
              {users.map((u) => (
                <div
                  key={u.username}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${u.role === 'admin' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-700/50 border border-slate-600/50'}`}>
                        {u.role === 'admin' ? <Shield size={24} className="text-amber-400" /> : <User size={24} className="text-gray-400" />}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">{u.username}</h2>
                        <p className="text-sm text-gray-400 capitalize">{u.role}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddForUser(u.username)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-600/30 transition-colors"
                    >
                      <Plus size={18} />
                      Add accounts for user
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Database size={16} />
                        Devices
                      </div>
                      <p className="text-xl font-bold text-white">{u.deviceCount}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Copy size={16} />
                        Unassigned
                      </div>
                      <p className="text-xl font-bold text-white">{u.unassignedCount}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                      <div className="text-gray-400 text-sm mb-1">Assigned</div>
                      <p className="text-xl font-bold text-white">{u.assignedCount}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                      <div className="text-gray-400 text-sm mb-1">Total accounts</div>
                      <p className="text-xl font-bold text-white">{u.totalAccounts}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <HardDrive size={16} />
                        Backups
                      </div>
                      <p className="text-xl font-bold text-white">{u.backupCount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {addForUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => !addLoading && setAddForUser(null)}>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-1">Add accounts for {addForUser}</h3>
                <p className="text-sm text-gray-400 mb-4">One account per line: username:password:cookie or username:password:cookie:privateServerLink</p>
                <textarea
                  value={addPaste}
                  onChange={(e) => setAddPaste(e.target.value)}
                  placeholder="Paste account lines here..."
                  rows={8}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 font-mono text-sm resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => !addLoading && setAddForUser(null)}
                    className="flex-1 py-2.5 px-4 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-700/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAccounts}
                    disabled={addLoading}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50"
                  >
                    {addLoading ? 'Adding...' : 'Add accounts'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
