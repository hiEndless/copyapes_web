import { getSideTagClass } from './task-log-formatters'

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

export function formatPositionAmount(value?: string | number | null) {
  const text = String(value ?? '').trim()
  return text || '0'
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
