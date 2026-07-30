export type ExchangePlatform = 'okx' | 'binance'

const TRADER_ID_PATTERN = /^[A-Za-z0-9_-]+$/

function extractSegmentAfter(segments: string[], key: string): string | null {
  const idx = segments.indexOf(key)

  if (idx === -1 || idx >= segments.length - 1) return null

  return segments[idx + 1]
}

function looksLikeUrl(input: string): boolean {
  return /^https?:\/\//i.test(input) || input.includes('/')
}

function parseDirectTraderId(input: string): string | null {
  const id = input.trim()

  return TRADER_ID_PATTERN.test(id) ? id : null
}

function parseTraderIdFromUrl(urlStr: string, targetExchange: ExchangePlatform): string | null {
  try {
    const trimmed = urlStr.trim()
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const url = new URL(normalized)
    const segments = url.pathname.split('/').filter(Boolean)

    if (targetExchange === 'okx') {
      const copyRelId = url.searchParams.get('copyRelId')?.trim()

      if (copyRelId && /^\d+$/.test(copyRelId)) {
        return copyRelId
      }

      return extractSegmentAfter(segments, 'account')
    }

    const leadId = extractSegmentAfter(segments, 'lead-details')

    if (leadId) return leadId

    const smartMoneyIdx = segments.indexOf('smart-money')

    if (
      smartMoneyIdx !== -1 &&
      segments[smartMoneyIdx + 1] === 'profile' &&
      smartMoneyIdx + 2 < segments.length
    ) {
      return segments[smartMoneyIdx + 2]
    }

    return null
  } catch {
    return null
  }
}

export function parseTraderUrl(input: string, targetExchange: ExchangePlatform): string | null {
  const trimmed = input.trim()

  if (!trimmed) return null

  if (looksLikeUrl(trimmed)) {
    return parseTraderIdFromUrl(trimmed, targetExchange)
  }

  return parseDirectTraderId(trimmed)
}

export function isInvalidUniqueName(uniqueName: string, invalidMarkers: readonly string[] = []): boolean {
  return !uniqueName || invalidMarkers.includes(uniqueName)
}
