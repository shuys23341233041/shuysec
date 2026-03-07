import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'
import { hydrateUserStore, persistUserStore } from '@/lib/kv-persistence'

/** Remove accounts from unassigned. Body: { accountIds: string[] } */
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const accountIds = (body?.accountIds || []) as string[]
    await hydrateUserStore(session.user)
    const store = getStore(session.user)
    let removed = 0
    for (const id of accountIds) {
      const idx = store.unassignedIds.indexOf(id)
      if (idx !== -1) {
        store.unassignedIds.splice(idx, 1)
        store.accounts.delete(id)
        removed++
      }
    }
    await persistUserStore(session.user)
    return NextResponse.json({ removed, total: store.unassignedIds.length })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
