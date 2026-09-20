'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import {
  INCUBATOR_DEMO_MODE_EVENT,
  cloneDemoBoardData,
  formatPnl,
  readBoardDemoMode,
  type Campaign
} from '../_mock/campaign'

function PnlText({ value }: { value: number }) {
  return (
    <span
      className={cn(
        'font-semibold tabular-nums tracking-tight',
        value > 0 && 'text-emerald-600 dark:text-emerald-400',
        value < 0 && 'text-red-600 dark:text-red-400'
      )}
    >
      {formatPnl(value)}
    </span>
  )
}

export default function IncubatorHistoryPage() {
  const [demoMode, setDemoMode] = useState(false)
  const [historyCampaigns, setHistoryCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    const syncFromDemoMode = (enabled: boolean) => {
      setDemoMode(enabled)
      setHistoryCampaigns(enabled ? cloneDemoBoardData().historyCampaigns : [])
    }

    syncFromDemoMode(readBoardDemoMode())

    const onDemoModeChange = (event: Event) => {
      const enabled = Boolean((event as CustomEvent<{ enabled: boolean }>).detail?.enabled)
      syncFromDemoMode(enabled)
    }
    const onFocus = () => syncFromDemoMode(readBoardDemoMode())

    window.addEventListener(INCUBATOR_DEMO_MODE_EVENT, onDemoModeChange)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener(INCUBATOR_DEMO_MODE_EVENT, onDemoModeChange)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return (
    <div className='bg-background text-foreground flex h-full flex-col gap-4 overflow-y-auto p-4 lg:p-6'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-2xl font-bold tracking-tight'>历史项目</h1>
        <p className='text-muted-foreground text-sm'>
          {demoMode
            ? '已结束项目 · 只读查看（模拟演示数据）'
            : '真实模式 · 接口未接入，开启看板「模拟演示」可载入历史样例'}
        </p>
      </div>

      {historyCampaigns.length === 0 ? (
        <Card className='border-dashed py-16 shadow-none'>
          <CardContent className='flex flex-col items-center justify-center text-center'>
            <p className='text-sm font-medium'>
              {demoMode ? '暂无历史项目' : '历史 Campaign 接口待接入'}
            </p>
            <p className='text-muted-foreground mt-1 text-xs'>
              {demoMode
                ? '结束后的项目会出现在这里'
                : '当前不会展示模拟结果；如需查看交互样例，请在项目看板显式开启模拟演示'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4'>
          {historyCampaigns.map(campaign => (
            <Card key={campaign.id} className='relative gap-0 overflow-hidden border py-0 shadow-sm'>
              <img
                src={`/exchanges/${campaign.exchange.toLowerCase()}.png`}
                alt=''
                aria-hidden
                className='pointer-events-none absolute -right-4 -bottom-6 size-36 object-contain opacity-[0.08] select-none dark:opacity-[0.12] sm:size-44'
                onError={event => {
                  ;(event.target as HTMLImageElement).style.display = 'none'
                }}
              />

              <CardHeader className='relative z-10 gap-1 border-b-0 px-4 pb-1 pt-4'>
                <CardTitle className='text-sm font-semibold tracking-tight'>
                  {campaign.code} · {campaign.name}
                </CardTitle>
                <CardDescription className='text-xs'>
                  初始 {campaign.initialAccounts} 账号 · 共 {campaign.totalRounds} 轮 · 结算{' '}
                  {campaign.settled}/{campaign.cycles}
                </CardDescription>
              </CardHeader>

              <CardContent className='relative z-10 grid grid-cols-2 border-t-0 p-0 sm:grid-cols-4'>
                <Metric label='项目净收益' value={<PnlText value={campaign.campaignNet} />} />
                <Metric label='手续费' value={<PnlText value={campaign.fees} />} />
                <Metric
                  label='交易周期'
                  value={<span className='tabular-nums'>{campaign.cycles}</span>}
                />
                <Metric
                  label='最终轮次'
                  value={
                    <span className='tabular-nums'>
                      {campaign.currentRound} / {campaign.totalRounds}
                    </span>
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='bg-transparent px-4 pb-4 pt-2'>
      <p className='text-muted-foreground/90 text-[11px] font-medium dark:text-muted-foreground/80'>
        {label}
      </p>
      <div className='text-foreground mt-1.5 text-sm font-semibold tabular-nums'>{value}</div>
    </div>
  )
}
