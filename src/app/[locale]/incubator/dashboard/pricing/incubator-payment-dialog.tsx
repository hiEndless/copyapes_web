'use client'

import { useState } from 'react'

import Image from 'next/image'
import { Copy, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const EXCHANGE_ACCOUNTS: Record<'binance' | 'okx', string> = {
  binance: '727380886',
  okx: '443052143151353864',
}

const EXCHANGE_LOGO_SRC = {
  binance: '/exchanges/binance.png',
  okx: '/exchanges/okx.png',
}

export type IncubatorPaymentChannel = 'binance' | 'okx'

/** Backend pay_type: 4=OKX, 5=Binance */
export function paymentPayType(channel: IncubatorPaymentChannel): 4 | 5 {
  return channel === 'binance' ? 5 : 4
}

export type IncubatorPaymentProof = {
  channel: IncubatorPaymentChannel
  payType: 4 | 5
  externalRef: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  amountUsdt: number
  title?: string
  submitting?: boolean
  onConfirm: (proof: IncubatorPaymentProof) => Promise<void> | void
}

export function IncubatorPaymentDialog({
  open,
  onOpenChange,
  amountUsdt,
  title = 'USDT 支付确认',
  submitting = false,
  onConfirm,
}: Props) {
  const [channel, setChannel] = useState<IncubatorPaymentChannel>('binance')
  const [referenceId, setReferenceId] = useState('')
  const [localSubmitting, setLocalSubmitting] = useState(false)

  const busy = submitting || localSubmitting
  const account = EXCHANGE_ACCOUNTS[channel]
  const channelLabel = channel === 'binance' ? '币安' : '欧意'
  const referenceLabel = channel === 'binance' ? '订单号' : '转账号'

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(account)
      toast.success('已复制收款账号')
    } catch {
      toast.error('复制失败')
    }
  }

  const handleSubmit = async () => {
    const ref = referenceId.trim()
    if (!ref) {
      toast.error(`请填写${referenceLabel}`)
      return
    }
    try {
      setLocalSubmitting(true)
      await onConfirm({
        channel,
        payType: paymentPayType(channel),
        externalRef: ref,
      })
      setReferenceId('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '支付确认失败')
    } finally {
      setLocalSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'flex max-h-[min(90dvh,640px)] flex-col gap-0 overflow-hidden p-0 shadow-none sm:max-w-[532px]',
        )}
      >
        <DialogHeader className='border-border bg-muted/50 flex shrink-0 flex-row items-center justify-between gap-2 space-y-0 border-b px-4 py-3 text-left'>
          <DialogTitle className='text-foreground text-base font-semibold'>{title}</DialogTitle>
          <DialogClose asChild>
            <Button type='button' variant='ghost' size='icon' className='size-8 shrink-0' aria-label='关闭' disabled={busy}>
              <X className='size-4' />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4'>
          <p className='text-foreground mb-2 text-sm font-medium'>选择转账渠道</p>
          <div className='mb-5 grid grid-cols-2 gap-2'>
            {(
              [
                { id: 'binance' as const, name: 'Binance' },
                { id: 'okx' as const, name: 'OKX' },
              ] as const
            ).map(ex => {
              const selected = channel === ex.id
              return (
                <button
                  key={ex.id}
                  type='button'
                  disabled={busy}
                  onClick={() => setChannel(ex.id)}
                  className={cn(
                    'border-border bg-background flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors',
                    selected ? 'border-primary bg-muted/80 ring-ring/50 ring-1' : 'hover:bg-muted/50',
                  )}
                >
                  <Image src={EXCHANGE_LOGO_SRC[ex.id]} alt='' width={22} height={22} className='size-[22px] object-contain' />
                  <span className='font-medium'>{ex.name}</span>
                </button>
              )
            })}
          </div>

          <div className='border-border bg-muted/30 rounded-lg border p-3'>
            <p className='text-muted-foreground mb-3 text-xs leading-relaxed'>
              请先向下方账号转入应付金额，再填写转账凭证。同一转账号只能认领一次，请勿用于 Copyapes 主站套餐。
            </p>
            <div className='text-foreground space-y-4 text-sm'>
              <div>
                <p className='text-muted-foreground mb-2 leading-relaxed'>
                  1. 向 {channelLabel} 账号转入{' '}
                  <span className='text-destructive font-semibold'>{amountUsdt}</span> USDT
                </p>
                <div className='flex gap-2'>
                  <Input readOnly value={account} className='h-9 font-mono text-sm shadow-none' />
                  <Button type='button' variant='secondary' size='sm' onClick={() => void copyAccount()} className='shrink-0' disabled={busy}>
                    <Copy className='size-4' />
                    复制
                  </Button>
                </div>
              </div>
              <div>
                <p className='text-muted-foreground mb-2'>2. 填写{referenceLabel}</p>
                <p className='text-muted-foreground mb-2 text-xs leading-relaxed'>
                  {channel === 'binance' ? '请填写币安支付/转账订单号' : '请填写欧意提现或转账号'}
                </p>
                <Input
                  value={referenceId}
                  onChange={e => setReferenceId(e.target.value)}
                  placeholder={`请输入${referenceLabel}`}
                  className='h-9 text-sm shadow-none'
                  disabled={busy}
                />
              </div>
            </div>
            <div className='mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs leading-relaxed text-foreground dark:bg-amber-950/40'>
              <p>到账确认可能需要短暂等待；确认成功后自动发放席位。</p>
            </div>
          </div>
        </div>

        <DialogFooter className='border-border bg-background shrink-0 gap-2 border-t px-4 py-3 sm:justify-end'>
          <DialogClose asChild>
            <Button type='button' variant='outline' size='sm' disabled={busy}>
              关闭
            </Button>
          </DialogClose>
          <Button type='button' size='sm' onClick={() => void handleSubmit()} disabled={busy}>
            {busy && <Loader2 className='mr-2 size-4 animate-spin' />}
            确认已转账
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
