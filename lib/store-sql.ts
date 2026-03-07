/**
 * Load/save in-memory store from/to MySQL (external DB e.g. Vietnix).
 * Used when DATABASE_URL is set. Always reads from DB into memory on hydrate,
 * and writes memory to DB on persist.
 */

import { query } from '@/lib/db'
import { getStore, getGlobal } from '@/lib/store'
import type { Device, Account, BackupMeta } from '@/lib/store'
import { initSchema } from '@/lib/db'

interface DeviceRow {
  id: string
  user_id: string
  device_key: string
  device_name: string
  last_heartbeat: number | null
  stats: string | null
}

interface AccountRow {
  id: string
  user_id: string
  username: string
  password: string
  cookie: string
  private_server_link: string | null
  device_id: string | null
}

interface BackupRow {
  id: string
  user_id: string
  filename: string
  format: string
  file_size: string
  created_at: string
  updated_at: string
  download_url: string | null
}

interface PendingRestoreRow {
  device_key: string
  user_id: string
  device_id: string
  download_url: string
  name: string
  filename: string
}

interface DeviceKeyMapRow {
  device_key: string
  user_id: string
  device_id: string
}

let schemaInited = false
async function ensureSchema(): Promise<void> {
  if (!schemaInited) {
    await initSchema()
    schemaInited = true
  }
}

/** Load user store from MySQL into in-memory store. */
export async function hydrateUserStore(userId: string): Promise<void> {
  await ensureSchema()
  const store = getStore(userId)
  store.devices.clear()
  store.deviceKeyToId.clear()
  store.accounts.clear()
  store.unassignedIds.length = 0
  store.backups.length = 0
  store.pendingRestores.clear()

  const devices = (await query<DeviceRow[]>('SELECT id, user_id, device_key, device_name, last_heartbeat, stats FROM devices WHERE user_id = ?', [userId])) ?? []
  for (const r of devices) {
    let stats: Device['stats'] = undefined
    if (r.stats) {
      try {
        stats = JSON.parse(r.stats) as Device['stats']
      } catch {
        // ignore
      }
    }
    store.devices.set(r.id, {
      id: r.id,
      device_key: r.device_key,
      device_name: r.device_name,
      lastHeartbeat: r.last_heartbeat ?? undefined,
      stats,
      accountIds: [],
    })
    store.deviceKeyToId.set(r.device_key, r.id)
  }

  const accounts = (await query<AccountRow[]>('SELECT id, user_id, username, password, cookie, private_server_link, device_id FROM accounts WHERE user_id = ?', [userId])) ?? []
  for (const r of accounts) {
    const acc: Account = {
      id: r.id,
      username: r.username,
      password: r.password,
      cookie: r.cookie,
      privateServerLink: r.private_server_link ?? undefined,
      deviceId: r.device_id ?? undefined,
    }
    store.accounts.set(r.id, acc)
    if (!r.device_id) {
      store.unassignedIds.push(r.id)
    } else {
      const dev = store.devices.get(r.device_id)
      if (dev && !dev.accountIds.includes(r.id)) dev.accountIds.push(r.id)
    }
  }

  const backups = (await query<BackupRow[]>('SELECT id, user_id, filename, format, file_size, created_at, updated_at, download_url FROM backups WHERE user_id = ?', [userId])) ?? []
  for (const r of backups) {
    store.backups.push({
      id: r.id,
      filename: r.filename,
      format: r.format as BackupMeta['format'],
      fileSize: r.file_size,
      created: r.created_at,
      updated: r.updated_at,
      downloadUrl: r.download_url ?? undefined,
    })
  }

  const restores = (await query<PendingRestoreRow[]>('SELECT device_key, user_id, device_id, download_url, name, filename FROM pending_restores WHERE user_id = ?', [userId])) ?? []
  for (const r of restores) {
    store.pendingRestores.set(r.device_key, {
      device_key: r.device_key,
      download_url: r.download_url,
      name: r.name,
      filename: r.filename,
    })
  }
}

/** Update only device last_heartbeat (for Tool heartbeat). Does not touch accounts or other data. */
export async function updateDeviceHeartbeat(userId: string, deviceId: string): Promise<void> {
  await ensureSchema()
  await query(
    'UPDATE devices SET last_heartbeat = ? WHERE id = ? AND user_id = ?',
    [Date.now(), deviceId, userId]
  )
}

/** Update only device stats (for Tool stats). Does not touch accounts or other data. */
export async function updateDeviceStats(
  userId: string,
  deviceId: string,
  stats: { cpu?: number; ram_mb?: number; uptime_seconds?: number; screenshot_base64?: string }
): Promise<void> {
  await ensureSchema()
  const statsJson = stats ? JSON.stringify(stats) : null
  await query(
    'UPDATE devices SET last_heartbeat = ?, stats = ? WHERE id = ? AND user_id = ?',
    [Date.now(), statsJson, deviceId, userId]
  )
}

/** Save in-memory user store to MySQL. */
export async function persistUserStore(userId: string): Promise<void> {
  const store = getStore(userId)

  await query('DELETE FROM devices WHERE user_id = ?', [userId])
  for (const [, d] of store.devices) {
    const statsJson = d.stats ? JSON.stringify(d.stats) : null
    await query(
      'INSERT INTO devices (id, user_id, device_key, device_name, last_heartbeat, stats) VALUES (?, ?, ?, ?, ?, ?)',
      [d.id, userId, d.device_key, d.device_name, d.lastHeartbeat ?? null, statsJson]
    )
  }

  await query('DELETE FROM accounts WHERE user_id = ?', [userId])
  for (const [, a] of store.accounts) {
    await query(
      'INSERT INTO accounts (id, user_id, username, password, cookie, private_server_link, device_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [a.id, userId, a.username, a.password, a.cookie, a.privateServerLink ?? null, a.deviceId ?? null]
    )
  }

  await query('DELETE FROM backups WHERE user_id = ?', [userId])
  for (const b of store.backups) {
    await query(
      'INSERT INTO backups (id, user_id, filename, format, file_size, created_at, updated_at, download_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [b.id, userId, b.filename, b.format, b.fileSize, b.created, b.updated, b.downloadUrl ?? null]
    )
  }

  await query('DELETE FROM pending_restores WHERE user_id = ?', [userId])
  for (const [, pr] of store.pendingRestores) {
    const deviceId = store.deviceKeyToId.get(pr.device_key) ?? pr.device_key
    await query(
      'INSERT INTO pending_restores (device_key, user_id, device_id, download_url, name, filename) VALUES (?, ?, ?, ?, ?, ?)',
      [pr.device_key, userId, deviceId, pr.download_url, pr.name, pr.filename]
    )
  }
}

/** Load global device_key -> { userId, deviceId } from MySQL. */
export async function hydrateGlobal(): Promise<void> {
  await ensureSchema()
  const rows = (await query<DeviceKeyMapRow[]>('SELECT device_key, user_id, device_id FROM device_key_map')) ?? []
  const global = getGlobal()
  global.deviceKeyToUserAndDevice.clear()
  for (const r of rows) {
    global.deviceKeyToUserAndDevice.set(r.device_key, { userId: r.user_id, deviceId: r.device_id })
  }
}

/** Save global device_key map to MySQL. */
export async function persistGlobal(): Promise<void> {
  const global = getGlobal()
  await query('DELETE FROM device_key_map')
  for (const [key, val] of global.deviceKeyToUserAndDevice) {
    await query('INSERT INTO device_key_map (device_key, user_id, device_id) VALUES (?, ?, ?)', [key, val.userId, val.deviceId])
  }
}
