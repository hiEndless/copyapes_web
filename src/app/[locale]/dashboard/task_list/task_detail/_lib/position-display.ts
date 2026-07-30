import { getSideTagClass } from './task-log-formatters'
import type { TaskPositionItem } from './types'

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string

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

export function formatPosSideLabel(posSide?: string, side?: string, t?: TranslateFn) {
  const tag = normalizePosSideTag(posSide, side)

  if (tag === 'LONG') return t ? t('positions.side.long') : 'LONG'
  if (tag === 'SHORT') return t ? t('positions.side.short') : 'SHORT'

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

export function formatMgnModeLabel(mgnMode?: string, t?: TranslateFn) {
  const tag = normalizeMgnModeTag(mgnMode)
  if (!tag) return ''

  if (tag === 'cross') return t ? t('positions.mgn.cross') : 'cross'
  if (tag === 'isolated') return t ? t('positions.mgn.isolated') : 'isolated'

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
