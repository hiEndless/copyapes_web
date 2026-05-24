'use client'

import * as React from 'react'

import { ArrowLeft } from 'lucide-react'

import { useDashboardRouter as useRouter } from '@/hooks/use-dashboard-router'

import { Button } from '@/components/ui/button'

import { TaskParametersCard } from '../_components/task-parameters-card'
import { TaskLogSections } from '../_components/task-log-sections'
import { buildTaskParameterList } from '../_lib/task-parameters'
import { useTaskDetail } from '../_hooks/use-task-detail'

export default function TaskDetailPage({ params }: { params: { id?: string; locale?: string } | Promise<{ id?: string; locale?: string }> }) {
  const router = useRouter()

  const unwrappedParams = React.use(params instanceof Promise ? params : Promise.resolve(params))
  const taskId = String(unwrappedParams?.id || (params as { id?: string })?.id || '')
  const locale = String(unwrappedParams?.locale || (params as { locale?: string })?.locale || 'zh')

  const { task, spiderData, tradeData, handleTerminateTask } = useTaskDetail(taskId)

  const parameterList = React.useMemo(() => (task ? buildTaskParameterList(task) : []), [task])
  const isRunning = task?.status === 1
  const isReverseFollow = String(task?.posSide_set) === '2'

  return (
    <div className='bg-muted/20 dark:bg-background flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='icon' onClick={() => router.back()} className='h-8 w-8 rounded-full'>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h2 className='text-lg font-semibold tracking-tight'>任务详情</h2>
      </div>

      <TaskParametersCard
        parameterList={parameterList}
        isRunning={Boolean(isRunning)}
        onTerminate={handleTerminateTask}
      />

      <TaskLogSections
        spiderData={spiderData}
        tradeData={tradeData}
        locale={locale}
        isReverseFollow={isReverseFollow}
      />
    </div>
  )
}
