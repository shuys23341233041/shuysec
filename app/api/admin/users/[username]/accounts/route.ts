import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName, isAdmin, getAllUsers } from '@/lib/auth'
import { addAccountsFromLines } from '@/lib/accountParse'
import { hydrateUserStore, persistUserStore } from '@/lib/kv-persistence'

/** POST add accounts to a user's unassigned pool (admin only). Body: { paste: string } or { lines: string[] } */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { username } = await params
    const allowed = getAllUsers().map((u) => u.username)
    if (!allowed.includes(username)) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const body = await req.json()
    const lines = (body?.lines as string[]) || (body?.paste ? (body.paste as string).split(/\n/) : [])
    await hydrateUserStore(username)
    const store = getStore(username)
    const added = addAccountsFromLines(store, lines, `admin_${username}`)
    await persistUserStore(username)
    return NextResponse.json({ added, total: store.unassignedIds.length })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
