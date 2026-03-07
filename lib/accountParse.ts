import type { UserStore } from './store'
import type { Account } from './store'

export function parseAccountLine(line: string): { username: string; password: string; cookie: string; privateServerLink?: string } | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  const parts = trimmed.split(':')
  if (parts.length < 3) return null
  const username = parts[0]?.trim() || ''
  const password = parts[1]?.trim() || ''
  let cookie: string
  let privateServerLink: string | undefined
  if (parts.length === 3) {
    cookie = parts[2]?.trim() || ''
  } else {
    const last = parts[parts.length - 1]?.trim() || ''
    const isUrl = /^https?:\/\//i.test(last)
    if (isUrl) {
      privateServerLink = last
      cookie = parts.slice(2, -1).join(':').trim()
    } else {
      cookie = parts.slice(2).join(':').trim()
    }
  }
  if (!username && !cookie) return null
  return { username, password, cookie, privateServerLink }
}

/** Add accounts from lines to a user store. Returns number added. */
export function addAccountsFromLines(store: UserStore, lines: string[], baseIdPrefix = 'acc'): number {
  const baseId = `${baseIdPrefix}_${Date.now()}`
  let added = 0
  lines.forEach((line: string, i: number) => {
    const parsed = parseAccountLine(line)
    if (!parsed) return
    const id = `${baseId}_${i}`
    if (!store.accounts.has(id)) {
      store.accounts.set(id, {
        id,
        username: parsed.username,
        password: parsed.password,
        cookie: parsed.cookie,
        privateServerLink: parsed.privateServerLink,
      } as Account)
      store.unassignedIds.push(id)
      added++
    }
  })
  return added
}
