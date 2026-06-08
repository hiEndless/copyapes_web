export type ExchangePlatform = 'okx' | 'binance'

export const TRADER_URL_PLACEHOLDER: Record<ExchangePlatform, string> = {
  okx: 'https://www.okx.com/zh-hans/copy-trading/account/...',
  binance: 'https://www.binance.com/zh-CN/copy-trading/lead-details/...',
}

export const INVALID_TRADER_URL = '无效的链接格式'
export const SELECT_EXCHANGE_FIRST = '请先选择交易所'

export function parseTraderUrl(urlStr: string, targetExchange: ExchangePlatform): string | null {
  try {
    const url = new URL(urlStr.trim())
    const segments = url.pathname.split('/').filter(Boolean)

    if (targetExchange === 'okx') {
      if (!url.hostname.includes('okx.com')) return null

      const accountIdx = segments.indexOf('account')

      if (accountIdx === -1 || accountIdx >= segments.length - 1) return null

      return segments[accountIdx + 1]
    }

    if (!url.hostname.includes('binance.com')) return null

    const leadDetailsIdx = segments.indexOf('lead-details')

    if (leadDetailsIdx === -1 || leadDetailsIdx >= segments.length - 1) return null

    return segments[leadDetailsIdx + 1]
  } catch {
    return null
  }
}

export function isInvalidUniqueName(uniqueName: string): boolean {
  return !uniqueName || uniqueName === INVALID_TRADER_URL || uniqueName === SELECT_EXCHANGE_FIRST
}
