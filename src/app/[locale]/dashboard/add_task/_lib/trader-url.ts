export type ExchangePlatform = 'okx' | 'binance'

export const TRADER_URL_PLACEHOLDER: Record<ExchangePlatform, string> = {
  okx: 'https://www.okx.com/zh-hans/copy-trading/account/...',
  binance: 'https://www.binance.com/zh-CN/copy-trading/lead-details/...',
}

export const INVALID_TRADER_URL = '无效的链接格式'
export const SELECT_EXCHANGE_FIRST = '请先选择交易所'

function extractSegmentAfter(segments: string[], key: string): string | null {
  const idx = segments.indexOf(key)

  if (idx === -1 || idx >= segments.length - 1) return null

  return segments[idx + 1]
}

export function parseTraderUrl(urlStr: string, targetExchange: ExchangePlatform): string | null {
  try {
    const url = new URL(urlStr.trim())
    const segments = url.pathname.split('/').filter(Boolean)

    if (targetExchange === 'okx') {
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

export function isInvalidUniqueName(uniqueName: string): boolean {
  return !uniqueName || uniqueName === INVALID_TRADER_URL || uniqueName === SELECT_EXCHANGE_FIRST
}
