/**
 * Optional KV persistence (Upstash Redis / Vercel KV).
 * Set KV_REST_API_URL and KV_REST_API_TOKEN to enable. When set, user stores
 * and global device-key map are saved/loaded so data survives serverless restarts.
 */

import type { UserStore, GlobalFarmStore } from '@/lib/store'
import { getStore, getGlobal } from '@/lib/store'

const USER_KEY_PREFIX = 'farm:user:'
const GLOBAL_KEY = 'farm:global'

function isKVConfigured(): boolean {
  return Boolean(
    typeof process !== 'undefined' &&
      process.env.KV_REST_API_URL &&
      process.env.KV_REST_API_TOKEN
  )
}

/** Upstash REST API: run one command. */
async function kvCommand(cmd: 'get' | 'set', key: string, value?: string): Promise<string | null> {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  const body =
    cmd === 'get'
      ? JSON.stringify([{ name: 'get', args: [key] }])
      : JSON.stringify([{ name: 'set', args: [key, value ?? ''] }])
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  })
  if (!res.ok) return null
  const data = (await res.json()) as { result?: string | null }[]
  const result = data[0]?.result
  return typeof result === 'string' ? result : null
}

async function kvGet(key: string): Promise<string | null> {
  return kvCommand('get', key)
}

async function kvSet(key: string, value: string): Promise<void> {
  await kvCommand('set', key, value)
}

// --- Serialization (Map -> array of entries for JSON) ---

function serializeUserStore(store: UserStore): string {
  const obj = {
    devices: Array.from(store.devices.entries()),
    deviceKeyToId: Array.from(store.deviceKeyToId.entries()),
    accounts: Array.from(store.accounts.entries()),
    unassignedIds: store.unassignedIds,
    backups: store.backups,
    pendingRestores: Array.from(store.pendingRestores.entries()),
  }
  return JSON.stringify(obj)
}

function deserializeUserStore(json: string): UserStore | null {
  try {
    const obj = JSON.parse(json) as {
      devices: [string, import('@/lib/store').Device][]
      deviceKeyToId: [string, string][]
      accounts: [string, import('@/lib/store').Account][]
      unassignedIds: string[]
      backups: import('@/lib/store').BackupMeta[]
      pendingRestores: [string, import('@/lib/store').PendingRestore][]
    }
    const store: UserStore = {
      devices: new Map(obj.devices ?? []),
      deviceKeyToId: new Map(obj.deviceKeyToId ?? []),
      accounts: new Map(obj.accounts ?? []),
      unassignedIds: Array.isArray(obj.unassignedIds) ? obj.unassignedIds : [],
      backups: Array.isArray(obj.backups) ? obj.backups : [],
      pendingRestores: new Map(obj.pendingRestores ?? []),
    }
    return store
  } catch {
    return null
  }
}

function serializeGlobal(global: GlobalFarmStore): string {
  const arr = Array.from(global.deviceKeyToUserAndDevice.entries())
  return JSON.stringify(arr)
}

function deserializeGlobal(json: string): Map<string, { userId: string; deviceId: string }> | null {
  try {
    const arr = JSON.parse(json) as [string, { userId: string; deviceId: string }][]
    return new Map(Array.isArray(arr) ? arr : [])
  } catch {
    return null
  }
}

// In-memory flag so we only hydrate from KV once per user per instance
const hydratedUsers = new Set<string>()
let globalHydrated = false

/** Load user store from KV into memory if not already loaded. Call at start of API that uses store. */
export async function hydrateUserStore(userId: string): Promise<void> {
  if (!isKVConfigured() || hydratedUsers.has(userId)) return
  const raw = await kvGet(USER_KEY_PREFIX + userId)
  if (!raw) {
    hydratedUsers.add(userId)
    return
  }
  const store = deserializeUserStore(raw)
  if (!store) {
    hydratedUsers.add(userId)
    return
  }
  const global = getGlobal()
  global.userStores.set(userId, store)
  hydratedUsers.add(userId)
}

/** Save current user store to KV. Call after any mutation. */
export async function persistUserStore(userId: string): Promise<void> {
  if (!isKVConfigured()) return
  const store = getStore(userId)
  await kvSet(USER_KEY_PREFIX + userId, serializeUserStore(store))
}

/** Load global deviceKeyToUserAndDevice from KV. Call when resolving device key. */
export async function hydrateGlobal(): Promise<void> {
  if (!isKVConfigured() || globalHydrated) return
  const raw = await kvGet(GLOBAL_KEY)
  globalHydrated = true
  if (!raw) return
  const map = deserializeGlobal(raw)
  if (map) {
    const global = getGlobal()
    map.forEach((v, k) => global.deviceKeyToUserAndDevice.set(k, v))
  }
}

/** Save global map to KV. Call after device create/delete. */
export async function persistGlobal(): Promise<void> {
  if (!isKVConfigured()) return
  const global = getGlobal()
  await kvSet(GLOBAL_KEY, serializeGlobal(global))
}

export function isPersistenceEnabled(): boolean {
  return isKVConfigured()
}
