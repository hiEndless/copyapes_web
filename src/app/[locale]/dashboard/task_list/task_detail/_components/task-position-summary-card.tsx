'use client'

import * as React from 'react'

import { ChevronDown, Info, Layers3, RefreshCw, SlidersHorizontal } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import type { TaskPositionItem } from '../_lib/types'
import {
  formatPosSideLabel,
  formatPositionAmount,
  formatSnapshotTime,
  getPositionSideTagClass
} from '../_lib/position-display'
import { buildFollowRatioFromTask } from '@/lib/follow-ratio'
import { useTaskPositionSummary } from '../_hooks/use-task-position-summary'

type TaskPositionSummaryCardProps = {
  taskId: string
  locale: string
  task?: Record<string, unknown> | null
  showSimulatedWarning?: boolean
}

type PositionTableProps = {
  positions: TaskPositionItem[]
  locale: string
  showLeaderColumn?: boolean
  emptyText?: string
}

const tableShellClass = 'overflow-hidden rounded-xl border border-border/60 bg-background/80'

function PositionSkeleton({ showLeaderColumn = true }: { showLeaderColumn?: boolean }) {
  return (
    <div className={cn(tableShellClass, 'space-y-2 p-3')}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='bg-muted/40 flex items-center gap-3 rounded-lg px-3 py-3'>
          <div className='bg-muted h-4 w-36 animate-pulse rounded' />
          <div className='bg-muted h-5 w-8 animate-pulse rounded' />
          <div className='ml-auto flex items-center gap-6'>
            {showLeaderColumn ? <div className='bg-muted h-4 w-16 animate-pulse rounded' /> : null}
            <div className='bg-muted h-4 w-16 animate-pulse rounded' />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className={cn(tableShellClass, 'flex flex-col items-center justify-center gap-2 py-12')}>
      <div className='bg-muted/60 flex h-10 w-10 items-center justify-center rounded-full'>
        <Layers3 className='text-muted-foreground h-4 w-4' />
      </div>
      <p className='text-muted-foreground text-sm'>{text}</p>
    </div>
  )
}

