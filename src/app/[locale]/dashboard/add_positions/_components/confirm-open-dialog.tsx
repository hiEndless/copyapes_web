'use client'

import * as React from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { ExchangeLogo } from './exchange-logo'
import { formatUsdtBalance } from './format-balance'
import type { OpenSide, PositionMarginMode, QuantityUnitLabel, TradingApiMock } from './types'

export type OpenConfirmSummary = {
  api: TradingApiMock
  symbol: string
  marginMode: PositionMarginMode
  side: OpenSide
  quantity: string
  quantityUnit: QuantityUnitLabel
  leverage: number
}

const marginLabel: Record<PositionMarginMode, string> = {
  cross: '全仓',
  isolated: '逐仓',
}

const sideLabel: Record<OpenSide, string> = {
  long: '多',
  short: '空',
}

type ConfirmOpenDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  summary: OpenConfirmSummary | null
  onConfirm: (final: OpenConfirmSummary) => Promise<void> | void
}

export function ConfirmOpenDialog({ open, onOpenChange, summary, onConfirm }: ConfirmOpenDialogProps) {
  const [submitting, setSubmitting] = React.useState(false)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden border-border/80 p-0 sm:max-w-md'>
        <div className='from-primary/[0.06] border-border/60 border-b bg-gradient-to-br to-transparent px-4 py-3.5'>
          <AlertDialogHeader className='space-y-1 text-left sm:text-left'>
            <AlertDialogTitle className='text-base font-semibold tracking-tight'>确认开仓</AlertDialogTitle>
            <AlertDialogDescription className='sr-only'>
              核对开仓参数：交易对、杠杆、仓位模式、方向与数量
            </AlertDialogDescription>
            <p className='text-muted-foreground text-xs leading-normal'>
              请核对以下参数，确认后将提交开仓请求
            </p>
          </AlertDialogHeader>
        </div>
        <div className='px-4 py-3.5'>
          <div className='text-[13px] leading-tight' role='region' aria-label='开仓参数摘要'>
            {summary ? (
              <div className='bg-muted/40 border-border/60 space-y-3 rounded-lg border p-3'>
                <div className='flex items-center gap-2.5'>
                  <ExchangeLogo src={summary.api.logoSrc} alt={summary.api.exchangeName} size={40} />
                  <div className='min-w-0 space-y-0.5'>
                    <p className='text-foreground truncate text-[13px] font-semibold leading-tight'>{summary.api.label}</p>
                    <p className='text-muted-foreground text-[11px] leading-tight'>{summary.api.exchangeName}</p>
                  </div>
                </div>
                <dl className='grid grid-cols-[4.75rem_1fr] gap-x-2 gap-y-1.5 text-[11px] leading-tight'>
                  <dt className='text-muted-foreground'>账户余额</dt>
                  <dd className='tabular-nums'>
                    {formatUsdtBalance(summary.api.balanceUsdt)}{' '}
                    <span className='text-muted-foreground'>USDT</span>
                  </dd>
                  <dt className='text-muted-foreground'>交易对</dt>
                  <dd className='text-foreground font-mono text-[11px] font-medium tracking-tight'>{summary.symbol}</dd>
                  <dt className='text-muted-foreground'>杠杆</dt>
                  <dd className='tabular-nums'>{summary.leverage}x</dd>
                  <dt className='text-muted-foreground'>仓位模式</dt>
                  <dd>{marginLabel[summary.marginMode]}</dd>
                  <dt className='text-muted-foreground'>方向</dt>
                  <dd
                    className={
                      summary.side === 'long'
                        ? 'font-medium text-emerald-600 dark:text-emerald-400'
                        : 'font-medium text-rose-600 dark:text-rose-400'
                    }
                  >
                    {sideLabel[summary.side]}
                  </dd>
                  <dt className='text-muted-foreground'>开仓量</dt>
                  <dd className='tabular-nums'>
                    {summary.quantity}{' '}
                    <span className='text-muted-foreground'>{summary.quantityUnit}</span>
                  </dd>
                </dl>
              </div>
            ) : (
              <p className='text-muted-foreground text-center text-xs leading-tight'>无有效参数</p>
            )}
          </div>
        </div>
        <AlertDialogFooter className='border-border/60 bg-muted/20 border-t px-4 py-3 sm:justify-end'>
          <AlertDialogCancel className='h-8 rounded-md px-3 text-xs'>取消</AlertDialogCancel>
          <AlertDialogAction
            className='h-8 rounded-md px-3 text-xs'
            disabled={submitting || !summary}
            onClick={async e => {
              e.preventDefault()
              if (submitting || !summary) return

              setSubmitting(true)

              try {
                await onConfirm(summary)
                onOpenChange(false)
              } catch {
                // 失败时保持弹窗打开，由调用侧展示错误信息。
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {submitting ? '提交中…' : '确认开仓'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
