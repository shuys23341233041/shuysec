import { NextRequest, NextResponse } from 'next/server'
import { getStore, getGlobal } from '@/lib/store'
import { hydrateGlobal, hydrateUserStore } from '@/lib/kv-persistence'

export async function GET(req: NextRequest) {
  try {
    const device_key = req.nextUrl.searchParams.get('device_key') || ''
    if (!device_key.trim()) {
      return NextResponse.json({ error: 'device_key required' }, { status: 400 })
    }
    await hydrateGlobal()
    const global = getGlobal()
    const entry = global.deviceKeyToUserAndDevice.get(device_key.trim())
    if (!entry) return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
    await hydrateUserStore(entry.userId)
    const store = getStore(entry.userId)
    const pending = store.pendingRestores.get(device_key.trim())
    if (!pending) {
      return NextResponse.json({ pending: false })
    }
    return NextResponse.json({
      pending: true,
      download_url: pending.download_url,
      name: pending.name,
      filename: pending.filename,
    })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
