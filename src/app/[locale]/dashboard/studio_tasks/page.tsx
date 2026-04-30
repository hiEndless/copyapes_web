'use client'

import { useEffect, useMemo, useState } from 'react'

import { LayoutGrid, List, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { getTaskList, stopTask } from '@/api/task'
import { settingsApi } from '@/api/settings'
import { useRouter } from '@/i18n/routing'

import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StudioTaskGridView } from './_components/studio-task-grid-view'
import { StudioTaskTableView } from './_components/studio-task-table-view'
import type { GroupedByApiItem, GroupedByTraderItem, StudioTaskItem } from './_components/types'

type ViewMode = 'grid' | 'table'

export default function StudioTasksPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [tasks, setTasks] = useState<StudioTaskItem[]>([])
  const [creatingTraderKey, setCreatingTraderKey] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await getTaskList({ page: 1, page_size: 200 })

      if (res.code === 0 && Array.isArray(res.data)) {
        setTasks(res.data as StudioTaskItem[])
      } else {
        toast.error(res.error || '获取任务列表失败')
      }
    } catch (error) {
      console.error('获取任务列表失败:', error)
      toast.error('获取任务列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const activeTasks = useMemo(() => tasks.filter(task => task.status === 1), [tasks])

  const groupedByTrader: GroupedByTraderItem[] = useMemo(() => {
    const map = new Map<string, StudioTaskItem[]>()

    for (const task of activeTasks) {
      const uName = (task.uniqueName || '').trim() || 'unknown'
      const rType = task.role_type || ''
      const key = `${uName}${rType ? `-${rType}` : ''}`
      const arr = map.get(key) || []

      arr.push(task)
      map.set(key, arr)
    }

    return Array.from(map.entries()).map(([traderKey, groupedTasks]) => ({
      traderKey,
      tasks: groupedTasks,
      leadTask: groupedTasks[0]
    }))
  }, [activeTasks])

  const groupedByApi: GroupedByApiItem[] = useMemo(() => {
    const map = new Map<string, StudioTaskItem[]>()

    for (const task of activeTasks) {
      const key = (task.api_name || '').trim() || '未命名 API'
      const arr = map.get(key) || []

      arr.push(task)
      map.set(key, arr)
    }

    return Array.from(map.entries()).map(([apiName, groupedTasks]) => ({
      apiName,
      tasks: groupedTasks
    }))
  }, [activeTasks])

  const handleTerminateTask = async (id: number) => {
    try {
      const res = await stopTask(id)

      if (res.code !== 0) {
        toast.error(res.error || '终止跟单失败')

        return
      }

      toast.success('终止跟单成功')
      fetchTasks()

      try {
        const profile = await settingsApi.getEntitlementProfile()

        if (profile) {
          localStorage.setItem('entitlementProfile', JSON.stringify(profile))
          window.dispatchEvent(new Event('entitlementProfileUpdated'))
        }
      } catch (err) {
        console.error('Failed to fetch entitlement profile after terminating task:', err)
      }
    } catch (error) {
      console.error('终止请求失败:', error)
      toast.error('终止请求失败，请重试')
    }
  }

  const openTaskDetail = (task: StudioTaskItem) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('current_task', JSON.stringify(task))
    }

    router.push(`/dashboard/task_list/task_detail/${task.id}` as any)
  }

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold tracking-tight'>跟单任务管理</h2>
          <p className='text-muted-foreground text-sm'>按交易员或按 API 聚合查看和管理跟单任务</p>
        </div>
        <Tabs value={viewMode} onValueChange={v => setViewMode(v as ViewMode)}>
          <TabsList className='grid w-[120px] grid-cols-2'>
            <TabsTrigger value='grid' title='卡片视图'>
              <LayoutGrid className='h-4 w-4' />
            </TabsTrigger>
            <TabsTrigger value='table' title='列表视图'>
              <List className='h-4 w-4' />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className='flex h-[40vh] items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : activeTasks.length === 0 ? (
        <Card className='flex min-h-[320px] items-center justify-center border-dashed text-muted-foreground'>
          暂无进行中的跟单任务
        </Card>
      ) : viewMode === 'grid' ? (
        <StudioTaskGridView
          groupedByTrader={groupedByTrader}
          creatingTraderKey={creatingTraderKey}
          onStartCreate={setCreatingTraderKey}
          onCloseCreate={() => setCreatingTraderKey(null)}
          onOpenTaskDetail={openTaskDetail}
          onTerminateTask={handleTerminateTask}
          onCreateSuccess={fetchTasks}
        />
      ) : (
        <StudioTaskTableView
          groupedByApi={groupedByApi}
          onOpenTaskDetail={openTaskDetail}
          onTerminateTask={handleTerminateTask}
        />
      )}
    </div>
  )
}
