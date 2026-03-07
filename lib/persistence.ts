/**
 * Single entry point for persistence: SQL (MySQL) or KV (Redis).
 * - If DATABASE_URL is set → use MySQL (e.g. Vietnix).
 * - Else if KV_REST_API_URL + KV_REST_API_TOKEN are set → use Redis/KV.
 * - Else → no-op (in-memory only; data may be lost on serverless cold start).
 */

import { isDatabaseConfigured } from '@/lib/db'
import * as kv from '@/lib/kv-persistence'
import * as sql from '@/lib/store-sql'

function useSql(): boolean {
  return isDatabaseConfigured()
}

/** Load user store from DB/KV into memory. Call at start of API that uses store. */
export async function hydrateUserStore(userId: string): Promise<void> {
  if (useSql()) return sql.hydrateUserStore(userId)
  return kv.hydrateUserStore(userId)
}

/** Save current user store to DB/KV. Call after any mutation. */
export async function persistUserStore(userId: string): Promise<void> {
  if (useSql()) return sql.persistUserStore(userId)
  return kv.persistUserStore(userId)
}

/** Load global device_key map from DB/KV. Call when resolving device key. */
export async function hydrateGlobal(): Promise<void> {
  if (useSql()) return sql.hydrateGlobal()
  return kv.hydrateGlobal()
}

/** Save global device_key map to DB/KV. Call after device create/delete. */
export async function persistGlobal(): Promise<void> {
  if (useSql()) return sql.persistGlobal()
  return kv.persistGlobal()
}

export function isPersistenceEnabled(): boolean {
  return useSql() || kv.isPersistenceEnabled()
}
