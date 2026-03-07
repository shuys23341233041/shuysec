'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/sidebar'
import { Cloud, Eye, EyeOff, Trash2, RefreshCw, Upload, Copy } from 'lucide-react'

interface Account {
  id: string
  username: string
  password: string
  cookie: string
  privateServerLink: string
}

export default function UnassignedPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const loadAccounts = useCallback(() => {
    fetch('/api/accounts/unassigned')
      .then((r) => r.json())
      .then(setAccounts)
      .catch(() => setAccounts([]))
  }, [])
  useEffect(() => { loadAccounts() }, [loadAccounts])
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [showCookies, setShowCookies] = useState<Record<string, boolean>>({})
  const [uploadMode, setUploadMode] = useState<'file' | 'paste'>('file')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set())
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalPages = Math.ceil(accounts.length / rowsPerPage)
  const startIdx = (currentPage - 1) * rowsPerPage
  const displayedAccounts = accounts.slice(startIdx, startIdx + rowsPerPage)

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleCookie = (id: string) => {
    setShowCookies(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const deleteAccount = (id: string) => {
    fetch('/api/accounts/unassigned/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountIds: [id] }),
    })
      .then((r) => r.json())
      .then(() => loadAccounts())
      .catch(() => toast.error('Delete failed'))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => addAccountsFromLines((reader.result as string || '').split(/\n/))
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = () => {
    setIsDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const text = (reader.result as string) || ''
        addAccountsFromLines(text.split(/\n/))
      }
      reader.readAsText(file)
    }
  }

  const addAccountsFromLines = (lines: string[]) => {
    const paste = lines.map((l) => l.trim()).filter(Boolean).join('\n')
    if (!paste) return
    fetch('/api/accounts/unassigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paste }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.added != null) {
          loadAccounts()
          toast.success(`Added ${data.added} account(s)`, { description: `Total unassigned: ${data.total}` })
        }
      })
      .catch(() => toast.error('Failed to add accounts'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      <Sidebar />

      <main className="ml-56 overflow-auto min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Unassigned Accounts</h1>
            <p className="text-gray-400">Manage and organize your farm accounts</p>
          </div>

          {/* Upload Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-8 mb-8 hover:border-slate-600/50 transition-all duration-300">
            {/* Mode Tabs */}
            <div className="flex gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-lg inline-flex">
              <button
                onClick={() => setUploadMode('file')}
                className={`px-6 py-2.5 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 ${uploadMode === 'file' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700/30'}`}
              >
                <Upload size={16} />
                File Upload
              </button>
              <button
                onClick={() => setUploadMode('paste')}
                className={`px-6 py-2.5 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 ${uploadMode === 'paste' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700/30'}`}
              >
                <Copy size={16} />
                Paste Upload
              </button>
            </div>

            {uploadMode === 'file' ? (
              /* Drag & Drop Area */
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv,text/plain"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${isDragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600/50 hover:border-slate-600'}`}
                >
                  <Cloud size={48} className="mx-auto mb-4 text-cyan-400 opacity-60" />
                  <h3 className="text-xl font-semibold text-white mb-2">Drag and drop a file or click to select</h3>
                  <p className="text-gray-400 mb-4">.txt or .csv file, one account per line: username:password:cookie</p>
                  <div className="flex gap-2 justify-center flex-wrap mb-4">
                    <span className="px-3 py-1.5 bg-slate-700/50 text-cyan-300 rounded-lg text-sm font-mono">username:password:cookie</span>
                    <span className="px-3 py-1.5 bg-slate-700/50 text-cyan-300 rounded-lg text-sm font-mono">username:password:cookie:link</span>
                  </div>
                  <span className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm">Select file</span>
                </div>
              </>
            ) : (
              /* Paste Area */
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Paste your account data here, one account per line</label>
                <textarea
                  id="paste-accounts"
                  placeholder="username:password:cookie or username:password:cookie:privateServerLink"
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 h-32 font-mono text-sm resize-none transition-all duration-300"
                />
                <p className="text-xs text-gray-500 mt-3">Format: username:password:cookie or username:password:cookie:privateServerLink</p>
              </div>
            )}

            <button
              onClick={() => {
                if (uploadMode === 'paste') {
                  const el = document.getElementById('paste-accounts') as HTMLTextAreaElement
                  addAccountsFromLines((el?.value || '').split(/\n/))
                  if (el) el.value = ''
                } else {
                  fileInputRef.current?.click()
                }
              }}
              className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5 hover:scale-105 active:scale-95"
            >
              {uploadMode === 'paste' ? 'Add accounts' : 'Select file'}
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-400">
              Showing <span className="font-semibold text-white">{startIdx + 1}</span>-<span className="font-semibold text-white">{Math.min(startIdx + rowsPerPage, accounts.length)}</span> of <span className="font-semibold text-white">{accounts.length}</span> accounts
            </div>
            <div className="flex items-center gap-4">
              <button onClick={loadAccounts} className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-cyan-600/20 text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:scale-110 active:scale-95 hover:ring-2 hover:ring-cyan-500/30">
                <RefreshCw size={18} />
              </button>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-900/80">
                    <th className="px-4 py-4 text-left">
                      <input type="checkbox" className="w-5 h-5 rounded cursor-pointer accent-cyan-600 hover:ring-2 hover:ring-cyan-500/50 transition-all duration-300" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cookie</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Private Server Link</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAccounts.map((account) => (
                    <tr key={account.id} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-all duration-300 group cursor-pointer">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded cursor-pointer accent-cyan-600 hover:ring-2 hover:ring-cyan-500/50 transition-all duration-300"
                          checked={selectedAccounts.has(account.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedAccounts)
                            if (e.target.checked) {
                              newSelected.add(account.id)
                            } else {
                              newSelected.delete(account.id)
                            }
                            setSelectedAccounts(newSelected)
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white font-mono">{account.username}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-mono">
                            {showPasswords[account.id] ? account.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePassword(account.id)}
                            className="p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-600/20 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                          >
                            {showPasswords[account.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-mono text-xs">
                            {showCookies[account.id] ? account.cookie : account.cookie.substring(0, 8) + '...'}
                          </span>
                          <button
                            onClick={() => toggleCookie(account.id)}
                            className="p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-600/20 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                          >
                            {showCookies[account.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {account.privateServerLink ? (
                          <a href="#" className="text-cyan-400 hover:text-cyan-300 text-xs truncate inline-block max-w-xs">
                            {account.privateServerLink}
                          </a>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteAccount(account.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div></div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-gray-400 disabled:opacity-50 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-600/10 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  ←
                </button>
                <div className="flex items-center gap-1">
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
                        className={`w-10 h-10 rounded-lg transition-all duration-300 font-semibold ${currentPage === pageNum ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105' : 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:border-slate-600/50 hover:bg-slate-700/30 hover:scale-105 active:scale-95'}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-gray-400 disabled:opacity-50 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-600/10 transition-all duration-300 hover:scale-105 active:scale-95"
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
