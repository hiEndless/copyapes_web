export type IncubatorLeaderPositionStatus =
  | 'LIVE'
  | 'RECOVERING'
  | 'STALE'
  | 'DISCONNECTED'
  | 'EMPTY'
  | 'UNAVAILABLE'

export type IncubatorLeaderPositionItem = {
  symbol: string
  position_side: string
  margin_mode: string
  quantity: string
  leverage: string | null
  entry_price: string | null
  mark_price: string | null
  unrealized_pnl: string | null
  unrealized_pnl_ratio?: string | null
  exchange_position_id: string | null
}

export type IncubatorLeaderPosition = {
  round_id: string
  campaign_id: string
  leader_api_id: string
  leader_api_label: string
  exchange: string
  status: IncubatorLeaderPositionStatus
  baseline_status: string | null
  exchange_updated_at: number | null
  saved_at: number | null
  positions: IncubatorLeaderPositionItem[]
}

export async function getIncubatorLeaderPosition(roundId: string): Promise<IncubatorLeaderPosition> {
  const token = localStorage.getItem('token')

  if (!token) throw new Error('请先登录 CopyApes')

  const response = await fetch(`/api/incubator/rounds/${encodeURIComponent(roundId)}/leader-position`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store'
  })

  if (!response.ok) {
    let message = `领单仓位加载失败（${response.status}）`

    try {
      const payload = (await response.json()) as {
        detail?: string | { message?: string; reason_code?: string }
      }

      if (typeof payload.detail === 'string') message = payload.detail
      else message = payload.detail?.message || payload.detail?.reason_code || message
    } catch {
      // Do not expose upstream bodies.
    }

    throw new Error(message)
  }

  return (await response.json()) as IncubatorLeaderPosition
}
