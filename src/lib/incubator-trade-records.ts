export type IncubatorLeaderTradeRecord = {
  id: string
  leader_event_id: string
  round_member_id: string
  api_id: string
  exchange: string
  flag: number
  symbol: string
  action: 'OPEN' | 'ADD' | 'REDUCE' | 'CLOSE'
  side: 'BUY' | 'SELL'
  position_side: 'LONG' | 'SHORT'
  quantity: string
  margin_mode: string
  leverage: string | null
  exchange_order_id: string | null
  exchange_trade_id: string | null
  occurred_at: string
}

export type IncubatorFollowerTradeRecord = {
  id: string
  leader_event_id: string
  instruction_id: string
  round_member_id: string
  leader_api_id: string
  api_id: string
  relation: 'SAME' | 'INVERSE'
  exchange: string
  flag: number
  symbol: string
  action: 'OPEN' | 'ADD' | 'REDUCE' | 'CLOSE'
  side: 'BUY' | 'SELL'
  position_side: 'LONG' | 'SHORT'
  quantity: string
  margin_mode: string | null
  leverage: string | null
  status: string
  exchange_order_id: string | null
  reason_code: string | null
  retry_count: number
  occurred_at: string | null
  terminal_at: string | null
}

export type IncubatorTradeEvent = {
  leader_event_id: string
  occurred_at: string
  leader: IncubatorLeaderTradeRecord | null
  followers: IncubatorFollowerTradeRecord[]
}

export type IncubatorTradeRecordPage = {
  items: IncubatorTradeEvent[]
  next_cursor: string | null
}

export async function listIncubatorTradeRecords(input: {
  campaignId: string
  roundId: string
  apiId: string
  limit?: number
  cursor?: string | null
}): Promise<IncubatorTradeRecordPage> {
  const token = localStorage.getItem('token')

  if (!token) throw new Error('请先登录 CopyApes')

  const params = new URLSearchParams({
    round_id: input.roundId,
    api_id: input.apiId,
    limit: String(input.limit ?? 100)
  })

  if (input.cursor) params.set('cursor', input.cursor)

  const response = await fetch(
    `/api/incubator/campaigns/${encodeURIComponent(input.campaignId)}/trade-records?${params}`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store'
    }
  )

  if (!response.ok) {
    let message = `交易记录加载失败（${response.status}）`

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

  return (await response.json()) as IncubatorTradeRecordPage
}
