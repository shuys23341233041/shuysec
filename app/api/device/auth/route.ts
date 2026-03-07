import { NextRequest, NextResponse } from 'next/server'
import { getStore, getGlobal } from '@/lib/store'
import { hydrateGlobal, hydrateUserStore, requireDatabaseResponse } from '@/lib/persistence'

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
    if (!entry) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
    }
    await hydrateUserStore(entry.userId)
    const store = getStore(entry.userId)
    const device = store.devices.get(entry.deviceId)
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 403 })
    }
    const accounts: { username?: string; data: string }[] = []
    for (const accId of device.accountIds) {
      const acc = store.accounts.get(accId)
      if (acc) {
        let data = acc.cookie
        if (acc.username) data = `${acc.username} ${data}`.trim()
        accounts.push({ username: acc.username, data })
      }
    }
    return NextResponse.json({
      device_id: device.id,
      device_name: device.device_name,
      accounts,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
