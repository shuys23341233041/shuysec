import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const store = getStore(session.user)
  return NextResponse.json(store.backups)
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const filename = (body?.filename || body?.name || `backup_${Date.now()}.ldbk`).toString().trim()
    const format = body?.format === 'MuMu Player' ? 'MuMu Player' : 'LDPlayer'
    const downloadUrl = body?.downloadUrl || body?.download_url
    const store = getStore(session.user)
    const id = `backup_${Date.now()}`
    store.backups.push({
      id,
      filename,
      format,
      fileSize: body?.fileSize || '0 MB',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      downloadUrl,
    })
    return NextResponse.json({ id, filename, format })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
