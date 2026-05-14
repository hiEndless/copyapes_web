'use client'

import * as React from 'react'

import { KeyRoundIcon, LockIcon } from 'lucide-react'

import type { EntitlementProfileResponse } from '@/api/settings'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import { ExchangeLogo } from './exchange-logo'
import { formatUsdtBalance } from './format-balance'
import type { TradingApiMock } from './types'

type ApiKeyPickerProps = {
  apis: TradingApiMock[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ApiKeyPicker({ apis, selectedId, onSelect }: ApiKeyPickerProps) {
  const [isStudioVip, setIsStudioVip] = React.useState(false)

  React.useEffect(() => {
    const syncEntitlementProfile = () => {
      try {
        const stored = localStorage.getItem('entitlementProfile')

        if (!stored) {
          setIsStudioVip(false)

          return
        }

        const profile = JSON.parse(stored) as EntitlementProfileResponse

        setIsStudioVip(Boolean(profile?.is_studio_vip))
      } catch (error) {
        console.error('Failed to parse entitlement profile:', error)
        setIsStudioVip(false)
      }
    }

    syncEntitlementProfile()
    window.addEventListener('entitlementProfileUpdated', syncEntitlementProfile)

    return () => {
      window.removeEventListener('entitlementProfileUpdated', syncEntitlementProfile)
    }
  }, [])

  return (
    <Card className='relative grid max-h-[min(28rem,52vh)] grid-rows-[auto_1fr] overflow-hidden border-border/80 text-[13px] leading-tight shadow-sm sm:max-h-[min(31rem,60vh)]'>
      <CardHeader className='border-border/60 from-muted/30 border-b bg-gradient-to-br to-transparent px-3 py-3 sm:px-4'>
        <div className='flex items-center gap-2'>
          <div className='bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md'>
            <KeyRoundIcon className='size-3.5' />
          </div>
          <div className='min-w-0 space-y-0.5'>
            <CardTitle className='text-sm font-semibold tracking-tight'>交易 API</CardTitle>
            <CardDescription className='text-muted-foreground text-[11px] leading-snug'>
              选择账户后在右侧开仓
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='relative min-h-0 overflow-hidden p-0'>
        <ScrollArea className='h-full min-h-0'>
          <div className='space-y-1.5 p-2.5 pr-3 sm:p-3 sm:pr-3.5'>
            {apis.map(api => {
              const selected = selectedId === api.id

              return (
                <button
                  key={api.id}
                  type='button'
                  onClick={() => onSelect(api.id)}
                  className={cn(
                    'group w-full rounded-lg border px-2.5 py-2 text-left transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    selected
                      ? 'border-primary/50 bg-primary/[0.06] shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]'
                      : 'border-border/80 bg-card hover:border-border hover:bg-muted/35 hover:shadow-sm'
                  )}
                >
                  <div className='flex items-center gap-2.5'>
                    <ExchangeLogo src={api.logoSrc} alt={api.exchangeName} size={36} className='rounded-lg' />
                    <div className='min-w-0 flex-1 space-y-0.5'>
                      <div className='flex flex-wrap items-center gap-1'>
                        <span className='truncate text-[13px] font-semibold tracking-tight'>{api.label}</span>
                        <Badge
                          variant='secondary'
                          className={cn(
                            'h-4 shrink-0 border px-1 py-0 text-[9px] font-medium uppercase leading-none tracking-wide',
                            selected ? 'border-primary/20 bg-primary/10 text-primary' : 'font-normal'
                          )}
                        >
                          {api.exchangeName}
                        </Badge>
                      </div>
                      <div className='text-muted-foreground flex flex-wrap items-baseline gap-x-1.5 text-[11px] leading-tight'>
                        <span className='text-foreground font-medium tabular-nums'>
                          {formatUsdtBalance(api.balanceUsdt)}
                          <span className='text-muted-foreground ml-0.5 font-normal'>USDT</span>
                        </span>
                        <span className='text-border'>·</span>
                        <span>单位 {api.quantityUnit}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>

        {!isStudioVip ? (
          <div className='absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/45 backdrop-blur-sm'>
            <div className='inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-3 py-1 text-xs font-medium text-foreground shadow-sm'>
              <LockIcon className='h-3.5 w-3.5' />
              工作室 VIP 专享
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
