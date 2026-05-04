'use client'

import { BanIcon, EyeIcon, LockIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import type { GroupedByApiItem, StudioTaskItem } from './types'
import { ellipsisMiddle, resolveInvestment } from './utils'

type StudioTaskTableViewProps = {
  groupedByApi: GroupedByApiItem[]
  isStudioVip: boolean
  onOpenTaskDetail: (task: StudioTaskItem) => void
  onTerminateTask: (id: number) => void
}

export function StudioTaskTableView({
  groupedByApi,
  isStudioVip,
  onOpenTaskDetail,
  onTerminateTask
}: StudioTaskTableViewProps) {
  const renderUniqueName = (value: string, className = '') => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{ellipsisMiddle(value)}</span>
      </TooltipTrigger>
      <TooltipContent>{value || '-'}</TooltipContent>
    </Tooltip>
  )

  return (
    <Card className='relative overflow-hidden py-0'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[20%] first:pl-8'>任务ID</TableHead>
            <TableHead className='w-[25%]'>交易员</TableHead>
            <TableHead>投资额</TableHead>
            <TableHead className='w-[20%]'>创建时间</TableHead>
            <TableHead className='w-[15%] last:pr-2'>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedByApi.flatMap(group => [
            <TableRow key={`group-${group.apiName}`} className='bg-muted/40 hover:bg-muted/40'>
              <TableCell colSpan={5} className='py-2 first:pl-4 last:pr-4'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                  <span className='inline-block h-2 w-2 rounded-full bg-primary/70' />
                  <Badge
                    className='bg-green-600/10 text-green-600 hover:bg-green-600/10 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/10 rounded-sm border-none focus-visible:outline-none'
                  >
                    {group.apiName}
                  </Badge>
                  <span className='text-muted-foreground text-xs'>共 {group.tasks.length} 个进行中任务</span>
                </div>
              </TableCell>
            </TableRow>,
            ...group.tasks.map(task => (
              <TableRow key={`${group.apiName}-${task.id}`}>
                <TableCell className='first:pl-8'>{task.id}</TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <span>{(task.label || '').trim() || renderUniqueName(task.uniqueName, 'cursor-default')}</span>
                    <span className='text-muted-foreground max-w-[220px] text-[11px]'>
                      {renderUniqueName(task.uniqueName, 'cursor-default')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{resolveInvestment(task)}</TableCell>
                <TableCell className='text-muted-foreground'>
                  {task.create_datetime ? task.create_datetime.replace('T', '  ').substring(2, 20).replace(/-/g, '/') : '-'}
                </TableCell>
                <TableCell className='last:pr-2'>
                  <div className='flex items-center gap-1'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant='ghost' size='icon' onClick={() => onOpenTaskDetail(task)}>
                          <EyeIcon className='h-4.5 w-4.5 text-blue-600' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>查看详情</TooltipContent>
                    </Tooltip>
                    <AlertDialog>
                      <Tooltip>
                        <AlertDialogTrigger asChild>
                          <TooltipTrigger asChild>
                            <Button variant='ghost' size='icon'>
                              <BanIcon className='h-4.5 w-4.5 text-destructive' />
                            </Button>
                          </TooltipTrigger>
                        </AlertDialogTrigger>
                        <TooltipContent>终止跟单</TooltipContent>
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认终止跟单？</AlertDialogTitle>
                          <AlertDialogDescription>
                            终止任务不会进行平仓，当前如有持仓，后续请自行平仓。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onTerminateTask(task.id)}
                            className='bg-red-500 text-white hover:bg-red-600'
                          >
                            确认终止
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ])}
        </TableBody>
      </Table>
      {!isStudioVip && (
        <div className='absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/45 backdrop-blur-sm'>
          <div className='inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-3 py-1 text-xs font-medium text-foreground shadow-sm'>
            <LockIcon className='h-3.5 w-3.5' />
            工作室 VIP 专享
          </div>
        </div>
      )}
    </Card>
  )
}
