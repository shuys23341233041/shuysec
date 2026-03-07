import { NextRequest, NextResponse } from 'next/server'
import { getStore, getGlobal } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'
import { hydrateUserStore, hydrateGlobal, requireDatabaseResponse } from '@/lib/persistence'
import { getBackupFile } from '@/lib/store-sql'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbErr = requireDatabaseResponse()
  if (dbErr) return dbErr

  const { id: backupId } = await params
  let userId: string | null = null

  const deviceKey = req.nextUrl.searchParams.get('device_key')
  if (deviceKey) {
    await hydrateGlobal()
    const global = getGlobal()
    const mapping = global.deviceKeyToUserAndDevice.get(deviceKey)
    if (mapping) userId = mapping.userId
  }
  if (!userId) {
    const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
    if (session) userId = session.user
  }
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await hydrateUserStore(userId)
  const store = getStore(userId)
  const backup = store.backups.find((b) => b.id === backupId)
  if (!backup) {
    return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
  }

  const fileData = await getBackupFile(userId, backupId)
  if (!fileData || fileData.length === 0) {
    return NextResponse.json({ error: 'Backup file not found' }, { status: 404 })
  }

  const filename = backup.filename || `backup_${backupId}.ldbk`
  return new NextResponse(fileData, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename.replace(/"/g, '\\"')}"`,
      'Content-Length': String(fileData.length),
    },
  })
}
