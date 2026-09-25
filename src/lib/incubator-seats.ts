export type IncubatorExchange = 'BINANCE' | 'OKX' | 'GATE'

export type SeatSnapshot = {
  exchange: IncubatorExchange
  base_seats: number
  granted_seats: number
  total_seats: number
  active_chargeable: number
  active_rebate_free: number
  remaining_seats: number
  over_limit: number
}

export type PurchasedSeat = {
  seat_id: string
  exchange: IncubatorExchange
  expires_at: string
}

export type SeatOrder = {
  id: string
  status: string
  total_usdt: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')

  if (!token) throw new Error('请先登录 CopyApes')

  const response = await fetch(`/api/incubator/entitlements/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { detail?: { reason_code?: string } }

    throw new Error(body.detail?.reason_code || `席位请求失败（${response.status}）`)
  }

  return await response.json() as T
}

export const listSeatSnapshots = () => request<SeatSnapshot[]>('seats')
export const listPurchasedSeats = () => request<PurchasedSeat[]>('purchased-seats')

export function createSeatOrder(input: {
  kind: 'PURCHASE' | 'RENEWAL'
  exchange: IncubatorExchange
  quantity: number
  seat_ids?: string[]
  request_id: string
}) {
  return request<SeatOrder>('seat-orders', { method: 'POST', body: JSON.stringify(input) })
}
