import { NextRequest, NextResponse } from 'next/server'
import { getGlobal } from '@/lib/store'
import { hydrateGlobal, updateDeviceStats, requireDatabaseResponse } from '@/lib/persistence'

/** Tool only updates device stats. No full store read/write — avoids any risk of wiping DB. */
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
    const entry = getGlobal().deviceKeyToUserAndDevice.get(device_key)
    if (!entry) return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
    await updateDeviceStats(entry.userId, entry.deviceId, {
      cpu: body.cpu,
      ram_mb: body.ram_mb,
      uptime_seconds: body.uptime_seconds,
      screenshot_base64: body.screenshot_base64,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
