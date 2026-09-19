'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { MOCK_HISTORY_CAMPAIGNS, campaignStatusLabel, confidenceLabel, formatPnl } from '../_mock/campaign'

export default function IncubatorHistoryPage() {
  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-2xl font-bold tracking-tight'>历史项目</h1>
        <p className='text-muted-foreground text-sm'>已结束的项目 · 只读查看（演示数据）</p>
      </div>

      <div className='grid gap-3'>
        {MOCK_HISTORY_CAMPAIGNS.map(campaign => (
          <Card key={campaign.id} className='shadow-none'>
            <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <div className='space-y-1.5'>
                <div className='flex flex-wrap items-center gap-2'>
                  <CardTitle className='text-base'>
                    {campaign.code} · {campaign.name}
                  </CardTitle>
                  <Badge variant='outline' className='text-[10px]'>
                    {campaignStatusLabel(campaign.status)}
                  </Badge>
                  <Badge variant='secondary' className='text-[10px]'>
                    {confidenceLabel(campaign.confidence)}
                  </Badge>
                </div>
                <CardDescription>
                  {campaign.exchange} · 初始 {campaign.initialAccounts} 账号 · 共 {campaign.totalRounds} 轮 · 结算{' '}
                  {campaign.settled}/{campaign.cycles}
                </CardDescription>
              </div>
              <Button asChild size='sm' variant='outline'>
                <Link href='/incubator/dashboard/board'>在看板查看结构</Link>
              </Button>
            </CardHeader>
            <CardContent className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <Metric
                label='项目净收益'
                value={
                  <span
                    className={cn(
                      'font-semibold tabular-nums',
                      campaign.campaignNet > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500'
                    )}
                  >
                    {formatPnl(campaign.campaignNet)}
                  </span>
                }
              />
              <Metric
                label='手续费'
                value={<span className='font-semibold tabular-nums text-red-500'>{formatPnl(campaign.fees)}</span>}
              />
              <Metric
                label='交易周期'
                value={<span className='font-semibold tabular-nums'>{campaign.cycles}</span>}
              />
              <Metric
                label='最终轮次'
                value={
                  <span className='font-semibold tabular-nums'>
                    R{campaign.currentRound}/{campaign.totalRounds}
                  </span>
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='border-border/70 rounded-lg border px-3 py-2.5'>
      <p className='text-muted-foreground text-[11px]'>{label}</p>
      <div className='mt-1 text-sm'>{value}</div>
    </div>
  )
}
