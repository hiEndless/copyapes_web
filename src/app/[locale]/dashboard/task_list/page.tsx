'use client'

import { Card } from '@/components/ui/card'
import TaskDatatable, { type TaskItem } from './_components/task-datatable'

const mockData: TaskItem[] = [
  {
    id: 766,
    uniqueName: 'Cryptoxn(隐毒素)',
    trader_platform: 4,
    api_name: 'ok模拟2',
    create_datetime: '2025-01-16T20:33:14',
    status: 1
  }
]

export default function TaskListPage() {
  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>任务列表</h2>
        <p className='text-muted-foreground text-sm'>查看和管理您的跟单任务</p>
      </div>

      <Card className='col-span-full py-0 shadow-none'>
        <TaskDatatable data={mockData} />
      </Card>
    </div>
  )
}
