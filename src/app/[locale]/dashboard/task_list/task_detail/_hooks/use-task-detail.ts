'use client'

import * as React from 'react'

import { toast } from 'sonner'

import { useDashboardRouter as useRouter } from '@/hooks/use-dashboard-router'
import { getTaskDetail, getTraderDetail, stopTask } from '@/api/task'
import { settingsApi } from '@/api/settings'

import type { TaskLogItem } from '../_lib/types'

export function useTaskDetail(taskId: string) {
  const router = useRouter()
  const routerRef = React.useRef(router)
  routerRef.current = router

  const [task, setTask] = React.useState<Record<string, unknown> | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('current_task')

      if (cached) {
        try {
          const parsed = JSON.parse(cached)

          if (String(parsed.id) === String(taskId)) {
            return parsed
          }
        } catch (e) {
          console.error('解析缓存任务失败', e)
        }
      }
    }

    return null
  })

  const [spiderData, setSpiderData] = React.useState<TaskLogItem[]>([])
  const [tradeData, setTradeData] = React.useState<TaskLogItem[]>([])
  const [loading, setLoading] = React.useState(!task)
  const taskRef = React.useRef(task)
  taskRef.current = task

  const loadTaskData = React.useCallback(async () => {
    try {
      if (!taskRef.current) {
        setLoading(true)
      }

      const [taskRes, traderRes] = await Promise.all([getTaskDetail(taskId), getTraderDetail(taskId)])

      if (taskRes.code === 0) {
        setTask(taskRes.data as Record<string, unknown>)

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('current_task', JSON.stringify(taskRes.data))
        }
      } else {
        toast.error(String(taskRes.detail || taskRes.message || '获取任务失败'))
        routerRef.current.push('/dashboard/task_list' as never)
      }

      if (traderRes.code === 0 && traderRes.data) {
        setTradeData((traderRes.data.trade || []) as TaskLogItem[])
        setSpiderData((traderRes.data.spider || []) as TaskLogItem[])
      }
    } catch (err) {
      console.error(err)
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }, [taskId])

  React.useEffect(() => {
    if (taskId) {
      loadTaskData()
    }
    // 仅 taskId 变化时拉取，避免 router 对象引用变化导致重复请求
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const handleTerminateTask = React.useCallback(async () => {
    try {
      const res = await stopTask(taskId)

      if (res.code === 0) {
        toast.success('已发起终止跟单请求')
        loadTaskData()

        try {
          const profile = await settingsApi.getEntitlementProfile()

          if (profile) {
            localStorage.setItem('entitlementProfile', JSON.stringify(profile))
            window.dispatchEvent(new Event('entitlementProfileUpdated'))
          }
        } catch (err) {
          console.error('Failed to fetch entitlement profile after terminating task:', err)
        }
      } else {
        toast.error(String(res.detail || res.message || '终止请求失败'))
      }
    } catch (error) {
      console.error('终止请求失败:', error)
      toast.error('终止请求失败，请重试')
    }
  }, [taskId, loadTaskData])

  return {
    task,
    spiderData,
    tradeData,
    loading,
    loadTaskData,
    handleTerminateTask
  }
}
