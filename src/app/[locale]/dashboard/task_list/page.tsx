'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Plus, UserCheck, Coins, Cookie, Unplug, Flame, Droplets } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useDashboardRouter as useRouter } from '@/hooks/use-dashboard-router'
import TaskDatatable, { type TaskItem } from './_components/task-datatable'
import { getTaskList } from '@/api/task'

const TASK_TYPE_DEFS = [
  {
    id: 'exchange',
    icon: UserCheck,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    hoverBorder: 'hover:border-blue-500/50',
    path: '/dashboard/add_task/exchange_task'
  },
  {
    id: 'bicoin',
    icon: Coins,
    logo: '/exchanges/bicoin.png',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500',
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    hoverBorder: 'hover:border-orange-500/50',
    path: '/dashboard/add_task/bicoin_task'
  },
  {
    id: 'cookie',
    icon: Cookie,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500',
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    hoverBorder: 'hover:border-purple-500/50',
    path: '/dashboard/add_task/cookie_task'
  },
  {
    id: 'api',
    icon: Unplug,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500',
    iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    hoverBorder: 'hover:border-cyan-500/50',
    path: '/dashboard/add_task/api_task'
  },
  {
    id: 'hot',
    icon: Flame,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500',
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    hoverBorder: 'hover:border-rose-500/50',
    path: '/dashboard/add_task/hot'
  },
  {
    id: 'hyper',
    icon: Droplets,
    logo: '/exchanges/hlq_logo.png',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/50',
    path: '/dashboard/add_task/hyper_task'
  }
] as const

export default function TaskListPage() {
  const t = useTranslations('DashboardTaskList')
  const router = useRouter()
  const [data, setData] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'online' | 'stop'>('online')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)

  const taskTypes = useMemo(
    () =>
      TASK_TYPE_DEFS.map(task => ({
        ...task,
        title: t(`types.${task.id}.title`),
        desc: t(`types.${task.id}.desc`)
      })),
    [t]
  )

  const getStatusParam = (tab: 'all' | 'online' | 'stop') => {
    if (tab === 'online') return 1
    if (tab === 'stop') return 2

    return undefined
  }

  const fetchData = useCallback(
    async (nextPage: number, tab: 'all' | 'online' | 'stop') => {
      try {
        setLoading(true)

        const status = getStatusParam(tab)

        const res = await getTaskList({
          page: nextPage,
          page_size: pageSize,
          ...(status !== undefined ? { status } : {})
        })

        if (res.code === 0 && Array.isArray(res.data)) {
          setData(res.data)
          const pagination = (res as any).pagination || {}
          const resolvedTotal = Number(pagination.total ?? res.data.length ?? 0)

          setTotal(resolvedTotal)

          if (typeof pagination.has_next === 'boolean') {
            setHasNextPage(pagination.has_next)
          } else {
            setHasNextPage(res.data.length >= pageSize)
          }
        } else {
          toast.error(res.error || t('page.fetchFailed'))
        }
      } catch (error) {
        console.error('Failed to fetch task list:', error)
        toast.error(t('page.fetchFailed'))
      } finally {
        setLoading(false)
      }
    },
    [pageSize, t]
  )

  useEffect(() => {
    fetchData(page, filter)
  }, [page, pageSize, filter, fetchData])

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold tracking-tight'>{t('page.title')}</h2>
          <p className='text-muted-foreground text-sm'>{t('page.subtitle')}</p>
        </div>
        <div className='flex items-center gap-4'>
          <Tabs
            value={filter}
            onValueChange={(v: any) => {
              setFilter(v)
              setPage(1)
            }}
            className='w-full sm:w-auto'
          >
            <TabsList className='grid w-full grid-cols-3 sm:w-auto'>
              <TabsTrigger value='all'>{t('tabs.all')}</TabsTrigger>
              <TabsTrigger value='online'>{t('tabs.online')}</TabsTrigger>
              <TabsTrigger value='stop'>{t('tabs.stop')}</TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog>
            <DialogTrigger asChild>
              <Button className='shrink-0' size='sm'>
                <Plus className='mr-2 h-4 w-4' />
                {t('page.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-2xl'>
              <DialogHeader>
                <DialogTitle className='text-xl'>{t('page.selectType')}</DialogTitle>
              </DialogHeader>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 py-2'>
                {taskTypes.map(task => (
                  <Card
                    key={task.id}
                    className={cn(
                      'group relative cursor-pointer overflow-hidden p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                      task.hoverBorder
                    )}
                    onClick={() => router.push(task.path as any)}
                  >
                    <div
                      className={cn(
                        'absolute -right-3 -top-3 flex h-20 w-20 items-center justify-center rounded-full opacity-10 transition-transform duration-300 group-hover:scale-125',
                        task.color
                      )}
                    >
                      {'logo' in task && task.logo ? (
                        <img src={task.logo} alt={task.title} className='h-14 w-14 object-contain opacity-50 grayscale' />
                      ) : (
                        <task.icon className='h-10 w-10' />
                      )}
                    </div>

                    <div className='relative flex items-start gap-3'>
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                          task.iconBg,
                          task.color
                        )}
                      >
                        {'logo' in task && task.logo ? (
                          <img src={task.logo} alt={task.title} className='h-5 w-5 object-contain rounded-full' />
                        ) : (
                          <task.icon className='h-5 w-5' />
                        )}
                      </div>
                      <div className='space-y-1 pt-0.5'>
                        <h3 className='text-sm font-medium leading-none tracking-tight'>{task.title}</h3>
                        <p className='text-xs text-muted-foreground leading-snug'>{task.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className='col-span-full py-0 shadow-none'>
        <TaskDatatable
          data={data}
          loading={loading}
          currentPage={page}
          pageSize={pageSize}
          total={total}
          hasNextPage={hasNextPage}
          onPrevPage={() => setPage(prev => Math.max(1, prev - 1))}
          onNextPage={() => setPage(prev => prev + 1)}
          onJumpPage={next => setPage(Math.max(1, next))}
          onRefresh={() => fetchData(page, filter)}
        />
      </Card>
    </div>
  )
}
