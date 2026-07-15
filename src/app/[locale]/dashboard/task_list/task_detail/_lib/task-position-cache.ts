import type { TaskPositionSummary } from './types'

const CACHE_TTL_MS = 60_000

type CacheEntry = {
  data: TaskPositionSummary
  cachedAt: number
}

function getCacheKey(taskId: string) {
  return `task_positions_summary:${taskId}`
}

export function getCachedTaskPositionSummary(taskId: string): TaskPositionSummary | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(getCacheKey(taskId))
    if (!raw) return null

    const entry = JSON.parse(raw) as CacheEntry
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null

    return entry.data
  } catch {
    return null
  }
}

export function setCachedTaskPositionSummary(taskId: string, data: TaskPositionSummary) {
  if (typeof window === 'undefined') return

  const entry: CacheEntry = { data, cachedAt: Date.now() }
  sessionStorage.setItem(getCacheKey(taskId), JSON.stringify(entry))
}

export function clearCachedTaskPositionSummary(taskId: string) {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(getCacheKey(taskId))
}
