import type { StudioTaskItem } from './types'

const EXCHANGE_LABEL: Record<string, string> = {
  okx: 'OKX',
  binance: 'Binance',
  gate: 'Gate',
  bitget: 'Bitget',
  weex: 'WEEX',
  htx: 'HTX'
}

type TranslateFn = {
  (key: string, values?: Record<string, string | number | Date>): string
}

export const mapApiPlatformToExchangeKey = (platform: number | string | undefined) => {
  const p = String(platform ?? '').trim()
  if (p === '1') return 'okx'
  if (p === '2') return 'binance'
  if (p === '3') return 'gate'
  if (p === '4') return 'bitget'
  if (p === '5') return 'weex'
  if (p === '6') return 'htx'

  const lower = p.toLowerCase()
  if (lower in EXCHANGE_LABEL) return lower

  return lower || 'unknown'
}

export const getExchangeLabel = (platform: number | string | undefined, t: TranslateFn) => {
  const key = mapApiPlatformToExchangeKey(platform)
  return EXCHANGE_LABEL[key] ?? (key === 'unknown' ? t('utils.unknownExchange') : key.toUpperCase())
}

export const resolveInvestment = (task: StudioTaskItem) => {
  if (task.investment != null && task.investment !== '') return String(task.investment)
  if (task.sums != null && task.sums !== '') return String(task.sums)
  return '-'
}

export const ellipsisMiddle = (value: string, start = 6, end = 4) => {
  if (!value) return '-'
  if (value.length <= start + end + 3) return value
  return `${value.slice(0, start)}...${value.slice(-end)}`
}
