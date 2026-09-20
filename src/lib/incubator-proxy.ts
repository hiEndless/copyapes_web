export type ProxyEgressIps = {
  egress_ips: string[]
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
      // keep stable fallback
    }
    throw new Error(message)
  }
  return (await response.json()) as T
}

export function listIncubatorProxyEgressIps() {
  return request<ProxyEgressIps>('proxy-assignments/egress-ips')
}
