import type { StudioTaskItem } from './types'

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
