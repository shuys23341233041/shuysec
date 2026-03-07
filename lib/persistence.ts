/**
 * Persistence: only MySQL (DATABASE_URL) is supported.
 * In-memory and KV are disabled; app requires DATABASE_URL to run.
 */

import { NextResponse } from 'next/server'
import { isDatabaseConfigured } from '@/lib/db'
import * as sql from '@/lib/store-sql'

function useSql(): boolean {
  return isDatabaseConfigured()
}

/** Returns a 503 response if DATABASE_URL is not set. Call at start of API routes that use data. */
export function requireDatabaseResponse(): NextResponse | null {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database connection required. Set DATABASE_URL (MySQL) in Vercel Environment Variables.' },
      { status: 503 }
    )
  }
  return null
}

/** Load user store from MySQL. Call at start of API that uses store. */
export async function hydrateUserStore(userId: string): Promise<void> {
  if (useSql()) return sql.hydrateUserStore(userId)
  throw new Error('DATABASE_URL is required')
}

/** Save current user store to MySQL. Call after any mutation. */
export async function persistUserStore(userId: string): Promise<void> {
  if (useSql()) return sql.persistUserStore(userId)
  throw new Error('DATABASE_URL is required')
}

/** Load global device_key map from MySQL. Call when resolving device key. */
export async function hydrateGlobal(): Promise<void> {
  if (useSql()) return sql.hydrateGlobal()
  throw new Error('DATABASE_URL is required')
}

/** Save global device_key map to MySQL. Call after device create/delete. */
export async function persistGlobal(): Promise<void> {
  if (useSql()) return sql.persistGlobal()
  throw new Error('DATABASE_URL is required')
}

/** Update only device heartbeat (Tool). Does not read/write full store — safe, no data wipe. */
export async function updateDeviceHeartbeat(userId: string, deviceId: string): Promise<void> {
  if (useSql()) return sql.updateDeviceHeartbeat(userId, deviceId)
  throw new Error('DATABASE_URL is required')
}

/** Update only device stats (Tool). Does not read/write full store — safe, no data wipe. */
export async function updateDeviceStats(
  userId: string,
  deviceId: string,
  stats: { cpu?: number; ram_mb?: number; uptime_seconds?: number; screenshot_base64?: string }
): Promise<void> {
  if (useSql()) return sql.updateDeviceStats(userId, deviceId, stats)
  throw new Error('DATABASE_URL is required')
}

export function isPersistenceEnabled(): boolean {
  return useSql()
}
