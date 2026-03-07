import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'
import { hydrateUserStore, persistUserStore } from '@/lib/persistence'

/** Set pending restore for a device. Body: { deviceId: string, backupId: string, downloadUrl?: string } */
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const deviceId = (body?.deviceId || body?.device_id || '').toString().trim()
    const backupId = (body?.backupId || body?.backup_id || '').toString().trim()
    const downloadUrl = (body?.downloadUrl || body?.download_url || '').toString().trim()
    await hydrateUserStore(session.user)
    const store = getStore(session.user)
    const device = store.devices.get(deviceId)
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }
    const backup = store.backups.find((b) => b.id === backupId)
    const name = backup?.filename || `backup_${backupId}.ldbk`
    const url = downloadUrl || backup?.downloadUrl || `https://example.com/backups/${name}`
    store.pendingRestores.set(device.device_key, {
      device_key: device.device_key,
      download_url: url,
      name,
      filename: name,
    })
    await persistUserStore(session.user)
    return NextResponse.json({ ok: true, device_key: device.device_key })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
