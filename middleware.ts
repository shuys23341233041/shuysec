import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'farm_session'
const PUBLIC_PATHS = ['/login']
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/device']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return true
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname === '/icon.svg') return true
  return false
}

function hasSessionCookie(request: NextRequest): boolean {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
  return Boolean(cookie && cookie.length > 20 && cookie.includes('.'))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    if (pathname === '/login' && hasSessionCookie(request)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (!hasSessionCookie(request)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
