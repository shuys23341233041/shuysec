import { NextRequest, NextResponse } from 'next/server'
import { createSessionCookie, validateUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const username = (body?.username ?? '').toString().trim()
    const password = (body?.password ?? '').toString()

    const user = validateUser(username, password)
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const { name, value, options } = createSessionCookie(user.username, user.role)
    const res = NextResponse.json({ ok: true, user: user.username })
    res.headers.set('Set-Cookie', `${name}=${value}; ${options}`)
    return res
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
