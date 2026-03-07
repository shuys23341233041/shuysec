import { NextRequest, NextResponse } from 'next/server'
import { getStore, getGlobal } from '@/lib/store'
import { hydrateGlobal, hydrateUserStore, persistUserStore, requireDatabaseResponse } from '@/lib/persistence'

export async function POST(req: NextRequest) {
  const dbErr = requireDatabaseResponse()
  if (dbErr) return dbErr
  try {
    const body = await req.json()
    const device_key = (body?.device_key || '').toString().trim()
    if (!device_key) {
      return NextResponse.json({ error: 'device_key required' }, { status: 400 })
    }
    await hydrateGlobal()
    const global = getGlobal()
    const entry = global.deviceKeyToUserAndDevice.get(device_key)
    if (!entry) return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
    await hydrateUserStore(entry.userId)
    const store = getStore(entry.userId)
    const device = store.devices.get(entry.deviceId)
    if (device) {
      device.lastHeartbeat = Date.now()
    }
    await persistUserStore(entry.userId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
