'use client'

import { BanIcon, EyeIcon, Flame, Unplug } from 'lucide-react'

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
import { CopyTaskConfigSheet } from '../../add_task/_components/copy-task-config-sheet'
import type { GroupedByTraderItem, StudioTaskItem } from './types'
import { ellipsisMiddle, resolveInvestment } from './utils'

const PLATFORM_MAP: Record<number, { name: string; logo: string | React.ReactNode }> = {
  1: { name: 'OKX', logo: '/exchanges/okx.png' },
  2: { name: 'Binance', logo: '/exchanges/binance.png' },
  3: { name: '币coin', logo: '/exchanges/bicoin.png' },
  4: { name: '热门', logo: <Flame className='text-orange-500 h-full w-full' /> },
  5: { name: 'Binance API', logo: <Unplug className='text-blue-500 h-full w-full p-0.5' /> },
  6: { name: 'OKX API', logo: <Unplug className='text-blue-500 h-full w-full p-0.5' /> },
  7: { name: 'Binance Cookie', logo: '/exchanges/binance.png' },
  8: { name: 'OKX Cookie', logo: '/exchanges/okx.png' },
  9: { name: 'NOF1 / AI模型', logo: '/exchanges/default.png' },
  10: { name: 'Hyperliquid', logo: '/exchanges/hlq_logo.png' }
}

const getRoleTypeLabel = (platform: number, roleType?: number | string) => {
  if (!roleType) return null
  const rt = String(roleType)

  if (platform === 1 || platform === 8) {
    // OKX 系列
    if (rt === '1') return '合约带单'
    if (rt === '2') return '个人概况'
  } else if (platform === 2 || platform === 5 || platform === 7) {
    // Binance 系列
    if (rt === '1') return '公开带单'
    if (rt === '2') return '隐藏带单'
    if (rt === '3') return '聪明钱'
  } else if (platform === 3) {
    // 币coin
    if (rt === '1') return '操作记录'
    if (rt === '2') return '合约仓位'
  }

  return null
}

type StudioTaskGridViewProps = {
  groupedByTrader: GroupedByTraderItem[]
  creatingTraderKey: string | null
  onStartCreate: (traderKey: string) => void
  onCloseCreate: () => void
  onOpenTaskDetail: (task: StudioTaskItem) => void
  onTerminateTask: (id: number) => void
  onCreateSuccess: () => void
}

export function StudioTaskGridView({
  groupedByTrader,
  creatingTraderKey,
  onStartCreate,
  onCloseCreate,
  onOpenTaskDetail,
  onTerminateTask,
  onCreateSuccess
}: StudioTaskGridViewProps) {
  const renderUniqueName = (value: string, className = '') => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{ellipsisMiddle(value)}</span>
      </TooltipTrigger>
      <TooltipContent>{value || '-'}</TooltipContent>
    </Tooltip>
  )

  return (
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-3'>
      {groupedByTrader.map(group => {
        const roleTypeLabel = getRoleTypeLabel(group.leadTask.trader_platform, group.leadTask.role_type)
        const traderId = group.leadTask.uniqueName || group.traderKey
        const platformInfo = PLATFORM_MAP[group.leadTask.trader_platform] || {
          name: '未知',
          logo: '/exchanges/default.png'
        }

        return (
          <Card key={group.traderKey} className='bg-gradient-to-b from-background to-muted/20 p-3.5 shadow-sm'>
            <div className='mb-3 flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex h-7 w-7 shrink-0 items-center justify-center'>
                  {typeof platformInfo.logo === 'string' ? (
                    <img src={platformInfo.logo} alt={platformInfo.name} className='h-full w-full object-contain' />
                  ) : (
                    platformInfo.logo
                  )}
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <div className='text-sm font-semibold'>
                      {(group.leadTask.label || '').trim() || renderUniqueName(traderId, 'cursor-default')}
                    </div>
                    {roleTypeLabel && (
                      <span className='bg-primary/10 text-primary shrink-0 rounded-[2px] px-1 py-0.5 text-[10px] scale-90 origin-left'>
                        {roleTypeLabel}
                      </span>
                    )}
                  </div>
                  <div className='text-muted-foreground mt-1 flex max-w-[190px] items-center gap-1 text-[11px]'>
                    <span>交易员 ID:</span>
                    {renderUniqueName(traderId, 'cursor-default')}
                  </div>
                </div>
              </div>
              <Button size='sm' onClick={() => onStartCreate(group.traderKey)} className='h-8 gap-1 text-xs'>
                跟单
              </Button>
            </div>

          <div>
            <Table>
              <TableHeader>
                <TableRow className='border-0'>
                  <TableHead className='h-8 px-1 text-[11px] text-muted-foreground'>任务ID</TableHead>
                  <TableHead className='h-8 px-1 text-[11px] text-muted-foreground'>API</TableHead>
                  <TableHead className='h-8 px-1 text-[11px] text-muted-foreground'>投资额</TableHead>
                  <TableHead className='h-8 w-[88px] px-1 text-right text-[11px] text-muted-foreground'>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.tasks.map(task => (
                  <TableRow key={task.id} className='border-0'>
                    <TableCell className='px-1 py-1.5 text-xs'>{task.id}</TableCell>
                    <TableCell className='px-1 py-1.5'>
                      <Badge variant='secondary' className='text-[10px]'>
                        {task.api_name || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className='px-1 py-1.5 text-xs'>{resolveInvestment(task)}</TableCell>
                    <TableCell className='px-1 py-1.5'>
                      <div className='flex items-center justify-end gap-1'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => onOpenTaskDetail(task)}>
                              <EyeIcon className='h-4.5 w-4.5 text-blue-600' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>查看详情</TooltipContent>
                        </Tooltip>
                        <AlertDialog>
                          <Tooltip>
                            <AlertDialogTrigger asChild>
                              <TooltipTrigger asChild>
                                <Button variant='ghost' size='icon' className='h-7 w-7'>
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
                ))}
              </TableBody>
            </Table>
          </div>

          {creatingTraderKey === group.traderKey && (
            <CopyTaskConfigSheet
              isOpen
              onClose={onCloseCreate}
              traderId={traderId}
              traderName={(group.leadTask.label || '').trim() || traderId}
              platform='okx'
              traderPlatform={group.leadTask.trader_platform}
              roleType={String(group.leadTask.role_type || 1)}
              onSuccess={onCreateSuccess}
            />
          )}
        </Card>
        )
      })}
    </div>
  )
}
