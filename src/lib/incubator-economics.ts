export type IncubatorEconomicsDataStatus = 'PROVISIONAL' | 'FINAL' | 'FAILED'

export type IncubatorEconomicsTotals = {
  position_pnl: string
  fee: string
  funding_fee: string
  liquidation_penalty: string
  settled_pnl: string
  realized_pnl: string
  close_volume: string
  trade_count: number
  trade_cycle_count: number
}

export type IncubatorSettlementProgress = {
  total: number
  settled: number
  failed: number
  pending: number
  data_status: IncubatorEconomicsDataStatus
}

export type IncubatorMemberEconomics = {
  round_member_id: string
  api_id: string
  api_label: string
  relation: 'SAME' | 'INVERSE'
  result: 'ACTIVE' | 'PROMOTED' | 'ELIMINATED' | 'WINNER'
  settlement: IncubatorSettlementProgress
  totals: IncubatorEconomicsTotals
}

export type IncubatorRoundEconomics = {
  round_id: string
  round_number: number
  status: string
  financial_status: 'PENDING' | 'PARTIAL' | 'SETTLED' | 'FAILED'
  settlement: IncubatorSettlementProgress
  totals: IncubatorEconomicsTotals
  same_totals: IncubatorEconomicsTotals
  inverse_totals: IncubatorEconomicsTotals
  members: IncubatorMemberEconomics[]
}

export type IncubatorCampaignEconomics = {
  campaign_id: string
  code: string
  name: string
  exchange: 'OKX'
  status: string
  settlement: IncubatorSettlementProgress
  totals: IncubatorEconomicsTotals
  rounds: IncubatorRoundEconomics[]
}

export async function getIncubatorCampaignEconomics(
  campaignId: string
): Promise<IncubatorCampaignEconomics> {
  const token = localStorage.getItem('token')

  if (!token) throw new Error('请先登录 CopyApes')

  const response = await fetch(
    `/api/incubator/campaigns/${encodeURIComponent(campaignId)}/economics`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store'
    }
  )

  if (!response.ok) {
    let message = `收益数据加载失败（${response.status}）`

    try {
      const payload = (await response.json()) as {
        detail?: string | { message?: string; reason_code?: string }
      }

      if (typeof payload.detail === 'string') message = payload.detail
      else message = payload.detail?.message || payload.detail?.reason_code || message
    } catch {
      // Do not expose upstream response bodies.
    }

    throw new Error(message)
  }

  return (await response.json()) as IncubatorCampaignEconomics
}
