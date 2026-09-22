import type { IncubatorLeaderPositionItem } from '@/lib/incubator-leader-position'

export type IncubatorMemberPositionStatus = 'LIVE' | 'EMPTY' | 'UNAVAILABLE'

export type IncubatorMemberPositions = {
  round_id: string
  campaign_id: string
  member_id: string
  api_id: string
  api_label: string
  exchange: string
  status: IncubatorMemberPositionStatus
  reason_code: string | null
  positions: IncubatorLeaderPositionItem[]
}

export type IncubatorMemberPositionHistoryItem = {
  symbol: string
  position_side: string
  margin_mode: string
  quantity: string
  leverage: string | null
  entry_price: string | null
  realized_pnl: string | null
  realized_pnl_ratio: string | null
  exchange_position_id: string | null
  opened_at: string | null
  closed_at: string
}

export type IncubatorMemberPositionHistory = {
  round_id: string
  campaign_id: string
  member_id: string
  api_id: string
  api_label: string
  exchange: string
  status: IncubatorMemberPositionStatus
  reason_code: string | null
  positions: IncubatorMemberPositionHistoryItem[]
}

const REASON_TEXT: Record<string, string> = {
  POSITION_ACCOUNT_INVALID: '账号配置无效',
  POSITION_ACCOUNT_MISMATCH: '账号与项目交易所不一致',
  POSITION_PROXY_UNAVAILABLE: '代理不可用',
  POSITION_QUERY_CONFIG_INVALID: '持仓查询未配置',
  POSITION_CREDENTIAL_DECRYPT_FAILED: '账号凭据不可用',
  POSITION_QUERY_FAILED: '持仓查询失败',
  POSITION_HISTORY_UNSUPPORTED: '币安暂不支持历史持仓',
  MEMBER_NOT_FOUND: '未找到该账号'
}

export function memberPositionReasonText(reasonCode: string | null | undefined): string {
  if (!reasonCode) return '持仓暂不可用'
  return REASON_TEXT[reasonCode] || '持仓暂不可用'
}

export const MEMBER_POSITION_CACHE_TTL_MS = 20_000

type MemberPositionCacheEntry = {
  expiresAt: number
  snapshot: IncubatorMemberPositions
}

const memberPositionCache = new Map<string, MemberPositionCacheEntry>()
const memberPositionPending = new Map<string, Promise<IncubatorMemberPositions>>()

function memberPositionCacheKey(roundId: string, memberId: string): string {
  return `${roundId}:${memberId}`
}

export function peekCachedMemberPositions(roundId: string, memberId: string): IncubatorMemberPositions | null {
  const entry = memberPositionCache.get(memberPositionCacheKey(roundId, memberId))
  if (!entry || entry.expiresAt <= Date.now()) return null
  return entry.snapshot
}

export function loadCachedMemberPositions(roundId: string, memberId: string): Promise<IncubatorMemberPositions> {
  const key = memberPositionCacheKey(roundId, memberId)
  const cached = peekCachedMemberPositions(roundId, memberId)

  if (cached) return Promise.resolve(cached)

  const pending = memberPositionPending.get(key)

  if (pending) return pending

  const request = getIncubatorMemberPositions(roundId, memberId)
    .then(snapshot => {
      memberPositionCache.set(key, { expiresAt: Date.now() + MEMBER_POSITION_CACHE_TTL_MS, snapshot })
      memberPositionPending.delete(key)
      return snapshot
    })
    .catch(error => {
      memberPositionPending.delete(key)
      throw error
    })

  memberPositionPending.set(key, request)
  return request
}

export async function getIncubatorMemberPositions(roundId: string, memberId: string): Promise<IncubatorMemberPositions> {
  const token = localStorage.getItem('token')

  if (!token) throw new Error('请先登录 CopyApes')

  const response = await fetch(
    `/api/incubator/rounds/${encodeURIComponent(roundId)}/members/${encodeURIComponent(memberId)}/positions`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store'
    }
  )

  if (!response.ok) {
    let message = `持仓加载失败（${response.status}）`

    try {
      const payload = (await response.json()) as {
        detail?: string | { message?: string; reason_code?: string }
      }
      const reason = typeof payload.detail === 'string' ? payload.detail : payload.detail?.reason_code

      message = memberPositionReasonText(reason)
    } catch {
      // Do not expose upstream bodies.
    }

    throw new Error(message)
  }

  return (await response.json()) as IncubatorMemberPositions
}

const positionHistoryCache = new Map<string, { expiresAt: number; snapshot: IncubatorMemberPositionHistory }>()
const positionHistoryPending = new Map<string, Promise<IncubatorMemberPositionHistory>>()

export function peekCachedMemberPositionHistory(
  roundId: string,
  memberId: string
): IncubatorMemberPositionHistory | null {
  const entry = positionHistoryCache.get(memberPositionCacheKey(roundId, memberId))
  if (!entry || entry.expiresAt <= Date.now()) return null
  return entry.snapshot
}

export function loadCachedMemberPositionHistory(
  roundId: string,
  memberId: string
): Promise<IncubatorMemberPositionHistory> {
  const key = memberPositionCacheKey(roundId, memberId)
  const cached = peekCachedMemberPositionHistory(roundId, memberId)

  if (cached) return Promise.resolve(cached)

  const pending = positionHistoryPending.get(key)

  if (pending) return pending

  const request = getIncubatorMemberPositionHistory(roundId, memberId)
    .then(snapshot => {
      positionHistoryCache.set(key, { expiresAt: Date.now() + MEMBER_POSITION_CACHE_TTL_MS, snapshot })
      positionHistoryPending.delete(key)
      return snapshot
    })
    .catch(error => {
      positionHistoryPending.delete(key)
      throw error
    })

  positionHistoryPending.set(key, request)
  return request
}

export async function getIncubatorMemberPositionHistory(
  roundId: string,
  memberId: string
): Promise<IncubatorMemberPositionHistory> {
  const token = localStorage.getItem('token')

  if (!token) throw new Error('请先登录 CopyApes')

  const response = await fetch(
    `/api/incubator/rounds/${encodeURIComponent(roundId)}/members/${encodeURIComponent(memberId)}/position-history`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store'
    }
  )

  if (!response.ok) {
    let message = `历史持仓加载失败（${response.status}）`

    try {
      const payload = (await response.json()) as {
        detail?: string | { message?: string; reason_code?: string }
      }
      const reason = typeof payload.detail === 'string' ? payload.detail : payload.detail?.reason_code

      message = memberPositionReasonText(reason)
    } catch {
      // Do not expose upstream bodies.
    }

    throw new Error(message)
  }

  return (await response.json()) as IncubatorMemberPositionHistory
}
