export type ProxyPackListing = {
  included: Array<{ host_id: number; ip: string }>
  packs: Array<{
    pack_id: string
    expires_at: string
    active: boolean
    members: Array<{ host_id: number; ip: string; enabled: boolean }>
  }>
}

export type ProxyPackOrder = {
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
    const body = await response.json().catch(() => ({})) as {
      detail?: string | { reason_code?: string; message?: string }
    }
    const detail = body.detail
    if (typeof detail === 'string' && detail.trim()) {
      throw new Error(detail)
    }
    if (detail && typeof detail === 'object') {
      const message = detail.message?.trim() || detail.reason_code?.trim()
      if (message) throw new Error(message)
    }
    throw new Error(`代理包请求失败（${response.status}）`)
  }

  return await response.json() as T
}

export const listProxyPacks = () => request<ProxyPackListing>('proxy-packs')

export function createProxyPackOrder(input: {
  request_id: string
  kind: 'PURCHASE' | 'RENEWAL'
  quantity: number
  pack_ids?: string[]
}) {
  return request<ProxyPackOrder>('proxy-pack-orders', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
