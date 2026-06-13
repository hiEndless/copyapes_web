import { getSiteUrl } from '@/lib/seo'

export const INVITE_CODE_STORAGE_KEY = 'copyapes_invite_code'
export const INVITE_CODE_PATTERN = /^[A-Za-z0-9_-]{4,32}$/

export function isValidInviteCode(code: string): boolean {
  return INVITE_CODE_PATTERN.test(code.trim())
}

export function persistInviteCode(code: string): void {
  const trimmed = code.trim()
  if (!isValidInviteCode(trimmed)) return
  try {
    localStorage.setItem(INVITE_CODE_STORAGE_KEY, trimmed)
  } catch {
    // ignore quota / private mode
  }
}

export function getPersistedInviteCode(): string | null {
  try {
    const stored = localStorage.getItem(INVITE_CODE_STORAGE_KEY)
    if (!stored || !isValidInviteCode(stored)) return null
    return stored.trim()
  } catch {
    return null
  }
}

export function getInviteRegisterUrl(inviteCode: string, origin?: string): string {
  const trimmed = inviteCode.trim()
  if (!trimmed) return ''

  const base = (origin?.trim() || getSiteUrl()).replace(/\/$/, '')
  return `${base}/register?invite_code=${encodeURIComponent(trimmed)}`
}
