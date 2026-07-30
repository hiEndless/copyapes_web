'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const RISK_ITEM_COUNT = 7

interface ApiRiskDisclosureStepProps {
  onNext: () => void
}

export function ApiRiskDisclosureStep({ onNext }: ApiRiskDisclosureStepProps) {
  const t = useTranslations('DashboardApi')
  const bold = { bold: (chunks: React.ReactNode) => <strong>{chunks}</strong> }
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const checkScrollBottom = useCallback(() => {
    const el = scrollRef.current

    if (!el) return

    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8

    if (atBottom) {
      setScrolledToBottom(true)
    }
  }, [])

  useEffect(() => {
    requestAnimationFrame(checkScrollBottom)
  }, [checkScrollBottom])

  const canProceed = scrolledToBottom && agreed

  return (
    <>
      <DialogHeader className='border-border flex shrink-0 flex-row items-start justify-between gap-2 space-y-0 border-b px-6 py-4 text-left'>
        <div>
          <DialogTitle className='text-[17px] leading-tight font-semibold tracking-tight'>
            {t('risk.title')}
          </DialogTitle>
          <p className='text-muted-foreground mt-1 text-[11.5px] font-medium'>
            {t('risk.stepHint', { current: 1, total: 2, count: RISK_ITEM_COUNT })}
          </p>
        </div>
        <DialogClose asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-8 shrink-0'
            aria-label={t('common.close')}
          >
            <X className='size-4' />
          </Button>
        </DialogClose>
      </DialogHeader>

      <div
        ref={scrollRef}
        onScroll={checkScrollBottom}
        className='min-h-0 flex-1 overflow-y-auto px-6 py-4'
      >
        <RiskItem
          index={1}
          highlight
          title={t('risk.items.withdraw.title')}
          content={
            <>
              <p>{t.rich('risk.items.withdraw.p1', bold)}</p>
              <p>{t.rich('risk.items.withdraw.p2', bold)}</p>
              <p className='text-muted-foreground/70 mt-1 text-[10.5px]'>
                {t('risk.items.withdraw.p3')}
              </p>
            </>
          }
        />

        <RiskItem
          index={2}
          title={t('risk.items.encryption.title')}
          content={
            <>
              <p>{t.rich('risk.items.encryption.p1', bold)}</p>
              <p>{t.rich('risk.items.encryption.p2', bold)}</p>
            </>
          }
        />

        <RiskItem
          index={3}
          title={t('risk.items.engine.title')}
          content={
            <>
              <p>{t.rich('risk.items.engine.p1', bold)}</p>
              <p>{t.rich('risk.items.engine.p2', bold)}</p>
              <p>{t.rich('risk.items.engine.p3', bold)}</p>
            </>
          }
        />

        <RiskItem
          index={4}
          title={t('risk.items.control.title')}
          content={
            <>
              <p>{t.rich('risk.items.control.p1', bold)}</p>
              <p>{t('risk.items.control.p2')}</p>
            </>
          }
        />

        <RiskItem
          index={5}
          title={t('risk.items.contractRisk.title')}
          content={
            <>
              <p>{t.rich('risk.items.contractRisk.p1', bold)}</p>
              <ul className='ml-5 list-disc space-y-0.5'>
                <li>{t.rich('risk.items.contractRisk.bullets.liquidation', bold)}</li>
                <li>{t.rich('risk.items.contractRisk.bullets.latency', bold)}</li>
                <li>{t.rich('risk.items.contractRisk.bullets.strategy', bold)}</li>
                <li>{t.rich('risk.items.contractRisk.bullets.system', bold)}</li>
                <li>{t.rich('risk.items.contractRisk.bullets.human', bold)}</li>
              </ul>
              <p className='mt-1'>{t.rich('risk.items.contractRisk.p2', bold)}</p>
            </>
          }
        />

        <RiskItem
          index={6}
          title={t('risk.items.allocation.title')}
          content={
            <>
              <p>{t('risk.items.allocation.p1')}</p>
              <ul className='ml-5 list-disc space-y-0.5'>
                <li>{t.rich('risk.items.allocation.bullets.first', bold)}</li>
                <li>{t.rich('risk.items.allocation.bullets.stable', bold)}</li>
                <li>{t.rich('risk.items.allocation.bullets.reserve', bold)}</li>
              </ul>
            </>
          }
        />

        <RiskItem
          index={7}
          title={t('risk.items.privacy.title')}
          content={
            <>
              <p>{t.rich('risk.items.privacy.p1', bold)}</p>
              <p>{t.rich('risk.items.privacy.p2', bold)}</p>
            </>
          }
        />
      </div>

      <div className='border-border bg-background shrink-0 border-t px-6 py-3'>
        <div className='mb-2.5 flex flex-wrap items-center'>
          <label
            className={cn(
              'flex items-center gap-2 text-xs select-none transition-opacity',
              scrolledToBottom ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'
            )}
          >
            <Checkbox
              checked={agreed}
              disabled={!scrolledToBottom}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <span className='text-foreground font-medium'>{t('risk.agree')}</span>
          </label>
          {!scrolledToBottom && (
            <span className='text-muted-foreground ml-2 text-[10.5px] font-medium'>
              {t('risk.scrollFirst')}
            </span>
          )}
        </div>

        <div className='flex gap-2'>
          <Button
            type='button'
            className='h-11 flex-1 text-[13px] font-semibold'
            disabled={!canProceed}
            onClick={onNext}
          >
            {t('risk.next')}
          </Button>
          <DialogClose asChild>
            <Button
              type='button'
              variant='secondary'
              className='h-11 px-5 text-[13px] font-semibold'
            >
              {t('common.cancel')}
            </Button>
          </DialogClose>
        </div>
      </div>
    </>
  )
}

function RiskItem({
  index,
  title,
  content,
  highlight = false
}: {
  index: number
  title: string
  content: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className='border-border/40 flex gap-3.5 border-b py-3 last:border-b-0'>
      <div
        className={cn(
          'w-[22px] shrink-0 pt-px text-right text-[12.5px] font-bold tabular-nums',
          highlight ? 'text-destructive' : 'text-muted-foreground'
        )}
      >
        {index}.
      </div>
      <div className='flex-1'>
        <div
          className={cn(
            'mb-0.5 text-[12.5px] font-semibold',
            highlight ? 'text-destructive' : 'text-foreground'
          )}
        >
          {title}
        </div>
        <div className='text-muted-foreground space-y-1 text-[11.5px] leading-[1.7]'>{content}</div>
      </div>
    </div>
  )
}
