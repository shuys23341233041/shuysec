import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName, isAdmin, getAllUsers } from '@/lib/auth'
import { hydrateUserStore } from '@/lib/kv-persistence'

/** GET list of all users with stats (admin only). */
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const users = getAllUsers()
  const list = await Promise.all(users.map(async (u) => {
    await hydrateUserStore(u.username)
    const store = getStore(u.username)
    const deviceCount = store.devices.size
    const unassignedCount = store.unassignedIds.length
    const totalAccounts = store.accounts.size
    const backupCount = store.backups.length
    const assignedCount = Array.from(store.devices.values()).reduce((sum, d) => sum + d.accountIds.length, 0)
    return {
      username: u.username,
      role: u.role,
      deviceCount,
      unassignedCount,
      totalAccounts,
      assignedCount,
      backupCount,
    }
  }))
  return NextResponse.json(list)
}
