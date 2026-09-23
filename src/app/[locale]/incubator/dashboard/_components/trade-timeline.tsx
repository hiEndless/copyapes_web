'use client'

import { cn } from '@/lib/utils'

export type TradeTimelineAction = 'open' | 'add' | 'reduce' | 'close'
export type TradeTimelineSide = 'buy' | 'sell'
export type TradeTimelinePosSide = 'long' | 'short'

export type TradeTimelineItem = {
  id: string
  eventAt: string
  action: TradeTimelineAction
  side: TradeTimelineSide
  posSide: TradeTimelinePosSide
  symbol: string
  quantity: number | string
  price?: number | string | null
  apiLabel?: string
  /** 交易所原样错误，不做转译 */
  error?: { code: number | string; msg: string } | null
  failed?: boolean
}

function formatExchangeError(error: { code: number | string; msg: string }) {
  const code =
    typeof error.code === 'string' ? `'${error.code.replace(/'/g, "\\'")}'` : String(error.code)
  return `{'code': ${code}, 'msg': ${JSON.stringify(error.msg)}}`
}

function shortEventAt(value: string) {
  const trimmed = value.trim().replace(/(\.\d{3})\d+/, '$1')
  if (!trimmed) return '-'
  const parsed = new Date(trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T'))
  if (Number.isNaN(parsed.getTime())) return value
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`
}

function actionColor(action: string) {
  switch (action.toLowerCase()) {
    case 'open':
    case 'add':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'close':
    case 'reduce':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-foreground'
  }
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    open: '开仓',
    add: '加仓',
    reduce: '减仓',
    close: '平仓'
  }
  return map[action.toLowerCase()] || action
}

function sideLabel(side: string, posSide: string) {
  if (posSide === 'long') return '做多'
  if (posSide === 'short') return '做空'
  if (side === 'buy') return '买入'
  if (side === 'sell') return '卖出'
  return ''
}

export function TradeTimeline({
  items,
  emptyText = '暂无记录',
  className,
  showApiLabel = false
}: {
  items: TradeTimelineItem[]
  emptyText?: string
  className?: string
  showApiLabel?: boolean
}) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          'text-muted-foreground flex items-center justify-center py-6 text-[11px]',
          className
        )}
      >
        {emptyText}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map(item => (
        <div key={item.id} className='relative pl-4'>
          <span
            className={cn(
              'absolute top-[6px] left-0 size-2 rounded-full',
              item.failed || item.error ? 'bg-red-500' : 'bg-primary/80'
            )}
          />
          <span className='bg-border/70 absolute top-4 left-[3px] h-[calc(100%-8px)] w-px' />
          <div className='space-y-1 pb-3'>
            {showApiLabel && item.apiLabel && (
              <div className='text-foreground/90 text-xs leading-5 font-medium'>{item.apiLabel}</div>
            )}
            <div className='text-muted-foreground text-[11px] tabular-nums'>{shortEventAt(item.eventAt)}</div>
            <div className='text-foreground/90 text-xs leading-5'>
              <span className={cn('mr-2 font-bold', actionColor(item.action))}>
                {actionLabel(item.action)} {sideLabel(item.side, item.posSide)}
              </span>
              <span className='mr-2'>{item.symbol}</span>
              <span className='text-muted-foreground'>量: {item.quantity}</span>
            </div>
            {item.error && (
              <pre className='text-red-600/90 dark:text-red-400/90 max-w-full overflow-x-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-4'>
                {formatExchangeError(item.error)}
              </pre>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
