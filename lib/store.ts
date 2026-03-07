/**
 * In-memory store per user. Each user has their own devices, accounts, backups.
 * Global map: device_key -> { userId, deviceId } for Tool Click.py auth.
 * On Vercel, state persists only within the same serverless instance.
 */

export interface DeviceAccount {
  username?: string
  data: string
}

export interface Device {
  id: string
  device_key: string
  device_name: string
  lastHeartbeat?: number
  stats?: {
    cpu?: number
    ram_mb?: number
    uptime_seconds?: number
    screenshot_base64?: string
  }
  accountIds: string[]
}

export interface Account {
  id: string
  username: string
  password: string
  cookie: string
  privateServerLink?: string
  deviceId?: string
}

export interface BackupMeta {
  id: string
  filename: string
  format: 'LDPlayer' | 'MuMu Player'
  fileSize: string
  created: string
  updated: string
  downloadUrl?: string
}

export interface PendingRestore {
  device_key: string
  download_url: string
  name: string
  filename: string
}

export interface UserStore {
  devices: Map<string, Device>
  deviceKeyToId: Map<string, string> // local: key -> deviceId for this user
  accounts: Map<string, Account>
  unassignedIds: string[]
  backups: BackupMeta[]
  pendingRestores: Map<string, PendingRestore>
}

declare global {
  // eslint-disable-next-line no-var
  var __farmStore: GlobalFarmStore | undefined
}

export interface GlobalFarmStore {
  userStores: Map<string, UserStore>
  /** Global: device_key -> { userId, deviceId } for Tool auth */
  deviceKeyToUserAndDevice: Map<string, { userId: string; deviceId: string }>
}

function getGlobalStore(): GlobalFarmStore {
  const existing = globalThis.__farmStore
  if (
    typeof existing === 'undefined' ||
    !existing.userStores ||
    !existing.deviceKeyToUserAndDevice
  ) {
    globalThis.__farmStore = {
      userStores: new Map(),
      deviceKeyToUserAndDevice: new Map(),
    }
  }
  return globalThis.__farmStore
}

/** Get store for a specific user. Creates empty store if not exists. */
export function getStore(userId: string): UserStore {
  const global = getGlobalStore()
  let userStore = global.userStores.get(userId)
  if (!userStore) {
    userStore = {
      devices: new Map(),
      deviceKeyToId: new Map(),
      accounts: new Map(),
      unassignedIds: [],
      backups: [],
      pendingRestores: new Map(),
    }
    global.userStores.set(userId, userStore)
    // Seed demo data only for first user (admin) if empty
    if (global.userStores.size === 1 && userId === 'sHuys') {
      const devKey = '00fa7d92a672a0471900a490d115725d3782dcb7eb32c15ebd8497bb54c45326'
      const devId = 'device_1'
      userStore.devices.set(devId, {
        id: devId,
        device_key: devKey,
        device_name: 'Device 1',
        lastHeartbeat: Date.now(),
        accountIds: [],
      })
      userStore.deviceKeyToId.set(devKey, devId)
      global.deviceKeyToUserAndDevice.set(devKey, { userId, deviceId: devId })
      for (let i = 1; i <= 5; i++) {
        const id = `acc_${i}`
        userStore.accounts.set(id, {
          id,
          username: `User${String(i).padStart(3, '0')}`,
          password: 'demo123',
          cookie: 'sid=demo' + i,
          privateServerLink: i % 2 === 0 ? 'https://example.com' : undefined,
        })
        userStore.unassignedIds.push(id)
      }
      userStore.backups.push({
        id: '1',
        filename: 'Demo_Backup_2026.ldbk',
        format: 'LDPlayer',
        fileSize: '256 MB',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      })
    }
  }
  return userStore
}

/** Get global store (for admin: list all users, resolve device key). */
export function getGlobal(): GlobalFarmStore {
  return getGlobalStore()
}
