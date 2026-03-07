import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'
import { hydrateUserStore, persistUserStore, requireDatabaseResponse } from '@/lib/persistence'

/**
 * Assign accounts to device(s).
 * - Devices: from GET /api/devices (same store).
 * - Accounts: from Unassigned (store.unassignedIds). When assigned, they are added to device.accountIds
 *   and removed from unassignedIds, then persisted. Device detail shows accounts in that device.
 * Body: { deviceIds: string[], countPerDevice?: number, fillToTarget?: boolean, targetAmount?: number }
 */
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dbErr = requireDatabaseResponse()
  if (dbErr) return dbErr
  try {
    const body = await req.json()
    const deviceIds = (body?.deviceIds || body?.device_ids || []) as string[]
    const accountIds = (body?.accountIds || body?.account_ids || []) as string[]
    const countPerDevice = typeof body?.countPerDevice === 'number' ? body.countPerDevice : body?.accounts_per_device
    const fillToTarget = body?.fillToTarget === true
    const targetAmount = Math.max(0, parseInt(body?.targetAmount || body?.target_amount, 10) || 0)

    if (!deviceIds.length) {
      return NextResponse.json({ error: 'deviceIds required' }, { status: 400 })
    }

    await hydrateUserStore(session.user)
    const store = getStore(session.user)

    const existingDeviceIds = deviceIds.filter((id) => store.devices.has(id))
    if (existingDeviceIds.length === 0) {
      return NextResponse.json({ error: 'No valid devices found. Refresh the page and try again.' }, { status: 400 })
    }
    const idsToUse = existingDeviceIds

    const unassignedCopy = [...store.unassignedIds]
    let toAssign = accountIds.length
      ? accountIds.filter((id: string) => unassignedCopy.includes(id))
      : unassignedCopy

    const assigned: { deviceId: string; accountIds: string[] }[] = []
    if (fillToTarget && targetAmount > 0) {
      for (const did of idsToUse) {
        const device = store.devices.get(did)
        if (!device) continue
        const need = targetAmount - device.accountIds.length
        if (need <= 0) continue
        const take = toAssign.splice(0, need)
        if (take.length === 0) continue
        take.forEach((accId) => {
          device.accountIds.push(accId)
          const idx = store.unassignedIds.indexOf(accId)
          if (idx !== -1) store.unassignedIds.splice(idx, 1)
        })
        assigned.push({ deviceId: did, accountIds: take })
      }
    } else {
      const per = countPerDevice ? Math.max(1, countPerDevice) : Math.max(1, Math.floor(toAssign.length / idsToUse.length))
      for (const did of idsToUse) {
        const device = store.devices.get(did)
        if (!device) continue
        const take = toAssign.splice(0, per)
        if (take.length === 0) continue
        take.forEach((accId) => {
          device.accountIds.push(accId)
          const idx = store.unassignedIds.indexOf(accId)
          if (idx !== -1) store.unassignedIds.splice(idx, 1)
        })
        assigned.push({ deviceId: did, accountIds: take })
      }
    }

    const totalAssigned = assigned.reduce((sum, a) => sum + a.accountIds.length, 0)
    await persistUserStore(session.user)
    return NextResponse.json({
      assigned,
      totalAssigned,
      remaining: toAssign.length,
    })
  } catch (e) {
    console.error('[assign]', e)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
