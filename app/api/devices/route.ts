import { NextRequest, NextResponse } from 'next/server'
import { getStore, getGlobal, type UserStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'

/** Device key 64 chars hex (32 bytes). Web Crypto works in Node 18+ and Edge. */
function generateDeviceKey(): string {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const store = getStore(session.user)
  const list = Array.from(store.devices.values()).map((d) => ({
    id: d.id,
    name: d.device_name,
    status: d.lastHeartbeat && Date.now() - d.lastHeartbeat < 60000 ? 'connected' : 'disconnected',
    lastHeartbeat: d.lastHeartbeat,
    stats: d.stats,
    total: d.accountIds.length,
    active: d.accountIds.length,
    inactive: 0,
    assetId: `AST-${d.id.replace(/\D/g, '').padStart(4, '0')}`,
    daysLeft: 180,
    enabled: true,
    model: 'LDPlayer',
  }))
  return NextResponse.json(list)
}

/** Lấy số thứ tự tiếp theo cho tên Device N */
function getNextDeviceNumber(store: UserStore): number {
  let max = 0
  for (const d of store.devices.values()) {
    const m = d.device_name.match(/^Device (\d+)$/)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return max + 1
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: { count?: number } = {}
  try {
    const text = await req.text()
    if (text.trim()) body = JSON.parse(text) as { count?: number }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const count = Math.min(50, Math.max(1, parseInt(String(body?.count ?? 1), 10) || 1))
  try {
    const store = getStore(session.user)
    const global = getGlobal()
    let nextNum = getNextDeviceNumber(store)
    const created: { id: string; device_name: string; device_key: string }[] = []
    for (let i = 0; i < count; i++) {
      const device_name = `Device ${nextNum + i}`
      const id = `device_${Date.now()}_${i}`
      const device_key = generateDeviceKey()
      store.devices.set(id, {
        id,
        device_key,
        device_name,
        accountIds: [],
      })
      store.deviceKeyToId.set(device_key, id)
      global.deviceKeyToUserAndDevice.set(device_key, { userId: session.user, deviceId: id })
      created.push({ id, device_name, device_key })
    }
    return NextResponse.json({ devices: created })
  } catch (e) {
    console.error('[POST /api/devices]', e)
    return NextResponse.json({ error: 'Server error while creating devices' }, { status: 500 })
  }
}
