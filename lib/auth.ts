import { createHmac, randomBytes } from 'crypto'

const COOKIE_NAME = 'farm_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days (seconds)

function getSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.SESSION_SECRET
  if (secret) return secret
  // Fallback for dev only; set AUTH_SECRET in production
  return 'farm-dev-secret-change-in-production'
}

export interface SessionPayload {
  user: string
  role?: 'admin' | 'user' // optional for backward compatibility; default 'user'
  exp: number
}

export function getSessionCookieName(): string {
  return COOKIE_NAME
}

export function createSessionCookie(username: string, role: 'admin' | 'user'): { name: string; value: string; options: string } {
  const payload: SessionPayload = {
    user: username,
    role,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  }
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const sig = createHmac('sha256', getSecret()).update(data).digest('hex')
  const value = `${data}.${sig}`
  const options = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}; Secure`
  return { name: COOKIE_NAME, value, options }
}

export function verifySessionCookie(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue || !cookieValue.includes('.')) return null
  const [data, sig] = cookieValue.split('.')
  if (!data || !sig) return null
  const expectedSig = createHmac('sha256', getSecret()).update(data).digest('hex')
  if (expectedSig !== sig) return null
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as SessionPayload
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

/** Fixed accounts: admin sHuys / 123456789, user sHuys1 / 123456789 */
const FIXED_USERS: { username: string; password: string; role: 'admin' | 'user' }[] = [
  { username: 'sHuys', password: '123456789', role: 'admin' },
  { username: 'sHuys1', password: '123456789', role: 'user' },
]

/** List all usernames and roles (for admin user management). */
export function getAllUsers(): { username: string; role: 'admin' | 'user' }[] {
  return FIXED_USERS.map((u) => ({ username: u.username, role: u.role }))
}

export function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === 'admin'
}

export function validateUser(username: string, password: string): { username: string; role: 'admin' | 'user' } | null {
  const u = username.trim()
  const p = password
  const found = FIXED_USERS.find((x) => x.username === u && x.password === p)
  return found ? { username: found.username, role: found.role } : null
}

/** Dùng trong API route: trả về session nếu đã đăng nhập, null thì cần trả 401. */
export function getSessionFromRequest(cookieValue: string | undefined): SessionPayload | null {
  return verifySessionCookie(cookieValue)
}
