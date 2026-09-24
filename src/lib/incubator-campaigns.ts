export type CampaignMember = {
  id: string
  api_account_id: string
  api_label: string
  relation: 'SAME' | 'INVERSE'
  result: 'ACTIVE' | 'PROMOTED' | 'ELIMINATED' | 'WINNER'
}

export type CampaignRound = {
  id: string
  round_number: number
  expected_member_count: number
  status: string
  financial_status: string
  leader_member_id: string | null
  setup_version: number
  can_start: boolean
  start_blockers: string[]
  members: CampaignMember[]
}

export type IncubatorCampaign = {
  id: string
  code: string
  name: string
  exchange: 'BINANCE' | 'OKX' | 'GATE'
  status: string
  initial_account_count: number
  total_rounds: number
  current_round: number
  winner_api_id: string | null
  created_at: string
  rounds: CampaignRound[]
}

async function request<T>(path = 'campaigns', init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('请先登录 CopyApes')
  const response = await fetch(`/api/incubator/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {})
    },
    cache: 'no-store'
  })
  if (!response.ok) {
    let message = `请求失败（${response.status}）`
    try {
      const payload = (await response.json()) as { detail?: string | { message?: string; reason_code?: string } }
      if (typeof payload.detail === 'string') message = payload.detail
      else message = payload.detail?.message || payload.detail?.reason_code || message
    } catch {
      // Stable fallback; do not expose upstream response bodies.
    }
    throw new Error(message)
  }
  return (await response.json()) as T
}

export function listIncubatorCampaigns(status?: 'completed') {
  const query = status ? `?status=${status}` : ''
  return request<IncubatorCampaign[]>(`campaigns${query}`)
}

export function createIncubatorCampaign(name: string, apiAccountIds: string[]) {
  return request<IncubatorCampaign>('campaigns', {
    method: 'POST',
    body: JSON.stringify({ name, api_account_ids: apiAccountIds })
  })
}

export function updateIncubatorRoundSetup(input: {
  roundId: string
  setupVersion: number
  leaderMemberId: string
  assignments: Array<{ member_id: string; relation: 'SAME' | 'INVERSE' }>
}) {
  return request<IncubatorCampaign>(`rounds/${encodeURIComponent(input.roundId)}/setup`, {
    method: 'PUT',
    body: JSON.stringify({
      setup_version: input.setupVersion,
      leader_member_id: input.leaderMemberId,
      assignments: input.assignments
    })
  })
}

export function startIncubatorRound(input: {
  roundId: string
  setupVersion: number
  requestId: string
}) {
  return request<IncubatorCampaign>(`rounds/${encodeURIComponent(input.roundId)}/start`, {
    method: 'POST',
    body: JSON.stringify({
      setup_version: input.setupVersion,
      request_id: input.requestId
    })
  })
}

export function terminateIncubatorRound(input: {
  roundId: string
  requestId: string
  winnerRelation: 'SAME' | 'INVERSE'
}) {
  return request<IncubatorCampaign>(`rounds/${encodeURIComponent(input.roundId)}/terminate`, {
    method: 'POST',
    body: JSON.stringify({
      request_id: input.requestId,
      winner_relation: input.winnerRelation
    })
  })
}

export function reconcileIncubatorRoundSettlement(roundId: string) {
  return request<IncubatorCampaign>(`rounds/${encodeURIComponent(roundId)}/reconcile-settlement`, {
    method: 'POST'
  })
}

export function endIncubatorCampaign(campaignId: string) {
  return request<IncubatorCampaign>(`campaigns/${encodeURIComponent(campaignId)}/end`, {
    method: 'POST'
  })
}
