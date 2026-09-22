import type { EntitlementProfileResponse } from '@/api/settings'

export const INCUBATOR_SSO_CONSENT_KEY = 'incubatorSsoConsent'
export const INCUBATOR_SESSION_KEY = 'incubatorSession'

export type IncubatorSsoDisposition = 'created' | 'updated' | 'unchanged' | 'stale_ignored'

export type IncubatorSsoLoginResult = {
  user_id: string
  workspace_id: string
  status: string
  profile_version: number
  disposition: IncubatorSsoDisposition
}

export type IncubatorSession = {
  user_id: string
  workspace_id: string
  profile_version: number
  consented_at: number
}

export function hasIncubatorSsoConsent(): boolean {
  if (typeof window === 'undefined') return false

  return localStorage.getItem(INCUBATOR_SSO_CONSENT_KEY) === '1'
}

export function clearIncubatorAuthState(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(INCUBATOR_SSO_CONSENT_KEY)
  localStorage.removeItem(INCUBATOR_SESSION_KEY)
}

export function markIncubatorSsoConsent(session: Omit<IncubatorSession, 'consented_at'>): void {
  localStorage.setItem(INCUBATOR_SSO_CONSENT_KEY, '1')
  localStorage.setItem(
    INCUBATOR_SESSION_KEY,
    JSON.stringify({
      ...session,
      consented_at: Date.now()
    } satisfies IncubatorSession)
  )
}

export function readStudioVip(): boolean | null {
  try {
    const stored = localStorage.getItem('entitlementProfile')

    if (!stored) return null

    const profile = JSON.parse(stored) as EntitlementProfileResponse

    return Boolean(profile?.is_studio_vip)
  } catch {
    return false
  }
}

/** Root operators may bind DEMO (flag=1) API accounts. */
export function canBindIncubatorDemoApi(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const raw = localStorage.getItem('userInfo')
    if (!raw) return false
    const user = JSON.parse(raw) as { id?: number; name?: string }
    return Number(user.id) === 1 || String(user.name || '').trim() === 'root'
  } catch {
    return false
  }
}

export async function loginIncubatorSso(): Promise<IncubatorSsoLoginResult> {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('missing_copyapes_token')
  }

  const response = await fetch('/api/incubator/auth/sso/login', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    let detail = `http_${response.status}`

    try {
      const payload = (await response.json()) as { detail?: string }

      if (payload.detail) detail = payload.detail
    } catch {
      // ignore parse errors
    }

    throw new Error(detail)
  }

  return (await response.json()) as IncubatorSsoLoginResult
}
