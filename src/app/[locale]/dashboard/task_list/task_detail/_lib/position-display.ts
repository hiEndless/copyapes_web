import { getSideTagClass } from './task-log-formatters'
import type { TaskPositionItem } from './types'

export function normalizePosSideTag(posSide?: string, side?: string) {
  const normalized = String(posSide || '').toLowerCase()
  if (normalized === 'long' || normalized === 'short') {
    return normalized.toUpperCase()
  }

  const normalizedSide = String(side || '').toLowerCase()
  if (normalizedSide === 'buy') return 'LONG'
  if (normalizedSide === 'sell') return 'SHORT'

  return String(posSide || side || '').toUpperCase()
}

export function formatPosSideLabel(posSide?: string, side?: string, locale = 'zh') {
  const tag = normalizePosSideTag(posSide, side)
  const isZh = locale.toLowerCase().startsWith('zh')

  if (isZh) {
    if (tag === 'LONG') return '多'
    if (tag === 'SHORT') return '空'
  }

  return tag || '-'
}

export function getPositionSideTagClass(posSide?: string, side?: string) {
  return getSideTagClass(normalizePosSideTag(posSide, side))
}

export function normalizeMgnModeTag(mgnMode?: string) {
  const text = String(mgnMode || '')
    .trim()
    .toLowerCase()
  if (text === 'crossed' || text === 'cross') return 'cross'
  if (text === 'isolated' || text === 'iso') return 'isolated'
  return text
}

export function formatMgnModeLabel(mgnMode?: string, locale = 'zh') {
  const tag = normalizeMgnModeTag(mgnMode)
  if (!tag) return ''

  const isZh = locale.toLowerCase().startsWith('zh')
  if (isZh) {
    if (tag === 'cross') return '全仓'
    if (tag === 'isolated') return '逐仓'
  } else {
    if (tag === 'cross') return 'Cross'
    if (tag === 'isolated') return 'Isolated'
  }

  return tag
}

export function getMgnModeTagClass() {
  return 'rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
}

export function formatPositionAmount(value?: string | number | null) {
  const text = String(value ?? '').trim()
  return text || '0'
}

export function formatPositionAmountWithUnit(value?: string | number | null, unit?: string | null) {
  const amount = formatPositionAmount(value)
  const unitText = String(unit ?? '').trim()
  return unitText ? `${amount} ${unitText}` : amount
}

export function formatPositionSymbol(item: Pick<TaskPositionItem, 'raw_symbol' | 'instId'>) {
  const rawSymbol = String(item.raw_symbol ?? '').trim()
  if (rawSymbol) return rawSymbol

  return String(item.instId ?? '').trim() || '-'
}

export function formatSnapshotTime(ms?: number | null, locale = 'zh') {
  if (!ms) return null

  return new Date(ms).toLocaleString(locale.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}
