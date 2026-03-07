import { NextRequest, NextResponse } from 'next/server'
import { getStore, getGlobal } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'
import { hydrateUserStore, persistUserStore, persistGlobal, requireDatabaseResponse } from '@/lib/persistence'

/** GET device by id with assigned accounts (real data) */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dbErr = requireDatabaseResponse()
  if (dbErr) return dbErr
  await hydrateUserStore(session.user)
  try {
    const { id } = await params
    const store = getStore(session.user)
    const device = store.devices.get(id)
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }
    const accounts = device.accountIds
      .map((accId) => store.accounts.get(accId))
      .filter(Boolean) as import('@/lib/store').Account[]

    const isConnected = device.lastHeartbeat != null && Date.now() - device.lastHeartbeat < 60000
    return NextResponse.json({
      id: device.id,
      name: device.device_name,
      device_key: device.device_key,
      status: isConnected ? 'connected' : 'disconnected',
      lastHeartbeat: device.lastHeartbeat,
      stats: device.stats,
      total: device.accountIds.length,
      active: device.accountIds.length,
      inactive: 0,
      enabled: true,
      model: 'LDPlayer',
      type: 'LDPlayer',
      version: '1.0',
      lastSeen: device.lastHeartbeat
        ? new Date(device.lastHeartbeat).toLocaleString()
        : null,
      accounts: accounts.map((a) => ({
        id: a.id,
        username: a.username,
        password: a.password,
        cookie: a.cookie,
        privateServerLink: a.privateServerLink,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

/** DELETE device. Assigned accounts go back to unassigned. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dbErr = requireDatabaseResponse()
  if (dbErr) return dbErr
  try {
    const { id } = await params
    await hydrateUserStore(session.user)
    const store = getStore(session.user)
    const device = store.devices.get(id)
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }
    for (const accId of device.accountIds) {
      if (!store.unassignedIds.includes(accId)) {
        store.unassignedIds.push(accId)
      }
    }
    store.deviceKeyToId.delete(device.device_key)
    getGlobal().deviceKeyToUserAndDevice.delete(device.device_key)
    store.devices.delete(id)
    await persistUserStore(session.user)
    await persistGlobal()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
