import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { getSessionFromRequest, getSessionCookieName } from '@/lib/auth'

/** Assign accounts to device(s). Body: { deviceIds: string[], accountIds?: string[], countPerDevice?: number } */
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req.cookies.get(getSessionCookieName())?.value)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const deviceIds = (body?.deviceIds || body?.device_ids || []) as string[]
    const accountIds = (body?.accountIds || body?.account_ids || []) as string[]
    const countPerDevice = typeof body?.countPerDevice === 'number' ? body.countPerDevice : body?.accounts_per_device
    const fillToTarget = body?.fillToTarget === true
    const targetAmount = Math.max(0, parseInt(body?.targetAmount || body?.target_amount, 10) || 0)
    const store = getStore(session.user)
    if (!deviceIds.length) {
      return NextResponse.json({ error: 'deviceIds required' }, { status: 400 })
    }
    const unassignedCopy = [...store.unassignedIds]
    let toAssign = accountIds.length
      ? accountIds.filter((id: string) => unassignedCopy.includes(id))
      : unassignedCopy
    const assigned: { deviceId: string; accountIds: string[] }[] = []
    if (fillToTarget && targetAmount > 0) {
      for (const did of deviceIds) {
        const device = store.devices.get(did)
        if (!device) continue
        const need = targetAmount - device.accountIds.length
        if (need <= 0) continue
        const take = toAssign.splice(0, need)
        take.forEach((accId) => {
          device.accountIds.push(accId)
          const idx = store.unassignedIds.indexOf(accId)
          if (idx !== -1) store.unassignedIds.splice(idx, 1)
        })
        assigned.push({ deviceId: did, accountIds: take })
      }
    } else {
      const per = countPerDevice ? Math.max(1, countPerDevice) : Math.max(1, Math.floor(toAssign.length / deviceIds.length))
      for (const did of deviceIds) {
        const device = store.devices.get(did)
        if (!device) continue
        const take = toAssign.splice(0, per)
        take.forEach((accId) => {
          device.accountIds.push(accId)
          const idx = store.unassignedIds.indexOf(accId)
          if (idx !== -1) store.unassignedIds.splice(idx, 1)
        })
        assigned.push({ deviceId: did, accountIds: take })
      }
    }
    return NextResponse.json({ assigned, remaining: toAssign.length })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
