'use client'

import { BanIcon, EyeIcon, Flame, LockIcon, Unplug } from 'lucide-react'
import { useTranslations } from 'next-intl'

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

type TranslateFn = {
  (key: string, values?: Record<string, string | number | Date>): string
}

const getPlatformMap = (t: TranslateFn): Record<number, { name: string; logo: string | React.ReactNode }> => ({
  1: { name: 'OKX', logo: '/exchanges/okx.png' },
  2: { name: 'Binance', logo: '/exchanges/binance.png' },
  3: { name: t('platforms.3'), logo: '/exchanges/bicoin.png' },
  4: { name: t('platforms.4'), logo: <Flame className='text-orange-500 h-full w-full' /> },
  5: { name: 'Binance API', logo: <Unplug className='text-blue-500 h-full w-full p-0.5' /> },
  6: { name: 'OKX API', logo: <Unplug className='text-blue-500 h-full w-full p-0.5' /> },
  7: { name: 'Binance Cookie', logo: '/exchanges/binance.png' },
  8: { name: 'OKX Cookie', logo: '/exchanges/okx.png' },
  9: { name: t('platforms.9'), logo: '/exchanges/default.png' },
  10: { name: 'Hyperliquid', logo: '/exchanges/hlq_logo.png' }
})

const getRoleTypeLabel = (t: TranslateFn, platform: number, roleType?: number | string) => {
  if (!roleType) return null
  const rt = String(roleType)

  if (platform === 1) {
    if (rt === '1') return t('roleType.okxContract')
    if (rt === '2') return t('roleType.okxProfile')
  } else if (platform === 8) {
    if (rt === '1') return t('roleType.okxContract')
    if (rt === '2') return t('roleType.okxCookieProject')
  } else if (platform === 7) {
    if (rt === '1') return t('roleType.binancePublic')
    if (rt === '2') return t('roleType.okxCookieProject')
    if (rt === '3') return t('roleType.binanceSmart')
  } else if (platform === 2 || platform === 5) {
    if (rt === '1') return t('roleType.binancePublic')
    if (rt === '2') return t('roleType.binanceHidden')
    if (rt === '3') return t('roleType.binanceSmart')
  } else if (platform === 3) {
    if (rt === '1') return t('roleType.bicoinOps')
    if (rt === '2') return t('roleType.bicoinPosition')
  }

  return null
}

type StudioTaskGridViewProps = {
  groupedByTrader: GroupedByTraderItem[]
  isStudioVip: boolean
  creatingTraderKey: string | null
  onStartCreate: (traderKey: string) => void
  onCloseCreate: () => void
  onOpenTaskDetail: (task: StudioTaskItem) => void
  onTerminateTask: (id: number) => void
  onCreateSuccess: () => void
}

export function StudioTaskGridView({
  groupedByTrader,
  isStudioVip,
  creatingTraderKey,
  onStartCreate,
  onCloseCreate,
  onOpenTaskDetail,
  onTerminateTask,
  onCreateSuccess
}: StudioTaskGridViewProps) {
  const t = useTranslations('DashboardStudioTasks')
  const platformMap = getPlatformMap(t)

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
        const roleTypeLabel = getRoleTypeLabel(t, group.leadTask.trader_platform, group.leadTask.role_type)
        const traderId = group.leadTask.uniqueName || group.traderKey

        const platformInfo = platformMap[group.leadTask.trader_platform] || {
          name: t('platforms.unknown'),
          logo: '/exchanges/default.png'
        }

        return (
          <Card key={group.traderKey} className='relative overflow-hidden bg-gradient-to-b from-background to-muted/20 p-3.5 shadow-sm'>
            <div className='mb-3 flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <div className='flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full'>
                  {typeof platformInfo.logo === 'string' ? (
                    <img src={platformInfo.logo} alt={platformInfo.name} className='h-full w-full object-cover' />
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
                    <span>{t('table.traderId')}</span>
                    {renderUniqueName(traderId, 'cursor-default')}
                  </div>
                </div>
              </div>
              <Button size='sm' onClick={() => onStartCreate(group.traderKey)} className='h-8 gap-1 text-xs'>
                {t('table.follow')}
              </Button>
            </div>

          <div>
            <Table>
              <TableHeader>
                <TableRow className='border-0'>
                  <TableHead className='h-8 px-1 text-[11px] text-muted-foreground'>{t('table.taskId')}</TableHead>
                  <TableHead className='h-8 px-1 text-[11px] text-muted-foreground'>API</TableHead>
                  <TableHead className='h-8 px-1 text-[11px] text-muted-foreground'>{t('table.invest')}</TableHead>
                  <TableHead className='h-8 w-[88px] px-1 text-right text-[11px] text-muted-foreground'>{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.tasks.map(task => (
                  <TableRow key={task.id} className='border-0'>
                    <TableCell className='px-1 py-1.5 text-xs'>{task.id}</TableCell>
                    <TableCell className='px-1 py-1.5'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant='secondary' className='text-[10px]'>
                            {task.api_name ? (task.api_name.length > 6 ? task.api_name.slice(0, 6) + '...' : task.api_name) : '-'}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{task.api_name || '-'}</TooltipContent>
                      </Tooltip>
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
                          <TooltipContent>{t('table.view')}</TooltipContent>
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
                            <TooltipContent>{t('table.stop')}</TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('table.stopTitle')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('table.stopDesc')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('table.cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onTerminateTask(task.id)}
                                className='bg-red-500 text-white hover:bg-red-600'
                              >
                                {t('table.confirmStop')}
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
          {!isStudioVip && (
            <div className='absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/45 backdrop-blur-sm'>
              <div className='inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-3 py-1 text-xs font-medium text-foreground shadow-sm'>
                <LockIcon className='h-3.5 w-3.5' />
                {t('page.studioVipOnly')}
              </div>
            </div>
          )}
        </Card>
        )
      })}
    </div>
  )
}
