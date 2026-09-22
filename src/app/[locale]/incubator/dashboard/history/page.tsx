'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { listIncubatorCampaigns, type IncubatorCampaign } from '@/lib/incubator-campaigns'
import {
  getIncubatorCampaignEconomics,
  type IncubatorCampaignEconomics
} from '@/lib/incubator-economics'
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

function DecimalPnlText({ value }: { value: string }) {
  const places = 4
  const normalized = value.trim()
  const negative = normalized.startsWith('-')
  const unsigned = normalized.replace(/^[+-]/, '')
  const [integerRaw = '0', fraction = ''] = unsigned.split('.', 2)
  const integer = integerRaw.replace(/^0+(?=\d)/, '') || '0'
  const digits = (fraction + '0'.repeat(places)).slice(0, places).split('').map(char => Number(char) || 0)
  let carry = (fraction[places] ?? '0') >= '5' ? 1 : 0
  for (let index = digits.length - 1; index >= 0 && carry; index -= 1) {
    const next = digits[index] + carry
    digits[index] = next % 10
    carry = next >= 10 ? 1 : 0
  }
  const roundedInteger = carry ? (BigInt(integer) + 1n).toString() : integer
  const roundedFraction = digits.join('')
  const zero = roundedInteger === '0' && /^0+$/.test(roundedFraction)
  const sign = zero ? 0 : negative ? -1 : 1
  const text = `${negative && !zero ? '-' : ''}${zero ? '0' : roundedInteger}.${roundedFraction}`

  return (
    <span
      className={cn(
        'font-semibold tabular-nums tracking-tight',
        sign > 0 && 'text-emerald-600 dark:text-emerald-400',
        sign < 0 && 'text-red-600 dark:text-red-400'
      )}
    >
      {sign > 0 ? '+' : ''}{text} U
    </span>
  )
}

type RealHistoryItem = {
  campaign: IncubatorCampaign
  economics?: IncubatorCampaignEconomics
  error?: string
}

function settlementStatusLabel(economics: IncubatorCampaignEconomics) {
  if (economics.settlement.data_status === 'FINAL') return '最终数据'
  if (economics.settlement.data_status === 'FAILED') return '结算异常'

  return '结算中'
}

export default function IncubatorHistoryPage() {
  const [demoMode, setDemoMode] = useState(false)
  const [historyCampaigns, setHistoryCampaigns] = useState<Campaign[]>([])
  const [realHistory, setRealHistory] = useState<RealHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let generation = 0

    const loadRealHistory = async (currentGeneration: number) => {
      setLoading(true)
      setLoadError(null)

      try {
        const campaigns = (await listIncubatorCampaigns()).filter(
          campaign => campaign.status === 'COMPLETED'
        )

        const items: RealHistoryItem[] = []

        // Historical summaries load once and sequentially to avoid a burst of economics reads.
        for (const campaign of campaigns) {
          if (campaign.exchange !== 'OKX') {
            items.push({ campaign, error: '当前阶段仅支持 OKX 项目收益' })
            continue
          }

          try {
            const economics = await getIncubatorCampaignEconomics(campaign.id)

            items.push({ campaign, economics })
          } catch (error) {
            items.push({
              campaign,
              error: error instanceof Error ? error.message : '收益数据加载失败'
            })
          }
        }

        if (currentGeneration === generation) setRealHistory(items)
      } catch (error) {
        if (currentGeneration === generation) {
          setRealHistory([])
          setLoadError(error instanceof Error ? error.message : '历史项目加载失败')
        }
      } finally {
        if (currentGeneration === generation) setLoading(false)
      }
    }

    const syncFromDemoMode = (enabled: boolean) => {
      const currentGeneration = ++generation

      setDemoMode(enabled)
      setHistoryCampaigns(enabled ? cloneDemoBoardData().historyCampaigns : [])
      setRealHistory([])
      setLoadError(null)
      setLoading(false)
      if (!enabled) void loadRealHistory(currentGeneration)
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
      generation += 1
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
            : '已结束项目 · 仅展示结果摘要'}
        </p>
      </div>

      {!demoMode && loadError && (
        <div className='rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-700 dark:text-red-300'>
          {loadError}
        </div>
      )}

      {(demoMode ? historyCampaigns.length : realHistory.length) === 0 ? (
        <Card className='border-dashed py-16 shadow-none'>
          <CardContent className='flex flex-col items-center justify-center text-center'>
            <p className='text-sm font-medium'>
              {loading ? '历史项目加载中' : '暂无历史项目'}
            </p>
            <p className='text-muted-foreground mt-1 text-xs'>
              {demoMode
                ? '结束后的项目会出现在这里'
                : '已结束的 Campaign 会在这里展示最终收益摘要'}
            </p>
          </CardContent>
        </Card>
      ) : demoMode ? (
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
      ) : (
        <div className='grid gap-4'>
          {realHistory.map(({ campaign, economics, error }) => (
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
                  初始 {campaign.initial_account_count} 账号 · 共 {campaign.total_rounds} 轮 · 结算{' '}
                  {economics
                    ? `${economics.settlement.settled}/${economics.settlement.total} · ${settlementStatusLabel(economics)}`
                    : error ?? '加载中'}
                </CardDescription>
              </CardHeader>

              <CardContent className='relative z-10 grid grid-cols-2 border-t-0 p-0 sm:grid-cols-4'>
                <Metric
                  label='项目净收益'
                  value={economics ? <DecimalPnlText value={economics.totals.realized_pnl} /> : <span className='text-muted-foreground'>{error ?? '加载中'}</span>}
                />
                <Metric
                  label='手续费'
                  value={economics ? <DecimalPnlText value={economics.totals.fee} /> : <span className='text-muted-foreground'>—</span>}
                />
                <Metric
                  label='交易周期'
                  value={economics ? <span className='tabular-nums'>{economics.totals.trade_cycle_count}</span> : <span className='text-muted-foreground'>—</span>}
                />
                <Metric
                  label='最终轮次'
                  value={<span className='tabular-nums'>{campaign.current_round} / {campaign.total_rounds}</span>}
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
