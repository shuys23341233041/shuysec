import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'
import { hydrateUserStore, requireDatabaseResponse } from '@/lib/persistence'

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dbErr = requireDatabaseResponse()
  if (dbErr) return dbErr
  await hydrateUserStore(session.user)
  const store = getStore(session.user)
  const devices = Array.from(store.devices.values())
  const totalDevices = devices.length
  const connectedDevices = devices.filter(
    (d) => d.lastHeartbeat && Date.now() - d.lastHeartbeat < 60000
  ).length
  const totalAccounts = store.accounts.size
  const runningAccounts = devices.reduce((sum, d) => sum + d.accountIds.length, 0)
  const unassignedCount = store.unassignedIds.length
  const uptimePercent = totalDevices ? Math.round((connectedDevices / totalDevices) * 1000) / 10 : 0
  return NextResponse.json({
    totalDevices,
    connectedDevices,
    totalAccounts,
    runningAccounts,
    unassignedCount,
    uptimePercent,
  })
}
