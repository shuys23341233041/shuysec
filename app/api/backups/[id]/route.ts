import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'
import { hydrateUserStore, persistUserStore } from '@/lib/kv-persistence'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    await hydrateUserStore(session.user)
    const store = getStore(session.user)
    const idx = store.backups.findIndex((b) => b.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    store.backups.splice(idx, 1)
    await persistUserStore(session.user)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
