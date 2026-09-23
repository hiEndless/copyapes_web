export type IncubatorDingtalkChannel = {
  enabled: boolean
  configured: boolean
  webhook: string
  secret: string
  webhook_hint: string
  updated_at: string | null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
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

export function getIncubatorDingtalkChannel() {
  return request<IncubatorDingtalkChannel>('notifications/dingtalk')
}

export function saveIncubatorDingtalkChannel(webhook: string, secret: string) {
  return request<IncubatorDingtalkChannel>('notifications/dingtalk', {
    method: 'PUT',
    body: JSON.stringify({ webhook, secret })
  })
}

export function setIncubatorDingtalkEnabled(enabled: boolean) {
  return request<IncubatorDingtalkChannel>('notifications/dingtalk', {
    method: 'PATCH',
    body: JSON.stringify({ enabled })
  })
}

export function testIncubatorDingtalkChannel() {
  return request<{ sent: boolean }>('notifications/dingtalk/test', { method: 'POST' })
}
