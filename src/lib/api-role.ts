const LEADER_ROLE_TYPES: Record<number, ReadonlySet<string>> = {
  1: new Set(['1']),
  2: new Set(['1']),
  3: new Set(['1', '3']),
  4: new Set(['trader']),
  5: new Set(['trader']),
  6: new Set(['trader']),
}

const PLATFORM_NAME_TO_ID: Record<string, number> = {
  okx: 1,
  binance: 2,
  gate: 3,
  bitget: 4,
  weex: 5,
  htx: 6,
}

export function resolveApiPlatformId(platform: string | number | null | undefined): number | null {
  if (platform == null || platform === '') return null
  const raw = String(platform).trim()
  if (/^\d+$/.test(raw)) return Number(raw)
  return PLATFORM_NAME_TO_ID[raw.toLowerCase()] ?? null
}

/** Mirror backend ApiRolePolicy.is_leader for list display. */
export function isLeaderApi(platform: string | number | null | undefined, roleType: unknown): boolean {
  const platformId = resolveApiPlatformId(platform)
  if (platformId == null) return false
  const accepted = LEADER_ROLE_TYPES[platformId]
  if (!accepted) return false
  return accepted.has(String(roleType ?? '').trim().toLowerCase())
}
