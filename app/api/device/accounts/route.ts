import { NextRequest, NextResponse } from 'next/server'
import { getStore, getGlobal } from '@/lib/store'

export async function GET(req: NextRequest) {
  try {
    const device_key = req.nextUrl.searchParams.get('device_key') || ''
    if (!device_key.trim()) {
      return NextResponse.json({ error: 'device_key required' }, { status: 400 })
    }
    const global = getGlobal()
    const entry = global.deviceKeyToUserAndDevice.get(device_key.trim())
    if (!entry) return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
    const store = getStore(entry.userId)
    const device = store.devices.get(entry.deviceId)
    if (!device) return NextResponse.json({ accounts: [] })
    const accounts: { username?: string; data: string }[] = []
    for (const accId of device.accountIds) {
      const acc = store.accounts.get(accId)
      if (acc) {
        let data = acc.cookie
        if (acc.username) data = `${acc.username} ${data}`.trim()
        accounts.push({ username: acc.username, data })
      }
    }
    return NextResponse.json({ accounts })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
