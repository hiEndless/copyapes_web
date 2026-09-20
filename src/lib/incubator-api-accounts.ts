export type IncubatorApiAccount = {
  id: string
  label: string
  exchange: 'BINANCE' | 'OKX' | 'GATE'
  environment: 'LIVE' | 'DEMO'
  flag: 0 | 1
  status: string
  masked_api_key: string
  exchange_uid: string | null
  trade_permission: boolean
  position_mode: string | null
  available_balance: string | number | null
  balance_asset: string | null
  proxy_status: 'BOUND'
  last_checked_at: string | null
  last_error_code: string | null
  created_at: string
}

export type AddIncubatorApiAccount = {
  exchange: IncubatorApiAccount['exchange']
  label: string
  api_key: string
  secret_key: string
  passphrase?: string
  flag?: 0 | 1
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('请先登录 CopyApes')
  const response = await fetch(`/api/incubator/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers
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
      // keep stable fallback without exposing upstream bodies
    }
    throw new Error(message)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function listIncubatorApiAccounts() {
  return request<IncubatorApiAccount[]>('api-accounts')
}

export function addIncubatorApiAccount(input: AddIncubatorApiAccount) {
  return request<IncubatorApiAccount>('api-accounts', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      flag: input.flag ?? 0
    })
  })
}

export function renameIncubatorApiAccount(id: string, label: string) {
  return request<IncubatorApiAccount>(`api-accounts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ label })
  })
}

export function checkIncubatorApiAccountHealth(id: string) {
  return request<IncubatorApiAccount>(`api-accounts/${encodeURIComponent(id)}/health-check`, {
    method: 'POST'
  })
}

export function deleteIncubatorApiAccount(id: string) {
  return request<void>(`api-accounts/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