function PositionTable({
  positions,
  locale,
  showLeaderColumn = true,
  emptyText = '暂无持仓'
}: PositionTableProps) {
  if (positions.length === 0) {
    return <EmptyState text={emptyText} />
  }

  return (
    <div className={tableShellClass}>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/30 hover:bg-muted/30'>
            <TableHead className='h-9 px-4 text-xs font-medium text-muted-foreground'>合约</TableHead>
            {showLeaderColumn ? (
              <TableHead className='h-9 px-4 text-right'>
                <span className='inline-flex items-center justify-end gap-1.5 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400'>
                  <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
                  交易员
                </span>
              </TableHead>
            ) : null}
            <TableHead className='h-9 px-4 text-right'>
              <span className='inline-flex items-center justify-end gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                跟单
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((item, index) => {
            const sideLabel = formatPosSideLabel(item.posSide, item.side, locale)
            const sideTagClass = getPositionSideTagClass(item.posSide, item.side)

            return (
              <TableRow
                key={`${item.instId}-${item.posSide}-${item.side}-${index}`}
                className='border-border/50 hover:bg-muted/20'
              >
                <TableCell className='px-4 py-3'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold tracking-tight'>{item.instId}</span>
                    {sideLabel !== '-' ? (
                      <span className={cn(sideTagClass, 'px-1.5 py-0 text-[10px] leading-5')}>{sideLabel}</span>
                    ) : null}
                  </div>
                </TableCell>
                {showLeaderColumn ? (
                  <TableCell className='bg-blue-500/[0.03] px-4 py-3 text-right dark:bg-blue-500/[0.06]'>
                    <span className='font-mono text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400'>
                      {formatPositionAmount(item.leader_pos)}
                    </span>
                  </TableCell>
                ) : null}
                <TableCell className='bg-emerald-500/[0.03] px-4 py-3 text-right dark:bg-emerald-500/[0.06]'>
                  <span className='font-mono text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400'>
                    {formatPositionAmount(item.follow_pos)}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function TaskPositionSummaryCard({
  taskId,
  locale,
  task,
  showSimulatedWarning = false
}: TaskPositionSummaryCardProps) {
  const { summary, loading, refreshing, refresh } = useTaskPositionSummary({ taskId })
  const [followOnlyOpen, setFollowOnlyOpen] = React.useState(false)
  const followRatioPreview = React.useMemo(() => buildFollowRatioFromTask(task), [task])

  const positions = summary?.positions ?? []
  const followOnlyPositions = summary?.follow_only_positions ?? []
  const snapshotTime = formatSnapshotTime(summary?.leader_snapshot_saved_at_ms, locale)

  return (
    <section className='space-y-2'>
      <div className='flex items-center justify-between gap-3 px-1'>
        <div className='text-muted-foreground flex min-w-0 flex-wrap items-center gap-2 text-xs'>
          <span className='truncate'>快照 {snapshotTime || '-'}</span>
          {!loading && positions.length > 0 ? (
            <span className='text-foreground/70'>· {positions.length} 个仓位</span>
          ) : null}
          {followRatioPreview?.ready ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'text-foreground/70 cursor-default',
                    followRatioPreview.lowRatioWarning && 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  · 开仓比例 {followRatioPreview.ratioPercent.toFixed(2)}%
                </span>
              </TooltipTrigger>
              <TooltipContent className='max-w-xs'>{followRatioPreview.formula}</TooltipContent>
            </Tooltip>
          ) : null}
          {summary?.leader_snapshot_found === false ? (
            <Badge
              variant='outline'
              className='h-5 border-amber-300/80 px-1.5 text-[10px] text-amber-700 dark:border-amber-700 dark:text-amber-300'
            >
              快照缺失
            </Badge>
          ) : null}
          {summary?.follow_ledger_found === false ? (
            <Badge
              variant='outline'
              className='h-5 border-amber-300/80 px-1.5 text-[10px] text-amber-700 dark:border-amber-700 dark:text-amber-300'
            >
              账本缺失
            </Badge>
          ) : null}
        </div>

        <TooltipProvider>
          <div className='flex shrink-0 items-center gap-0.5'>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant='ghost'
                    size='icon'
                    disabled
                    className='text-muted-foreground h-7 w-7'
                    aria-label='手动校准'
                  >
                    <SlidersHorizontal className='h-3.5 w-3.5' />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>手动校准 · 即将上线</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7'
                  onClick={refresh}
                  disabled={loading || refreshing}
                  aria-label='刷新'
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>刷新仓位</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {showSimulatedWarning ? (
        <div className='flex items-start gap-2 rounded-lg border border-blue-200/70 bg-blue-50/70 px-3 py-2 text-xs leading-relaxed text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/25 dark:text-blue-200'>
          <Info className='mt-0.5 h-3.5 w-3.5 shrink-0' />
          <span>交易员持仓根据操作记录模拟建仓，与实际持仓可能存在出入</span>
        </div>
      ) : null}

      {loading ? (
        <PositionSkeleton />
      ) : (
        <>
          <PositionTable positions={positions} locale={locale} />

          {followOnlyPositions.length > 0 ? (
            <Collapsible open={followOnlyOpen} onOpenChange={setFollowOnlyOpen} className='pt-1'>
              <CollapsibleTrigger asChild>
                <button
                  type='button'
                  className='flex w-full items-center justify-between rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-left text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100/80 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-950/50'
                >
                  <span className='flex items-center gap-2'>
                    仅跟单账本存在
                    <Badge
                      variant='secondary'
                      className='h-4 bg-amber-200/80 px-1.5 text-[10px] text-amber-900 dark:bg-amber-900/60 dark:text-amber-100'
                    >
                      {followOnlyPositions.length}
                    </Badge>
                  </span>
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', followOnlyOpen && 'rotate-180')} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className='mt-2'>
                <PositionTable
                  positions={followOnlyPositions}
                  locale={locale}
                  showLeaderColumn={false}
                  emptyText='暂无异常仓位'
                />
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </>
      )}
    </section>
  )
}
