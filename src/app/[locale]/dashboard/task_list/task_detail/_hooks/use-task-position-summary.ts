'use client'

import * as React from 'react'

import { getTaskPositionSummary } from '@/api/task'

import type { TaskPositionSummary } from '../_lib/types'
import {
  clearCachedTaskPositionSummary,
  getCachedTaskPositionSummary,
  setCachedTaskPositionSummary
} from '../_lib/task-position-cache'

type UseTaskPositionSummaryOptions = {
  taskId: string
}

export function useTaskPositionSummary({ taskId }: UseTaskPositionSummaryOptions) {
  const [summary, setSummary] = React.useState<TaskPositionSummary | null>(() =>
    taskId ? getCachedTaskPositionSummary(taskId) : null
  )
  const [loading, setLoading] = React.useState(() => (taskId ? !getCachedTaskPositionSummary(taskId) : false))
  const [refreshing, setRefreshing] = React.useState(false)
  const hasSummaryRef = React.useRef(summary !== null)

  React.useEffect(() => {
    hasSummaryRef.current = summary !== null
  }, [summary])

  const fetchSummary = React.useCallback(async (options?: { force?: boolean }) => {
    if (!taskId) return

    const force = Boolean(options?.force)

    if (!force) {
      const cached = getCachedTaskPositionSummary(taskId)
      if (cached) {
        setSummary(cached)
        setLoading(false)
        return
      }
    } else {
      clearCachedTaskPositionSummary(taskId)
    }

    if (hasSummaryRef.current) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const res = await getTaskPositionSummary(taskId)

      if (res.code === 0 && res.data) {
        setSummary(res.data)
        setCachedTaskPositionSummary(taskId, res.data)
      }
    } catch (error) {
      console.error('获取仓位对比失败:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [taskId])

  React.useEffect(() => {
    if (!taskId) return

    const cached = getCachedTaskPositionSummary(taskId)
    if (cached) {
      setSummary(cached)
      setLoading(false)
      return
    }

    fetchSummary()
  }, [taskId, fetchSummary])

  const refresh = React.useCallback(() => {
    fetchSummary({ force: true })
  }, [fetchSummary])

  return {
    summary,
    loading,
    refreshing,
    refresh
  }
}
