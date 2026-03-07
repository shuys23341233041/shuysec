import { NextRequest, NextResponse } from 'next/server'
import { verifySessionCookie, getSessionCookieName } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const cookieName = getSessionCookieName()
  const cookie = req.cookies.get(cookieName)?.value
  const session = verifySessionCookie(cookie)
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  return NextResponse.json({ user: session.user, role: session.role ?? 'user' })
}
