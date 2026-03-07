import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'
import { hydrateUserStore, persistUserStore, requireDatabaseResponse } from '@/lib/persistence'
import { saveBackupFile } from '@/lib/store-sql'

/** Max upload size 50MB (Vercel serverless may limit to ~4.5MB unless configured). */
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dbErr = requireDatabaseResponse()
  if (dbErr) return dbErr
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = (file.name || `backup_${Date.now()}.ldbk`).trim().replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileSize = `${(file.size / 1024 / 1024).toFixed(2)} MB`
    const format = 'LDPlayer'
    const id = `backup_${Date.now()}`

    await hydrateUserStore(session.user)
    const store = getStore(session.user)
    const now = new Date().toISOString()
    store.backups.push({
      id,
      filename,
      format,
      fileSize,
      created: now,
      updated: now,
      downloadUrl: undefined,
    })
    await persistUserStore(session.user)
    await saveBackupFile(session.user, id, buffer)

    return NextResponse.json({ id, filename, format, fileSize })
  } catch (e) {
    console.error('Backup upload error', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 400 })
  }
}
