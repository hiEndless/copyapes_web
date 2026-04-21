'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import TaskDatatable, { type TaskItem } from './_components/task-datatable'
import { getTaskList } from '@/api/task'
import { toast } from 'sonner'

export default function TaskListPage() {
  const router = useRouter()
  const [data, setData] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'online' | 'stop'>('online')

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getTaskList()
      if (res.code === 0 && Array.isArray(res.data)) {
        setData(res.data)
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
    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    if (filter === 'all') return data
    const statusToFilter = filter === 'online' ? 1 : 2
    return data.filter(item => item.status === statusToFilter)
  }, [data, filter])

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold tracking-tight'>跟单列表</h2>
          <p className='text-muted-foreground text-sm'>查看和管理您的跟单任务</p>
        </div>
        <div className='flex items-center gap-4'>
          <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className='w-full sm:w-auto'>
            <TabsList className='grid w-full grid-cols-3 sm:w-auto'>
              <TabsTrigger value='all'>全部</TabsTrigger>
              <TabsTrigger value='online'>进行中</TabsTrigger>
              <TabsTrigger value='stop'>已结束</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => router.push('/dashboard/add_task' as any)} className='shrink-0' size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            创建新跟单
          </Button>
        </div>
      </div>

      <Card className='col-span-full py-0 shadow-none'>
        <TaskDatatable data={filteredData} onRefresh={fetchData} />
      </Card>
    </div>
  )
}
