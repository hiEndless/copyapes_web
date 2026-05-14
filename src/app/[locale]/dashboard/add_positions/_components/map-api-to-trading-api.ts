import type { QuantityUnitLabel, TradingApiMock } from './types'

/** `/apiadd/` 列表单项（字段与后端仓储对齐，前端可能收到 string/number 混用） */
export type ApiAddListRow = {
  id: number
  platform: number | string
  api_name?: string | null
  usdt?: number | string | null
  is_readonly?: boolean | number | string | null
}

const EXCHANGE_META: Record<string, { name: string; logo: string }> = {
  okx: { name: 'OKX', logo: '/exchanges/okx.png' },
  binance: { name: 'Binance', logo: '/exchanges/binance.png' },
  gate: { name: 'Gate', logo: '/exchanges/gate.png' },
  bitget: { name: 'Bitget', logo: '/exchanges/bitget.png' },
}

/** 与 `dashboard/api` 页 `getPlatformString` 保持一致 */
export function mapPlatformToExchangeKey(platform: number | string): string {
  const p = String(platform).trim()
  if (p === '1') return 'okx'
  if (p === '2') return 'binance'
  if (p === '3') return 'gate'
  if (p === '4') return 'bitget'
  const lower = p.toLowerCase()
  if (lower in EXCHANGE_META) return lower

  return lower || 'okx'
}

/** 开仓量单位：币安 / Bitget 为个数，OKX / Gate 为张数 */
export function getOpenQuantityUnit(exchangeKey: string): QuantityUnitLabel {
  const k = exchangeKey.toLowerCase()
  if (k === 'binance' || k === 'bitget') return '个'
  if (k === 'okx' || k === 'gate') return '张'

  return '个'
}

function isReadonlyApiRow(row: ApiAddListRow): boolean {
  const v = row.is_readonly
  if (v === true || v === 1 || v === '1') return true
  if (typeof v === 'string' && v.toLowerCase() === 'true') return true

  return false
}

export function mapApiAddListRowToTradingApi(row: ApiAddListRow): TradingApiMock | null {
  if (!row || typeof row.id !== 'number') return null
  if (isReadonlyApiRow(row)) return null

  const exchangeKey = mapPlatformToExchangeKey(row.platform)
  const meta = EXCHANGE_META[exchangeKey] ?? {
    name: exchangeKey ? exchangeKey.toUpperCase() : '未知',
    logo: '/exchanges/okx.png',
  }

  const raw = row.usdt
  let balanceUsdt = 0
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    balanceUsdt = raw
  } else if (raw !== null && raw !== undefined && raw !== '') {
    const n = Number(raw)
    balanceUsdt = Number.isFinite(n) ? n : 0
  }

  const label = (row.api_name && String(row.api_name).trim()) || `API ${row.id}`

  return {
    id: String(row.id),
    exchangeName: meta.name,
    label,
    balanceUsdt,
    exchangeKey,
    logoSrc: meta.logo,
    quantityUnit: getOpenQuantityUnit(exchangeKey),
  }
}

export function listTradingApisFromApiAdd(rows: unknown[]): TradingApiMock[] {
  if (!Array.isArray(rows)) return []
  const out: TradingApiMock[] = []

  for (const row of rows) {
    const item = mapApiAddListRowToTradingApi(row as ApiAddListRow)
    if (item) out.push(item)
  }

  return out
}
