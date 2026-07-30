'use client'

import { useState } from 'react'

import Image from 'next/image'
import { Copy, X, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { settingsApi } from '@/api/settings'
import { authApi } from '@/api/auth'
import { paymentApi } from '@/api/payment'

const EXCHANGE_ACCOUNTS: Record<'binance' | 'okx', string> = {
  binance: '727380886',
  okx: '443052143151353864'
}

const EXCHANGE_LOGO_SRC = {
  binance: '/exchanges/binance.png',
  okx: '/exchanges/okx.png'
}

export type PaymentExchange = 'binance' | 'okx'

export interface PaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void

  /** Payable USDT amount (matches pricing UI) */
  amountUsdt: number

  /** Original USDT amount */
  price: number
  planCode: string
  couponCode?: string
  discount?: number
}

export function PaymentMethodDialog({
  open,
  onOpenChange,
  amountUsdt,
  price,
  planCode,
  couponCode = '',
  discount = 1
}: PaymentMethodDialogProps) {
  const t = useTranslations('DashboardPricing')
  const [exchange, setExchange] = useState<PaymentExchange>('binance')
  const [referenceId, setReferenceId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const account = EXCHANGE_ACCOUNTS[exchange]
  const exchangeLabel = exchange === 'binance' ? 'Binance' : 'OKX'
  const exchangeLabelLocal = exchange === 'binance' ? t('pay.binanceZh') : t('pay.okxZh')
  const referenceIdLabel = exchange === 'binance' ? t('pay.orderId') : t('pay.referenceNo')

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(account)
      toast.success(t('pay.copied'))
    } catch {
      toast.error(t('pay.copyFailed'))
    }
  }

  const handleSubmit = async () => {
    const ref = referenceId.trim()

    if (!ref) {
      toast.error(t('pay.needReference', { label: referenceIdLabel }))

      return
    }

    try {
      setSubmitting(true)

      const payType = exchange === 'binance' ? 5 : 4

      const res = await paymentApi.buyOrder({
        plan_code: planCode,
        pay_type: payType,
        order_price: amountUsdt,
        price: price,
        fromWdId: ref,
        product_id: 0,
        coupon_code: couponCode,
        discount: discount
      })

      if (res.code === 0) {
        toast.success(t('pay.submitSuccess'))
        onOpenChange(false)
        setReferenceId('')

        try {
          const profile = await settingsApi.getEntitlementProfile()

          if (profile) {
            localStorage.setItem('entitlementProfile', JSON.stringify(profile))
            window.dispatchEvent(new Event('entitlementProfileUpdated'))
          }

          const userInfoRes = await authApi.getLoginInfo()

          if (userInfoRes.code === 0 && userInfoRes.data) {
            const oldUserInfoStr = localStorage.getItem('userInfo')
            let newUserInfo = userInfoRes.data

            if (oldUserInfoStr) {
              try {
                const oldUserInfo = JSON.parse(oldUserInfoStr)
                newUserInfo = { ...oldUserInfo, ...userInfoRes.data }
              } catch (e) {
                console.error('Failed to parse old userInfo:', e)
              }
            }

            localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
            window.dispatchEvent(new Event('userInfoUpdated'))
          }
        } catch (profileErr) {
          console.error('Failed to fetch updated entitlement profile or user info:', profileErr)
        }
      }
    } catch (err: any) {
      toast.error(err.message || t('pay.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'max-h-[min(90dvh,640px)] gap-0 overflow-hidden p-0 shadow-none sm:max-w-[532px]'
        )}
      >
        <DialogHeader className='border-border bg-muted/50 flex flex-row items-center justify-between gap-2 space-y-0 border-b px-4 py-3 text-left'>
          <DialogTitle className='text-foreground text-base font-semibold'>{t('pay.title')}</DialogTitle>
          <DialogClose asChild>
            <Button type='button' variant='ghost' size='icon' className='size-8 shrink-0' aria-label={t('pay.closeAria')}>
              <X className='size-4' />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className='max-h-[calc(90dvh-200px)] overflow-y-auto px-4 py-4'>
          <p className='text-foreground mb-2 text-sm font-medium'>{t('pay.selectExchange')}</p>
          <div className='mb-5 grid grid-cols-2 gap-2'>
            {(
              [
                { id: 'binance' as const, name: 'Binance', logo: EXCHANGE_LOGO_SRC.binance },
                { id: 'okx' as const, name: 'OKX', logo: EXCHANGE_LOGO_SRC.okx }
              ] as const
            ).map(ex => {
              const selected = exchange === ex.id

              return (
                <button
                  key={ex.id}
                  type='button'
                  onClick={() => setExchange(ex.id)}
                  className={cn(
                    'border-border bg-background flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors',
                    selected
                      ? 'border-primary bg-muted/80 ring-ring/50 ring-1'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <Image
                    src={ex.logo}
                    alt=''
                    width={22}
                    height={22}
                    className='size-[22px] object-contain'
                  />
                  <span className='font-medium'>{ex.name}</span>
                </button>
              )
            })}
          </div>

          <div className='border-border bg-muted/30 rounded-lg border p-3'>
            <p className='text-foreground mb-3 text-sm font-medium'>{t('pay.stepsTitle')}</p>

            <div className='text-foreground space-y-4 text-sm'>
              <div>
                <p className='text-muted-foreground mb-2 leading-relaxed'>
                  {t('pay.step1Before', { exchange: exchangeLabelLocal })}{' '}
                  <span className='text-destructive font-semibold'>{amountUsdt}</span> USDT
                </p>
                <div className='flex gap-2'>
                  <Input
                    readOnly
                    value={account}
                    className='h-9 font-mono text-sm shadow-none'
                  />
                  <Button type='button' variant='secondary' size='sm' onClick={copyAccount} className='shrink-0'>
                    <Copy className='size-4' />
                    {t('pay.copy')}
                  </Button>
                </div>
              </div>

              <p className='text-muted-foreground leading-relaxed'>
                {t('pay.step2', { exchange: exchangeLabel })}
              </p>

              <div>
                <p className='text-muted-foreground mb-2'>{t('pay.step3', { label: referenceIdLabel })}</p>
                <Input
                  value={referenceId}
                  onChange={e => setReferenceId(e.target.value)}
                  placeholder={t('pay.placeholder', { label: referenceIdLabel })}
                  className='h-9 text-sm shadow-none'
                />
              </div>
            </div>

            <div className='mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs leading-relaxed text-foreground'>
              {t('pay.tip')}
            </div>
          </div>
        </div>

        <DialogFooter className='border-border bg-background gap-2 border-t px-4 py-3 sm:justify-end'>
          <DialogClose asChild>
            <Button type='button' variant='outline' size='sm' disabled={submitting}>
              {t('pay.close')}
            </Button>
          </DialogClose>
          <Button type='button' size='sm' onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className='mr-2 size-4 animate-spin' />}
            {t('pay.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
