export type TaskCreatedTimeLike = {
  create_ts_ms?: number | string | null
  create_datetime?: string | null
  created_at?: string | null
}

function parseTimestampMs(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null

  const numeric = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numeric) || numeric <= 0) return null

  return numeric
}

function parseLegacyDateTime(value: unknown): number | null {
  if (typeof value !== 'string' || !value.trim()) return null

  const trimmed = value.trim()

  // Date-only strings are UTC midnight in JS; use local midnight to avoid +8 → 08:00.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number)
    const localMidnight = new Date(year, month - 1, day).getTime()

    if (!Number.isFinite(localMidnight)) return null

    return localMidnight
  }

  const timestamp = new Date(trimmed).getTime()

  if (!Number.isFinite(timestamp)) return null

  return timestamp
}

export function resolveTaskCreatedTimeMs(task: TaskCreatedTimeLike): number | null {
  return (
    parseTimestampMs(task.create_ts_ms) ??
    parseLegacyDateTime(task.create_datetime) ??
    parseLegacyDateTime(task.created_at)
  )
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatTaskCreatedTime(task: TaskCreatedTimeLike, mode: 'datetime' | 'date' = 'datetime'): string {
  const timestamp = resolveTaskCreatedTimeMs(task)

  if (!timestamp) return '-'

  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())

  if (mode === 'date') {
    return `${year}-${month}-${day}`
  }

  return `${String(year).slice(2)}/${month}/${day}  ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
