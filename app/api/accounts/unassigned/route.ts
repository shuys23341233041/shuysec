import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'
import { addAccountsFromLines } from '@/lib/accountParse'

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const store = getStore(session.user)
  const list = store.unassignedIds
    .map((id) => store.accounts.get(id))
    .filter(Boolean) as import('@/lib/store').Account[]
  return NextResponse.json(
    list.map((a) => ({
      id: a.id,
      username: a.username,
      password: a.password,
      cookie: a.cookie,
      privateServerLink: a.privateServerLink || '',
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const lines = (body?.lines as string[]) || (body?.paste ? (body.paste as string).split(/\n/) : [])
    const store = getStore(session.user)
    const added = addAccountsFromLines(store, lines)
    return NextResponse.json({ added, total: store.unassignedIds.length })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

