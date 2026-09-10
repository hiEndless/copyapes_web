export type CookieExchangePlatform = 'okx' | 'binance' | 'fomo'

/** Cookie exchange 码 → 平台；未知返回 null */
export function mapCookieExchangeToPlatform(exchange: unknown): CookieExchangePlatform | null {
  const value = String(exchange ?? '').trim()

  if (value === '1') return 'okx'
  if (value === '2') return 'binance'
  if (value === '99') return 'fomo'

  return null
}
