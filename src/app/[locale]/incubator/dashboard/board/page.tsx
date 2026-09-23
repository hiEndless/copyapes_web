'use client'

import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from 'react'
import { toast } from 'sonner'

import { ChartColumn, CircleStop, Crown, GripVertical, Play, Plus, Square, Waypoints, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import {
  EXCHANGES,
  campaignStatusLabel,
  confidenceLabel,
  confirmLeader,
  cloneDemoBoardData,
  createCampaignFromApis,
  endCampaignEarly,
  formatPnl,
  getAvailableApis,
  getCampaignApiIds,
  getLeaderClosedPositions,
  getLeaderOpenPositions,
  getMemberTradeTimeline,
  buildPromoteResultSummary,
  isPowerOfTwo,
  isLowBalance,
  memberBalance,
  mockBalanceForApi,
  readBoardDemoMode,
  relationLabel,
  resultLabel,
  validApiSelectionCounts,
  roundPhaseLabel,
  startRound,
  terminateRound,
  updateMemberRelation,
  writeBoardDemoMode,
  type Campaign,
  type ClosedPosition,
  type ExchangeId,
  type MemberRelation,
  type OpenPosition,
  type PromoteResultSummary,
  type RoundSnapshot,
  type RoundMember
} from '../_mock/campaign'
import { TradeTimeline, type TradeTimelineItem } from '../_components/trade-timeline'
import { listIncubatorApiAccounts } from '@/lib/incubator-api-accounts'
import {
  createIncubatorCampaign,
  endIncubatorCampaign,
  listIncubatorCampaigns,
  startIncubatorRound,
  terminateIncubatorRound,
  updateIncubatorRoundSetup,
  type IncubatorCampaign
} from '@/lib/incubator-campaigns'
import {
  listIncubatorTradeRecords,
  type IncubatorTradeEvent
} from '@/lib/incubator-trade-records'
import {
  getIncubatorCampaignEconomics,
  type IncubatorCampaignEconomics,
  type IncubatorMemberEconomics
} from '@/lib/incubator-economics'
import type { IncubatorLeaderPositionItem } from '@/lib/incubator-leader-position'
import {
  loadCachedMemberPositionHistory,
  loadCachedMemberPositions,
  invalidateMemberPositions,
  memberPositionReasonText,
  peekCachedMemberPositionHistory,
  peekCachedMemberPositions,
  type IncubatorMemberPositionHistory,
  type IncubatorMemberPositionHistoryItem,
  type IncubatorMemberPositions
} from '@/lib/incubator-member-position'

const BOARD_POLL_INTERVAL_MS = 10_000

function roiPercent(ratio: string | null | undefined): number | null {
  if (ratio == null || ratio.trim() === '') return null
  const parsed = Number(ratio)
  return Number.isFinite(parsed) ? parsed * 100 : null
}

function formatRoi(value: number): string {
  const digits = Math.abs(value) < 1 ? 2 : 1
  const text = value.toFixed(digits)
  if (Number(text) === 0) return '0.0%'
  return `${value > 0 ? '+' : ''}${text}%`
}

function parseDecimalDisplay(value: string | null | undefined): number {
  if (value == null || value.trim() === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatPnlUsdt(value: number): string {
  const abs = Math.abs(value)
  const digits = abs === 0 ? 1 : abs < 0.01 ? 4 : abs < 1 ? 2 : 1
  const text = value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
  if (value > 0) return `+${text}`
  return text
}

function formatPositionOpenedAt(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function toLeaderOpenPosition(item: IncubatorLeaderPositionItem): OpenPosition {
  const side = item.position_side.trim().toUpperCase() === 'SHORT' ? 'SHORT' : 'LONG'
  const mode = item.margin_mode.trim().toLowerCase()
  const marginMode = mode.includes('isolat') || mode.includes('逐仓') ? '逐仓' : '全仓'
  const qtyAsset = item.symbol.replace(/[-_]?USDT.*$/i, '').replace(/-/g, '') || item.symbol

  return {
    id: item.exchange_position_id || `${item.symbol}:${item.position_side}:${item.margin_mode}`,
    symbol: item.symbol,
    side,
    marginMode,
    leverage: parseDecimalDisplay(item.leverage),
    pnlUsdt: parseDecimalDisplay(item.unrealized_pnl),
    roiPct: roiPercent(item.unrealized_pnl_ratio),
    qty: parseDecimalDisplay(item.quantity),
    qtyAsset,
    entryPrice: parseDecimalDisplay(item.entry_price),
    openedAt: formatPositionOpenedAt(item.opened_at)
  }
}

function toClosedPosition(item: IncubatorMemberPositionHistoryItem): ClosedPosition {
  const side = item.position_side.trim().toUpperCase() === 'SHORT' ? 'SHORT' : 'LONG'
  const mode = item.margin_mode.trim().toLowerCase()
  const marginMode = mode.includes('isolat') || mode.includes('逐仓') ? '逐仓' : '全仓'
  const qtyAsset = item.symbol.replace(/[-_]?USDT.*$/i, '').replace(/-/g, '') || item.symbol

  return {
    id: `${item.exchange_position_id || item.symbol}:${item.position_side}:${item.closed_at}`,
    symbol: item.symbol,
    side,
    marginMode,
    leverage: parseDecimalDisplay(item.leverage),
    pnlUsdt: parseDecimalDisplay(item.realized_pnl),
    roiPct: roiPercent(item.realized_pnl_ratio),
    qty: parseDecimalDisplay(item.quantity),
    qtyAsset,
    entryPrice: parseDecimalDisplay(item.entry_price),
    exitPrice: item.exit_price == null || item.exit_price === '' ? null : parseDecimalDisplay(item.exit_price),
    openedAt: formatPositionOpenedAt(item.opened_at),
    closedAt: formatPositionOpenedAt(item.closed_at)
  }
}

function historyView(snapshot: IncubatorMemberPositionHistory): { positions: ClosedPosition[]; error: string | null } {
  if (snapshot.status === 'UNAVAILABLE') {
    return { positions: [], error: memberPositionReasonText(snapshot.reason_code) }
  }

  return { positions: snapshot.positions.map(toClosedPosition), error: null }
}

function positionView(snapshot: IncubatorMemberPositions): { positions: OpenPosition[]; error: string | null } {
  if (snapshot.status === 'UNAVAILABLE') {
    return { positions: [], error: memberPositionReasonText(snapshot.reason_code) }
  }

  return { positions: snapshot.positions.map(toLeaderOpenPosition), error: null }
}

function leaderPositionEmptyText(input: { hasLeader: boolean; loading: boolean; error: string | null }): string {
  if (!input.hasLeader) return '尚未确认领单，暂无仓位'
  if (input.loading) return '领单仓位加载中…'
  if (input.error) return input.error
  return '领单暂无当前持仓'
}

function roundSetupSignature(round: RoundSnapshot): string {
  const leaderMemberId = round.members.find(member => member.isLeader)?.id ?? null
  const assignments = round.members
    .map(member => [member.id, member.relation] as const)
    .sort(([left], [right]) => left.localeCompare(right))

  return JSON.stringify({ leaderMemberId, assignments })
}

function fromApiCampaign(item: IncubatorCampaign): Campaign {
  const exchange = item.exchange === 'BINANCE' ? 'Binance' : item.exchange === 'GATE' ? 'Gate' : 'OKX'
  const status =
    item.status === 'READY'
      ? 'READY'
      : item.status === 'ACTIVE'
        ? 'RUNNING'
        : item.status === 'COMPLETED'
          ? 'COMPLETED'
          : item.status === 'PAUSED'
            ? 'PAUSED'
            : item.status === 'ERROR'
              ? 'ERROR'
              : 'UNKNOWN'
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    exchange,
    status,
    confidence: item.status === 'COMPLETED' ? 'FINAL' : 'LIVE',
    initialAccounts: item.initial_account_count,
    currentRound: item.current_round,
    totalRounds: item.total_rounds,
    campaignNet: 0,
    fees: 0,
    cycles: 0,
    settled: 0,
    rounds: item.rounds.map(round => ({
      id: round.id,
      index: round.round_number,
      memberCount: round.expected_member_count,
      netPnl: 0,
      phase: ['LOCKED', 'READY'].includes(round.status) ? 'PREPARING' : round.status === 'STARTING' ? 'STARTING' : round.status === 'RUNNING' ? 'RUNNING' : round.status === 'COMPLETED' ? 'SETTLED' : round.status === 'ERROR' ? 'ERROR' : 'UNKNOWN',
      leaderConfirmed: round.leader_member_id !== null,
      setupVersion: round.setup_version,
      canStart: round.can_start,
      startBlockers: round.start_blockers,
      runtimeClaimed: ['STARTING', 'RUNNING', 'PAUSING'].includes(round.status),
      members: round.members.map(member => ({
        id: member.id,
        apiId: member.api_account_id,
        apiLabel: member.api_label,
        relation: member.relation,
        result: member.result,
        pnl: 0,
        trades: 0,
        isLeader: member.id === round.leader_member_id
      }))
    }))
  }
}

function PnlText({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        'font-semibold tabular-nums tracking-tight',
        value > 0 && 'text-emerald-600 dark:text-emerald-400',
        value < 0 && 'text-red-600 dark:text-red-400',
        className
      )}
    >
      {formatPnl(value)}
    </span>
  )
}

function decimalParts(value: string) {
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
  return {
    sign: zero ? 0 : negative ? -1 : 1,
    text: `${negative && !zero ? '-' : ''}${zero ? '0' : roundedInteger}.${roundedFraction}`
  }
}

function DecimalPnlText({ value, className }: { value: string; className?: string }) {
  const decimal = decimalParts(value)
  return (
    <span
      className={cn(
        'font-semibold tabular-nums tracking-tight',
        decimal.sign > 0 && 'text-emerald-600 dark:text-emerald-400',
        decimal.sign < 0 && 'text-red-600 dark:text-red-400',
        className
      )}
    >
      {decimal.sign > 0 ? '+' : ''}{decimal.text} U
    </span>
  )
}

function MemberRoundPnlText({
  demoMode,
  demoPnl,
  economics,
  className
}: {
  demoMode: boolean
  demoPnl: number
  economics?: IncubatorMemberEconomics
  className?: string
}) {
  if (demoMode) return <PnlText value={demoPnl} className={className} />
  if (economics) return <DecimalPnlText value={economics.totals.realized_pnl} className={className} />
  return <span className={cn('text-muted-foreground tabular-nums', className)}>-</span>
}

function compareRelationNet(left: string | undefined, right: string | undefined) {
  const leftValue = Number(left ?? '0')
  const rightValue = Number(right ?? '0')
  if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) return 0
  return leftValue - rightValue
}

function economicsStatusLabel(status: IncubatorCampaignEconomics['settlement']['data_status']) {
  if (status === 'FINAL') return '最终数据'
  if (status === 'FAILED') return '结算异常'
  return '暂定数据'
}

const CARD_HERO_HEADER =
  "border-0 bg-blue-600 bg-[url('https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/download/image-09.png')] bg-cover bg-center text-white"

function exchangeLogoSrc(exchange: string) {
  return `/exchanges/${exchange.toLowerCase()}.png`
}

function ExchangeLogo({ exchange, className }: { exchange: string; className?: string }) {
  return (
    <img
      src={exchangeLogoSrc(exchange)}
      alt={exchange}
      className={cn('size-4 object-contain', className)}
      onError={event => {
        ;(event.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}

function shortOpenedAt(value: string) {
  if (!value) return '-'
  const match = value.match(/(\d{2})-(\d{2})\s+(\d{2}:\d{2}:\d{2})/)
  return match ? `${match[1]}-${match[2]} ${match[3]}` : value
}

function toTradeTimeline(
  events: IncubatorTradeEvent[],
  inspectingLeader: boolean,
  apiLabel: string
): TradeTimelineItem[] {
  const items: TradeTimelineItem[] = []

  for (const event of events) {
    if (inspectingLeader && event.leader) {
      items.push({
        id: `leader:${event.leader.id}`,
        eventAt: event.leader.occurred_at,
        action: event.leader.action.toLowerCase() as TradeTimelineItem['action'],
        side: event.leader.side.toLowerCase() as TradeTimelineItem['side'],
        posSide: event.leader.position_side.toLowerCase() as TradeTimelineItem['posSide'],
        symbol: event.leader.symbol,
        quantity: event.leader.quantity,
        apiLabel
      })
    }
    if (!inspectingLeader) {
      for (const record of event.followers) {
        items.push({
          id: `follower:${record.id}`,
          eventAt: record.occurred_at ?? event.occurred_at,
          action: record.action.toLowerCase() as TradeTimelineItem['action'],
          side: record.side.toLowerCase() as TradeTimelineItem['side'],
          posSide: record.position_side.toLowerCase() as TradeTimelineItem['posSide'],
          symbol: record.symbol,
          quantity: record.quantity,
          apiLabel,
          error: record.exchange_error?.msg ? record.exchange_error : null,
          failed: record.status === 'FAILED_TERMINAL'
        })
      }
    }
  }

  return items
}

function PositionCard({
  position
}: {
  position: OpenPosition | ClosedPosition
}) {
  const long = position.side === 'LONG'
  const closedAt = 'closedAt' in position ? position.closedAt : undefined

  return (
    <div className='border-border/60 rounded-md border bg-card px-2 py-1.5'>
      <div className='flex min-w-0 flex-wrap items-center gap-1'>
        <span
          className={cn(
            'flex size-3.5 shrink-0 items-center justify-center rounded-[2px] text-[8px] font-bold text-white',
            long ? 'bg-emerald-500' : 'bg-rose-500'
          )}
        >
          {long ? '多' : '空'}
        </span>
        <span className='truncate text-[11px] font-semibold'>{position.symbol}</span>
        <span className='bg-muted text-muted-foreground rounded px-1 py-px text-[9px]'>
          {position.marginMode}
        </span>
        {position.leverage > 0 && (
          <span className='bg-muted text-muted-foreground rounded px-1 py-px text-[9px]'>
            {position.leverage}x
          </span>
        )}
      </div>

      <div className='mt-1.5 grid grid-cols-2 gap-1'>
        <div>
          <p className='text-muted-foreground text-[9px]'>盈亏</p>
          <p
            className={cn(
              'text-[11px] font-semibold tabular-nums leading-tight',
              position.pnlUsdt > 0 && 'text-emerald-600 dark:text-emerald-400',
              position.pnlUsdt < 0 && 'text-red-600 dark:text-red-400'
            )}
          >
            {formatPnlUsdt(position.pnlUsdt)}
          </p>
        </div>
        <div className='text-right'>
          <p className='text-muted-foreground text-[9px]'>收益率</p>
          <p
            className={cn(
              'text-[11px] font-semibold tabular-nums leading-tight',
              position.roiPct != null && position.roiPct > 0 && 'text-emerald-600 dark:text-emerald-400',
              position.roiPct != null && position.roiPct < 0 && 'text-red-600 dark:text-red-400'
            )}
          >
            {position.roiPct == null ? '-' : formatRoi(position.roiPct)}
          </p>
        </div>
      </div>

      <div className={cn('mt-1.5 grid gap-1', closedAt ? 'grid-cols-3' : 'grid-cols-2')}>
        <div>
          <p className='text-muted-foreground text-[9px]'>数量</p>
          <p className='truncate text-[10px] font-medium tabular-nums leading-tight'>
            {position.qty.toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
            {position.qtyAsset}
          </p>
        </div>
        <div className={closedAt ? 'text-center' : 'text-right'}>
          <p className='text-muted-foreground text-[9px]'>开仓价</p>
          <p className='truncate text-[10px] font-medium tabular-nums leading-tight'>
            {position.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>
        </div>
        {closedAt && (
          <div className='text-right'>
            <p className='text-muted-foreground text-[9px]'>平仓价</p>
            <p className='truncate text-[10px] font-medium tabular-nums leading-tight'>
              {'exitPrice' in position && position.exitPrice != null
                ? position.exitPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })
                : '-'}
            </p>
          </div>
        )}
      </div>

      <div className={cn('text-muted-foreground mt-1 text-[9px] tabular-nums', closedAt && 'space-y-0.5')}>
        <p>开仓 {shortOpenedAt(position.openedAt)}</p>
        {closedAt && <p>平仓 {shortOpenedAt(closedAt)}</p>}
      </div>
    </div>
  )
}

function PulseDot({
  className,
  color = 'emerald'
}: {
  className?: string
  color?: 'emerald' | 'primary' | 'amber'
}) {
  const tone =
    color === 'primary'
      ? { ping: 'bg-primary/70', core: 'bg-primary' }
      : color === 'amber'
        ? { ping: 'bg-amber-400/70', core: 'bg-amber-500' }
        : { ping: 'bg-emerald-400/70', core: 'bg-emerald-500' }

  return (
    <span className={cn('relative inline-flex size-2 shrink-0', className)}>
      <span className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-75', tone.ping)} />
      <span className={cn('relative inline-flex size-2 rounded-full', tone.core)} />
    </span>
  )
}

function MemberCard({
  member,
  selected,
  draggable,
  detailsAvailable,
  economics,
  economicsUnavailableLabel,
  onSelect,
  onDragStart
}: {
  member: RoundMember
  selected: boolean
  draggable: boolean
  detailsAvailable: boolean
  economics?: IncubatorMemberEconomics
  economicsUnavailableLabel?: string
  onSelect: () => void
  onDragStart: (event: DragEvent<HTMLButtonElement>) => void
}) {
  const balance = detailsAvailable ? memberBalance(member) : 0
  const lowBalance = detailsAvailable && isLowBalance(balance)

  return (
    <button
      type='button'
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onSelect}
      className={cn(
        'group border-border/40 bg-background hover:bg-muted/40 flex w-full items-center justify-between gap-3 rounded-md border border-l-2 border-l-transparent px-3 py-2.5 text-left transition-colors',
        selected && 'border-primary/35 border-l-primary bg-primary/[0.04] hover:bg-primary/[0.06]',
        member.isLeader && !selected && 'border-l-amber-500/80',
        lowBalance && !selected && 'border-amber-500/35',
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
    >
      <div className='flex min-w-0 items-center gap-2'>
        {draggable && (
          <GripVertical className='text-muted-foreground/70 group-hover:text-muted-foreground size-3.5 shrink-0' />
        )}
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <span className='text-sm font-medium'>{member.apiLabel}</span>
            {member.isLeader && (
              <span className='text-amber-700 dark:text-amber-400 inline-flex items-center gap-0.5 text-[10px] font-medium'>
                <Crown className='size-3' />
                领单
              </span>
            )}
            <span className='text-muted-foreground text-[10px]'>{resultLabel(member.result)}</span>
            {lowBalance && (
              <span className='rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300'>
                余额偏低
              </span>
            )}
          </div>
          <p className='text-muted-foreground mt-0.5 text-[11px]'>
            {detailsAvailable ? (
              <>
                {member.trades} 笔 · 可用{' '}
                <span
                  className={cn(
                    'tabular-nums',
                    lowBalance ? 'font-medium text-amber-700 dark:text-amber-300' : 'text-foreground/80'
                  )}
                >
                  {balance.toLocaleString(undefined, { maximumFractionDigits: 1 })} U
                </span>
              </>
            ) : economics ? (
              <>{economics.totals.trade_count} 笔 · 结算 {economics.settlement.settled} / {economics.settlement.total}</>
            ) : (economicsUnavailableLabel ?? '收益数据加载中')}
          </p>
        </div>
      </div>
      <div className='shrink-0 text-right'>
        <p className='text-muted-foreground text-[10px]'>本轮</p>
        {detailsAvailable ? (
          <PnlText value={member.pnl} className='text-sm' />
        ) : economics ? (
          <DecimalPnlText value={economics.totals.realized_pnl} className='text-sm' />
        ) : (
          <span className='text-muted-foreground text-xs'>{economicsUnavailableLabel ?? '加载中'}</span>
        )}
      </div>
    </button>
  )
}

export default function IncubatorBoardPage() {
  const [demoMode, setDemoMode] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeCampaignId, setActiveCampaignId] = useState('')
  const [idleApis, setIdleApis] = useState<ReturnType<typeof cloneDemoBoardData>['idleApis']>([])
  const campaign = useMemo(
    () => campaigns.find(item => item.id === activeCampaignId) ?? campaigns[0] ?? null,
    [campaigns, activeCampaignId]
  )
  const [roundIndex, setRoundIndex] = useState(campaign?.currentRound ?? 1)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    campaign?.rounds[campaign.currentRound - 1]?.members.find(m => m.isLeader)?.id ??
      campaign?.rounds[campaign.currentRound - 1]?.members[0]?.id ??
      null
  )
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [inspectorTab, setInspectorTab] = useState('copies')
  const [realTradeTimeline, setRealTradeTimeline] = useState<TradeTimelineItem[]>([])
  const [economicsByCampaign, setEconomicsByCampaign] = useState<Record<string, IncubatorCampaignEconomics>>({})
  const [economicsLoading, setEconomicsLoading] = useState(false)
  const [economicsUnsupported, setEconomicsUnsupported] = useState(false)
  const [economicsError, setEconomicsError] = useState<string | null>(null)
  const [tradeTimelineLoading, setTradeTimelineLoading] = useState(false)
  const [tradeTimelineMoreLoading, setTradeTimelineMoreLoading] = useState(false)
  const [tradeTimelineError, setTradeTimelineError] = useState<string | null>(null)
  const [tradeTimelineCursor, setTradeTimelineCursor] = useState<string | null>(null)
  const [realOpenPositions, setRealOpenPositions] = useState<OpenPosition[]>([])
  const [leaderPositionLoading, setLeaderPositionLoading] = useState(false)
  const [leaderPositionError, setLeaderPositionError] = useState<string | null>(null)
  const [realMemberPositions, setRealMemberPositions] = useState<OpenPosition[]>([])
  const [memberPositionLoading, setMemberPositionLoading] = useState(false)
  const [memberPositionError, setMemberPositionError] = useState<string | null>(null)
  const [realClosedPositions, setRealClosedPositions] = useState<ClosedPosition[]>([])
  const [historyPositionLoading, setHistoryPositionLoading] = useState(false)
  const [historyPositionError, setHistoryPositionError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createBusy, setCreateBusy] = useState(false)
  const [setupBusy, setSetupBusy] = useState(false)
  const [startBusy, setStartBusy] = useState(false)
  const [terminateBusy, setTerminateBusy] = useState(false)
  const [endProjectBusy, setEndProjectBusy] = useState(false)
  const [leaderOpen, setLeaderOpen] = useState(false)
  const [terminateOpen, setTerminateOpen] = useState(false)
  const [endProjectOpen, setEndProjectOpen] = useState(false)
  const [promoteResult, setPromoteResult] = useState<PromoteResultSummary | null>(null)
  const [promoteDetailOpen, setPromoteDetailOpen] = useState(false)

  const [createName, setCreateName] = useState('')
  const [createExchange, setCreateExchange] = useState<ExchangeId>('Binance')
  const [selectedApiIds, setSelectedApiIds] = useState<string[]>([])
  const [pendingLeaderId, setPendingLeaderId] = useState<string | null>(null)
  const [pendingWinner, setPendingWinner] = useState<MemberRelation>('SAME')
  const [dragOverRelation, setDragOverRelation] = useState<MemberRelation | null>(null)
  const realLoadGeneration = useRef(0)
  const tradeTimelineGeneration = useRef(0)
  const economicsGeneration = useRef(0)
  const leaderPositionGeneration = useRef(0)
  const memberPositionGeneration = useRef(0)
  const historyPositionGeneration = useRef(0)
  const economicsCache = useRef<Record<string, IncubatorCampaignEconomics>>({})
  const startRequestIds = useRef<Record<string, string>>({})
  const savedSetupSignatures = useRef<Record<string, string>>({})

  const rememberPersistedCampaigns = (items: Campaign[]) => {
    for (const item of items) {
      for (const round of item.rounds) {
        savedSetupSignatures.current[round.id] = roundSetupSignature(round)
      }
    }
  }

  const loadRealData = async () => {
    const generation = ++realLoadGeneration.current
    setCampaigns([])
    setIdleApis([])
    setActiveCampaignId('')
    setSelectedMemberId(null)
    let campaignItems: IncubatorCampaign[]
    let accountItems: Awaited<ReturnType<typeof listIncubatorApiAccounts>>
    try {
      ;[campaignItems, accountItems] = await Promise.all([
        listIncubatorCampaigns(),
        listIncubatorApiAccounts()
      ])
    } catch (error) {
      if (generation === realLoadGeneration.current && !readBoardDemoMode()) throw error
      return
    }
    if (generation !== realLoadGeneration.current || readBoardDemoMode()) return
    const nextCampaigns = campaignItems.map(fromApiCampaign)
    rememberPersistedCampaigns(nextCampaigns)
    setCampaigns(nextCampaigns)
    setIdleApis(
      accountItems
        .filter(account => account.status === 'ACTIVE')
        .map(account => ({
          id: account.id,
          label: account.label,
          exchange: account.exchange === 'BINANCE' ? 'Binance' : account.exchange === 'GATE' ? 'Gate' : 'OKX',
          busy: false,
          balanceUsdt: account.available_balance == null ? undefined : Number(account.available_balance)
        }))
    )
    const first = nextCampaigns[0]
    if (first) {
      setActiveCampaignId(first.id)
      setRoundIndex(first.currentRound)
      const current = first.rounds.find(round => round.index === first.currentRound)
      setSelectedMemberId(current?.members.find(member => member.isLeader)?.id ?? current?.members[0]?.id ?? null)
    }
  }

  const loadDemoBoard = () => {
    realLoadGeneration.current += 1
    const demo = cloneDemoBoardData()
    setCampaigns(demo.campaigns)
    setIdleApis(demo.idleApis)
    const first = demo.campaigns[0]
    if (first) {
      setActiveCampaignId(first.id)
      setRoundIndex(first.currentRound)
      const current = first.rounds.find(round => round.index === first.currentRound)
      setSelectedMemberId(
        current?.members.find(m => m.isLeader)?.id ?? current?.members[0]?.id ?? null
      )
    } else {
      setActiveCampaignId('')
      setSelectedMemberId(null)
    }
  }

  useEffect(() => {
    const enabled = readBoardDemoMode()
    setDemoMode(enabled)
    setPromoteResult(null)
    if (enabled) {
      loadDemoBoard()
      return
    }
    void loadRealData().catch(error =>
      toast.error(error instanceof Error ? error.message : '项目数据加载失败')
    )
  }, [])

  const applyDemoMode = (enabled: boolean) => {
    if (!confirmLeaveSetupDraft()) return
    writeBoardDemoMode(enabled)
    setDemoMode(enabled)
    setPromoteResult(null)
    setPromoteDetailOpen(false)
    setInspectorOpen(false)
    setCreateOpen(false)
    setLeaderOpen(false)
    setTerminateOpen(false)
    setEndProjectOpen(false)
    setSelectedApiIds([])

    if (enabled) {
      loadDemoBoard()
      return
    }

    void loadRealData().catch(error =>
      toast.error(error instanceof Error ? error.message : '项目数据加载失败')
    )
  }

  useEffect(() => {
    if (campaigns.length === 0) {
      setActiveCampaignId('')
      return
    }
    if (!campaigns.some(item => item.id === activeCampaignId)) {
      setActiveCampaignId(campaigns[0].id)
    }
  }, [campaigns, activeCampaignId])

  const focusCampaign = (next: Campaign) => {
    setActiveCampaignId(next.id)
    setRoundIndex(next.currentRound)
    const current = next.rounds.find(round => round.index === next.currentRound)
    setSelectedMemberId(current?.members.find(m => m.isLeader)?.id ?? current?.members[0]?.id ?? null)
  }

  const viewingCurrent = Boolean(campaign && roundIndex === campaign.currentRound)
  const activeRound = useMemo(() => {
    if (!campaign) return null
    return campaign.rounds.find(round => round.index === roundIndex) ?? campaign.rounds[0]
  }, [campaign, roundIndex])

  const economics = campaign ? economicsByCampaign[campaign.id] : undefined
  const activeRoundEconomics = useMemo(
    () => economics?.rounds.find(round => round.round_id === activeRound?.id),
    [activeRound?.id, economics]
  )
  const memberEconomics = useMemo(
    () => new Map(activeRoundEconomics?.members.map(member => [member.round_member_id, member]) ?? []),
    [activeRoundEconomics]
  )
  const memberEconomicsByApiId = useMemo(
    () => new Map(activeRoundEconomics?.members.map(member => [member.api_id, member]) ?? []),
    [activeRoundEconomics]
  )

  useEffect(() => {
    if (demoMode) {
      economicsGeneration.current += 1
      economicsCache.current = {}
      setEconomicsByCampaign({})
      setEconomicsLoading(false)
      setEconomicsUnsupported(false)
      setEconomicsError(null)
      return
    }
    if (!campaign) {
      economicsGeneration.current += 1
      setEconomicsLoading(false)
      setEconomicsUnsupported(false)
      setEconomicsError(null)
      return
    }
    if (campaign.exchange !== 'OKX' && campaign.exchange !== 'Binance') {
      economicsGeneration.current += 1
      setEconomicsLoading(false)
      setEconomicsUnsupported(true)
      setEconomicsError(null)
      return
    }

    let cancelled = false
    let inFlight = false
    let timer: number | null = null
    const generation = ++economicsGeneration.current
    setEconomicsUnsupported(false)
    setEconomicsError(null)

    const refreshEconomics = async () => {
      if (inFlight) return
      inFlight = true
      if (!economicsCache.current[campaign.id]) setEconomicsLoading(true)
      try {
        const next = await getIncubatorCampaignEconomics(campaign.id)
        if (cancelled || generation !== economicsGeneration.current || readBoardDemoMode()) return
        economicsCache.current[campaign.id] = next
        setEconomicsByCampaign(previous => ({ ...previous, [campaign.id]: next }))
        setEconomicsError(null)
        if (next.status === 'COMPLETED' && timer !== null) {
          window.clearInterval(timer)
          timer = null
        }
      } catch (error) {
        if (!cancelled && generation === economicsGeneration.current) {
          setEconomicsError(error instanceof Error ? error.message : '收益数据加载失败')
        }
      } finally {
        if (!cancelled && generation === economicsGeneration.current) setEconomicsLoading(false)
        inFlight = false
      }
    }

    void refreshEconomics()
    timer = campaign.status === 'COMPLETED'
      ? null
      : window.setInterval(refreshEconomics, BOARD_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      if (timer !== null) window.clearInterval(timer)
    }
  }, [campaign?.exchange, campaign?.id, campaign?.status, demoMode])

  useEffect(() => {
    if (demoMode || activeRound?.phase !== 'STARTING') return

    let cancelled = false
    let inFlight = false
    const generation = realLoadGeneration.current

    const refreshStartingRound = async () => {
      if (inFlight) return
      inFlight = true
      try {
        const campaignItems = await listIncubatorCampaigns()
        if (
          cancelled ||
          generation !== realLoadGeneration.current ||
          readBoardDemoMode()
        ) {
          return
        }
        const nextCampaigns = campaignItems.map(fromApiCampaign)
        rememberPersistedCampaigns(nextCampaigns)
        setCampaigns(nextCampaigns)
      } catch {
        // Keep the last known STARTING state and retry. User-triggered actions still surface errors.
      } finally {
        inFlight = false
      }
    }

    void refreshStartingRound()
    const timer = window.setInterval(refreshStartingRound, BOARD_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [activeRound?.id, activeRound?.phase, demoMode])

  const leaderMemberId = activeRound?.members.find(member => member.isLeader)?.id ?? null
  const leaderRoundId = activeRound?.id ?? null

  useEffect(() => {
    if (demoMode || !inspectorOpen || !leaderRoundId || !leaderMemberId) {
      leaderPositionGeneration.current += 1
      setLeaderPositionLoading(false)
      if (demoMode || !leaderRoundId || !leaderMemberId) {
        setRealOpenPositions([])
        setLeaderPositionError(null)
      }
      return
    }

    let cancelled = false
    const generation = ++leaderPositionGeneration.current
    const roundId = leaderRoundId
    setLeaderPositionError(null)

    const refreshLeaderPosition = async (silent = false) => {
      if (!silent && !peekCachedMemberPositions(roundId, leaderMemberId)) setLeaderPositionLoading(true)
      try {
        if (silent) invalidateMemberPositions(roundId, leaderMemberId)
        const snapshot = await loadCachedMemberPositions(roundId, leaderMemberId)
        if (cancelled || generation !== leaderPositionGeneration.current || readBoardDemoMode()) return
        const next = positionView(snapshot)
        setRealOpenPositions(next.positions)
        setLeaderPositionError(next.error)
      } catch (error) {
        if (!cancelled && generation === leaderPositionGeneration.current) {
          setRealOpenPositions([])
          setLeaderPositionError(error instanceof Error ? error.message : '领单仓位加载失败')
        }
      } finally {
        if (!cancelled && generation === leaderPositionGeneration.current) setLeaderPositionLoading(false)
      }
    }

    void refreshLeaderPosition(false)
    const timer = window.setInterval(() => {
      void refreshLeaderPosition(true)
    }, BOARD_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [demoMode, inspectorOpen, leaderMemberId, leaderRoundId])

  const selectedMember = useMemo(() => {
    if (!activeRound) return null
    return activeRound.members.find(member => member.id === selectedMemberId) ?? activeRound.members[0]
  }, [activeRound, selectedMemberId])

  useEffect(() => {
    if (demoMode || !inspectorOpen || !activeRound || !selectedMember) {
      memberPositionGeneration.current += 1
      setRealMemberPositions([])
      setMemberPositionLoading(false)
      setMemberPositionError(null)
      return
    }

    let cancelled = false
    const generation = ++memberPositionGeneration.current
    const roundId = activeRound.id
    const memberId = selectedMember.id
    setMemberPositionError(null)

    const refreshMemberPosition = async (silent = false) => {
      if (!silent && !peekCachedMemberPositions(roundId, memberId)) setMemberPositionLoading(true)
      try {
        if (silent) invalidateMemberPositions(roundId, memberId)
        const snapshot = await loadCachedMemberPositions(roundId, memberId)
        if (cancelled || generation !== memberPositionGeneration.current || readBoardDemoMode()) return
        const next = positionView(snapshot)
        setRealMemberPositions(next.positions)
        setMemberPositionError(next.error)
      } catch (error) {
        if (!cancelled && generation === memberPositionGeneration.current) {
          setRealMemberPositions([])
          setMemberPositionError(error instanceof Error ? error.message : '持仓查询失败')
        }
      } finally {
        if (!cancelled && generation === memberPositionGeneration.current) setMemberPositionLoading(false)
      }
    }

    void refreshMemberPosition(false)
    const timer = window.setInterval(() => {
      void refreshMemberPosition(true)
    }, BOARD_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [activeRound?.id, demoMode, inspectorOpen, selectedMember?.id])

  useEffect(() => {
    if (demoMode || !inspectorOpen || inspectorTab !== 'history' || !activeRound || !selectedMember) {
      historyPositionGeneration.current += 1
      setRealClosedPositions([])
      setHistoryPositionLoading(false)
      setHistoryPositionError(null)
      return
    }

    let cancelled = false
    const generation = ++historyPositionGeneration.current
    const roundId = activeRound.id
    const memberId = selectedMember.id
    setHistoryPositionError(null)

    const refreshHistory = async () => {
      if (!peekCachedMemberPositionHistory(roundId, memberId)) setHistoryPositionLoading(true)
      try {
        const snapshot = await loadCachedMemberPositionHistory(roundId, memberId)
        if (cancelled || generation !== historyPositionGeneration.current || readBoardDemoMode()) return
        const next = historyView(snapshot)
        setRealClosedPositions(next.positions)
        setHistoryPositionError(next.error)
      } catch (error) {
        if (!cancelled && generation === historyPositionGeneration.current) {
          setRealClosedPositions([])
          setHistoryPositionError(error instanceof Error ? error.message : '历史持仓加载失败')
        }
      } finally {
        if (!cancelled && generation === historyPositionGeneration.current) setHistoryPositionLoading(false)
      }
    }

    void refreshHistory()
    return () => {
      cancelled = true
    }
  }, [activeRound?.id, demoMode, inspectorOpen, inspectorTab, selectedMember?.id])

  const setupDirty = Boolean(
    !demoMode &&
      activeRound &&
      savedSetupSignatures.current[activeRound.id] !== undefined &&
      savedSetupSignatures.current[activeRound.id] !== roundSetupSignature(activeRound)
  )

  function confirmLeaveSetupDraft(): boolean {
    return !setupDirty || window.confirm('当前配置尚未保存，确定离开当前视图吗？')
  }

  useEffect(() => {
    if (!setupDirty) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const handleLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      const target = event.target
      const anchor = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const nextUrl = new URL(anchor.href, window.location.href)
      const currentUrl = new URL(window.location.href)
      if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) return
      if (!window.confirm('当前配置尚未保存，确定离开当前视图吗？')) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleLinkClick, true)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [setupDirty])

  const sameMembers = activeRound?.members.filter(member => member.relation === 'SAME') ?? []
  const inverseMembers = activeRound?.members.filter(member => member.relation === 'INVERSE') ?? []
  const sameNet = sameMembers.reduce((sum, member) => sum + member.pnl, 0)
  const inverseNet = inverseMembers.reduce((sum, member) => sum + member.pnl, 0)
  const leader = activeRound?.members.find(member => member.isLeader)
  const campaignUnsettled = demoMode
    ? campaign ? Math.max(campaign.cycles - campaign.settled, 0) : 0
    : economics ? economics.settlement.pending + economics.settlement.failed : 0
  const roundUnsettled = demoMode
    ? campaignUnsettled
    : activeRoundEconomics
      ? activeRoundEconomics.settlement.pending + activeRoundEconomics.settlement.failed
      : 0
  const economicsFallback = economicsLoading
    ? '加载中'
    : economicsUnsupported
      ? '暂不支持'
      : economicsError
        ? '加载失败'
        : '暂无数据'
  const openPositions = demoMode
    ? getLeaderOpenPositions(leader?.apiId, activeRound?.phase)
    : realOpenPositions
  const leaderPositionFallback = leaderPositionEmptyText({
    hasLeader: Boolean(leader),
    loading: leaderPositionLoading,
    error: leaderPositionError
  })
  const memberOpenPositions = demoMode
    ? getLeaderOpenPositions(selectedMember?.apiId, activeRound?.phase)
    : realMemberPositions
  const memberPositionFallback = memberPositionLoading
    ? '持仓加载中…'
    : memberPositionError || '暂无当前持仓'
  const endProjectBlockReason = (() => {
    if (!campaign || campaign.status === 'COMPLETED') return null
    if (activeRound?.phase === 'RUNNING') {
      return '本轮运行中，请先终止本轮并完成平仓结算'
    }
    if (openPositions.length > 0) {
      return '领单仍有未平仓位，请先全部平仓'
    }
    const settlementPending = demoMode ? campaignUnsettled : economics?.settlement.pending ?? 0
    if (settlementPending > 0) {
      return '仍有结算任务在拉取，请稍后再结束项目'
    }
    return null
  })()
  const canEndProject = !endProjectBlockReason
  const closedPositions = demoMode ? getLeaderClosedPositions(leader?.apiId) : realClosedPositions
  const inspectingLeader = Boolean(
    selectedMember && leader && (selectedMember.isLeader || selectedMember.id === leader.id)
  )
  const recordsTabLabel = inspectingLeader ? '领单记录' : '跟单记录'
  useEffect(() => {
    const generation = ++tradeTimelineGeneration.current
    setTradeTimelineMoreLoading(false)
    const campaignId = campaign?.id
    const roundId = activeRound?.id
    const apiId = selectedMember?.apiId
    const apiLabel = selectedMember?.apiLabel
    if (demoMode || !inspectorOpen || !campaignId || !roundId || !apiId || !apiLabel) {
      setRealTradeTimeline([])
      setTradeTimelineLoading(false)
      setTradeTimelineError(null)
      setTradeTimelineCursor(null)
      return
    }
    let cancelled = false
    setTradeTimelineLoading(true)
    setTradeTimelineError(null)
    void listIncubatorTradeRecords({
      campaignId,
      roundId,
      apiId,
      limit: 100
    })
      .then(page => {
        if (cancelled || generation !== tradeTimelineGeneration.current) return
        setRealTradeTimeline(toTradeTimeline(page.items, inspectingLeader, apiLabel))
        setTradeTimelineCursor(page.next_cursor)
      })
      .catch(error => {
        if (!cancelled && generation === tradeTimelineGeneration.current) {
          setRealTradeTimeline([])
          setTradeTimelineCursor(null)
          setTradeTimelineError(error instanceof Error ? error.message : '交易记录加载失败')
        }
      })
      .finally(() => {
        if (!cancelled && generation === tradeTimelineGeneration.current) setTradeTimelineLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeRound?.id, campaign?.id, demoMode, inspectingLeader, inspectorOpen, selectedMember?.apiId, selectedMember?.apiLabel])

  const loadMoreTradeTimeline = async () => {
    if (!campaign || !activeRound || !selectedMember || !tradeTimelineCursor || tradeTimelineMoreLoading) return
    const generation = tradeTimelineGeneration.current
    setTradeTimelineMoreLoading(true)
    setTradeTimelineError(null)
    try {
      const page = await listIncubatorTradeRecords({
        campaignId: campaign.id,
        roundId: activeRound.id,
        apiId: selectedMember.apiId,
        limit: 100,
        cursor: tradeTimelineCursor
      })
      if (generation !== tradeTimelineGeneration.current) return
      setRealTradeTimeline(previous => [
        ...previous,
        ...toTradeTimeline(page.items, inspectingLeader, selectedMember.apiLabel)
      ])
      setTradeTimelineCursor(page.next_cursor)
    } catch (error) {
      if (generation === tradeTimelineGeneration.current) {
        setTradeTimelineError(error instanceof Error ? error.message : '交易记录加载失败')
      }
    } finally {
      if (generation === tradeTimelineGeneration.current) setTradeTimelineMoreLoading(false)
    }
  }
  const tradeTimeline = demoMode
    ? getMemberTradeTimeline({
        apiId: selectedMember?.apiId,
        apiLabel: selectedMember?.apiLabel,
        isLeader: inspectingLeader
      })
    : realTradeTimeline

  const isPreparing =
    Boolean(campaign && activeRound) &&
    viewingCurrent &&
    activeRound!.phase === 'PREPARING' &&
    ['READY', 'RUNNING'].includes(campaign!.status)
  const isRunning =
    Boolean(campaign && activeRound) &&
    viewingCurrent &&
    activeRound!.phase === 'RUNNING' &&
    campaign!.status === 'RUNNING'
  const terminateBlockReason = !isRunning
    ? null
    : openPositions.length > 0
      ? '领单仍有未平仓位，请先全部平仓'
      : !demoMode && leaderPositionLoading
        ? '正在确认领单仓位'
        : !demoMode && leaderPositionError
          ? '暂时无法确认领单仓位，请稍后重试'
          : null
  const groupsBalanced = sameMembers.length === inverseMembers.length && sameMembers.length > 0
  const leaderIsSame = Boolean(leader?.isLeader && leader.relation === 'SAME')
  const canStart = Boolean(activeRound) && isPreparing && activeRound!.leaderConfirmed && leaderIsSame && groupsBalanced &&
    (demoMode || activeRound!.canStart === true) && !setupDirty && !setupBusy && !startBusy

  const busyApiIds = useMemo(() => {
    const ids = new Set<string>()
    for (const item of campaigns) {
      if (item.status === 'COMPLETED') continue
      for (const round of item.rounds) {
        for (const member of round.members) {
          if (member.result === 'ELIMINATED') continue
          ids.add(member.apiId)
        }
      }
    }
    return ids
  }, [campaigns])

  const availableApis = useMemo(
    () => getAvailableApis(idleApis, createExchange, busyApiIds),
    [idleApis, createExchange, busyApiIds]
  )
  useEffect(() => {
    const availableIds = new Set(availableApis.map(api => api.id))
    setSelectedApiIds(previous => {
      const next = previous.filter(id => availableIds.has(id))
      return next.length === previous.length ? previous : next
    })
  }, [availableApis])

  const selectionCountValid = isPowerOfTwo(selectedApiIds.length)
  const selectionValid = selectionCountValid && createName.trim().length > 0
  const validSelectionCounts = useMemo(
    () => validApiSelectionCounts(availableApis.length),
    [availableApis.length]
  )
  const selectionCountHint = useMemo(() => {
    if (availableApis.length < 2) return '当前可用不足 2 个'
    return `请选 ${validSelectionCounts.join(' 或 ')} 个`
  }, [availableApis.length, validSelectionCounts])
  const availableMinBalance = useMemo(() => {
    const balances = availableApis
      .map(api => api.balanceUsdt ?? (demoMode ? mockBalanceForApi(api.id) : null))
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
    if (balances.length === 0) return null
    return Math.min(...balances)
  }, [availableApis, demoMode])
  const availableBalancePending =
    !demoMode && availableApis.length > 0 && availableApis.some(api => api.balanceUsdt === undefined)
  const formatUsdt = (value: number) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 1 })

  const openInspector = (member: RoundMember) => {
    setSelectedMemberId(member.id)
    setInspectorTab('copies')
    setInspectorOpen(true)
  }

  const upsertCampaign = (next: Campaign) => {
    setCampaigns(prev => {
      const exists = prev.some(item => item.id === next.id)
      const mapped = exists ? prev.map(item => (item.id === next.id ? next : item)) : [...prev, next]
      if (next.status === 'COMPLETED') {
        return mapped.filter(item => item.id !== next.id)
      }
      return mapped
    })
  }

  const syncRoundView = (next: Campaign, remainingHint?: Campaign[]) => {
    upsertCampaign(next)
    if (next.status === 'COMPLETED') {
      if (remainingHint?.[0]) {
        focusCampaign(remainingHint[0])
      } else {
        setActiveCampaignId('')
        setSelectedMemberId(null)
      }
    } else {
      focusCampaign(next)
    }
  }

  const patchActiveCampaign = (updater: (prev: Campaign) => Campaign) => {
    if (!campaign) return
    const next = updater(campaign)
    upsertCampaign(next)
    if (next.currentRound !== campaign.currentRound) {
      focusCampaign(next)
    }
  }

  const handleCreateCampaign = async () => {
    if (!selectionValid) return
    if (!demoMode && !confirmLeaveSetupDraft()) return
    const submittedInDemo = demoMode
    const submittedGeneration = realLoadGeneration.current
    const apis = availableApis
      .filter(api => selectedApiIds.includes(api.id))
      .map(api => ({ id: api.id, label: api.label }))
    if (apis.length !== selectedApiIds.length) return

    setCreateBusy(true)
    try {
      const next = submittedInDemo
        ? createCampaignFromApis({ name: createName, exchange: createExchange, apis })
        : fromApiCampaign(await createIncubatorCampaign(createName.trim(), selectedApiIds))

      if (!submittedInDemo) rememberPersistedCampaigns([next])

      if (!submittedInDemo && submittedGeneration !== realLoadGeneration.current) {
        if (!readBoardDemoMode()) {
          void loadRealData().catch(error =>
            toast.error(error instanceof Error ? error.message : '项目数据加载失败')
          )
        }
        return
      }

      if (submittedInDemo) {
        setIdleApis(prev =>
          prev.map(api => (selectedApiIds.includes(api.id) ? { ...api, busy: true } : api))
        )
      }
      upsertCampaign(next)
      focusCampaign(next)
      setCreateOpen(false)
      setCreateName('')
      setSelectedApiIds([])
      toast.success('项目创建成功')
    } catch (error) {
      if (!submittedInDemo && submittedGeneration !== realLoadGeneration.current) return
      toast.error(error instanceof Error ? error.message : '项目创建失败')
    } finally {
      setCreateBusy(false)
    }
  }

  const handleConfirmLeader = async () => {
    if (!pendingLeaderId || !campaign) return
    if (!isPreparing) {
      toast.error('当前项目或轮次状态不允许修改配置')
      return
    }
    const candidate = sameMembers.find(member => member.id === pendingLeaderId)
    if (!candidate) {
      setPendingLeaderId(sameMembers[0]?.id ?? null)
      return
    }
    if (demoMode) {
      patchActiveCampaign(prev => ({
        ...prev,
        rounds: prev.rounds.map(round =>
          round.index === prev.currentRound
            ? { ...round, leaderConfirmed: true, members: confirmLeader(round.members, pendingLeaderId) }
            : round
        )
      }))
      setLeaderOpen(false)
      return
    }
    if (!activeRound?.setupVersion || !groupsBalanced) {
      toast.error('请先保持 SAME / INVERSE 人数一致')
      return
    }
    const submittedGeneration = realLoadGeneration.current
    setSetupBusy(true)
    try {
      const updated = fromApiCampaign(await updateIncubatorRoundSetup({
        roundId: activeRound.id,
        setupVersion: activeRound.setupVersion,
        leaderMemberId: pendingLeaderId,
        assignments: activeRound.members.map(member => ({ member_id: member.id, relation: member.relation }))
      }))
      if (submittedGeneration !== realLoadGeneration.current) {
        if (!readBoardDemoMode()) {
          void loadRealData().catch(loadError =>
            toast.error(loadError instanceof Error ? loadError.message : '项目数据加载失败')
          )
        }
        return
      }
      if (readBoardDemoMode()) return
      rememberPersistedCampaigns([updated])
      upsertCampaign(updated)
      focusCampaign(updated)
      setLeaderOpen(false)
      toast.success('本轮配置已保存')
    } catch (error) {
      if (submittedGeneration !== realLoadGeneration.current || readBoardDemoMode()) return
      const message = error instanceof Error ? error.message : '本轮配置保存失败'
      toast.error(`${message}；未保存草稿已保留`)
    } finally {
      setSetupBusy(false)
    }
  }

  const handleStartRound = async () => {
    if (!canStart || !campaign || !activeRound) return
    if (demoMode) {
      patchActiveCampaign(prev => startRound(prev))
      return
    }
    if (!activeRound.setupVersion) return
    const submittedGeneration = realLoadGeneration.current
    const requestId = startRequestIds.current[activeRound.id] ?? crypto.randomUUID()
    startRequestIds.current[activeRound.id] = requestId
    setStartBusy(true)
    try {
      const updated = fromApiCampaign(await startIncubatorRound({
        roundId: activeRound.id,
        setupVersion: activeRound.setupVersion,
        requestId
      }))
      if (submittedGeneration !== realLoadGeneration.current) {
        if (!readBoardDemoMode()) {
          void loadRealData().catch(loadError =>
            toast.error(loadError instanceof Error ? loadError.message : '项目数据加载失败')
          )
        }
        return
      }
      if (readBoardDemoMode()) return
      delete startRequestIds.current[activeRound.id]
      rememberPersistedCampaigns([updated])
      upsertCampaign(updated)
      focusCampaign(updated)
      toast.success('本轮正在启动，等待运行模块确认')
    } catch (error) {
      if (submittedGeneration !== realLoadGeneration.current || readBoardDemoMode()) return
      toast.error(error instanceof Error ? error.message : '本轮启动失败')
      void loadRealData().catch(loadError =>
        toast.error(loadError instanceof Error ? loadError.message : '项目数据加载失败')
      )
    } finally {
      setStartBusy(false)
    }
  }

  const handleTerminate = async () => {
    if (!campaign || !activeRound || terminateBlockReason) return
    const eliminatedApiIds = new Set(
      activeRound.members.filter(member => member.relation !== pendingWinner).map(member => member.apiId)
    )
    if (!demoMode) {
      setTerminateBusy(true)
      try {
        const requestId = crypto.randomUUID()
        const updated = fromApiCampaign(
          await terminateIncubatorRound({
            roundId: activeRound.id,
            requestId,
            winnerRelation: pendingWinner
          })
        )
        const summary = buildPromoteResultSummary(
          activeRound.members,
          activeRound.index,
          pendingWinner,
          null,
          false
        )
        const projectCompleted = updated.status === 'COMPLETED'
        setPromoteResult({
          ...summary,
          nextRoundIndex: projectCompleted ? null : updated.currentRound,
          projectCompleted
        })
        setPromoteDetailOpen(true)
        rememberPersistedCampaigns([updated])
        if (projectCompleted) {
          const freed = getCampaignApiIds(campaign)
          setIdleApis(prev => prev.map(api => (freed.has(api.id) ? { ...api, busy: false } : api)))
          const remaining = campaigns.filter(item => item.id !== campaign.id)
          syncRoundView(updated, remaining)
        } else {
          setIdleApis(prev =>
            prev.map(api => (eliminatedApiIds.has(api.id) ? { ...api, busy: false } : api))
          )
          syncRoundView(updated)
        }
        setTerminateOpen(false)
        toast.success(projectCompleted ? '项目已结束' : '本轮已终止，晋级账号进入下一轮')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '终止本轮失败')
      } finally {
        setTerminateBusy(false)
      }
      return
    }
    const summary = buildPromoteResultSummary(
      activeRound.members,
      activeRound.index,
      pendingWinner,
      null,
      false
    )
    const next = terminateRound(campaign, pendingWinner)
    const remaining = campaigns.filter(item => item.id !== campaign.id)
    const projectCompleted = next.status === 'COMPLETED'
    setPromoteResult({
      ...summary,
      nextRoundIndex: projectCompleted ? null : next.currentRound,
      projectCompleted
    })
    setPromoteDetailOpen(true)

    if (projectCompleted) {
      const freed = getCampaignApiIds(campaign)
      setIdleApis(prev => prev.map(api => (freed.has(api.id) ? { ...api, busy: false } : api)))
      syncRoundView(next, remaining)
    } else {
      setIdleApis(prev =>
        prev.map(api => (eliminatedApiIds.has(api.id) ? { ...api, busy: false } : api))
      )
      syncRoundView(next)
    }
    setTerminateOpen(false)
  }

  const handleEndProject = async () => {
    if (!campaign || !canEndProject) return
    if (!demoMode) {
      setEndProjectBusy(true)
      try {
        const updated = fromApiCampaign(await endIncubatorCampaign(campaign.id))
        const freed = getCampaignApiIds(campaign)
        const remaining = campaigns.filter(item => item.id !== campaign.id)
        setIdleApis(prev => prev.map(api => (freed.has(api.id) ? { ...api, busy: false } : api)))
        syncRoundView(updated, remaining)
        setEndProjectOpen(false)
        toast.success('项目已结束')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '结束项目失败')
      } finally {
        setEndProjectBusy(false)
      }
      return
    }
    const freed = getCampaignApiIds(campaign)
    const remaining = campaigns.filter(item => item.id !== campaign.id)
    const next = endCampaignEarly(campaign)
    setIdleApis(prev => prev.map(api => (freed.has(api.id) ? { ...api, busy: false } : api)))
    syncRoundView(next, remaining)
    setEndProjectOpen(false)
  }

  const handleDrop = (relation: MemberRelation, memberId: string) => {
    setDragOverRelation(null)
    if (!isPreparing || !memberId || !campaign) return

    setSelectedMemberId(memberId)
    patchActiveCampaign(prev => ({
      ...prev,
      rounds: prev.rounds.map(round => {
        if (round.index !== prev.currentRound) return round
        let members = updateMemberRelation(round.members, memberId, relation)
        if (relation === 'INVERSE') {
          members = members.map(member =>
            member.id === memberId ? { ...member, isLeader: false } : member
          )
        }
        const leaderOk = members.some(m => m.isLeader && m.relation === 'SAME')
        return {
          ...round,
          members,
          leaderConfirmed: round.leaderConfirmed && leaderOk
        }
      })
    }))
  }

  const onMemberDragStart = (member: RoundMember) => (event: DragEvent<HTMLButtonElement>) => {
    if (!isPreparing) {
      event.preventDefault()
      return
    }
    setSelectedMemberId(member.id)
    event.dataTransfer.setData('text/plain', member.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const toggleApi = (apiId: string) => {
    setSelectedApiIds(prev =>
      prev.includes(apiId) ? prev.filter(id => id !== apiId) : [...prev, apiId]
    )
  }

  const allAvailableSelected =
    availableApis.length > 0 && availableApis.every(api => selectedApiIds.includes(api.id))

  const toggleSelectAllApis = () => {
    if (allAvailableSelected) {
      setSelectedApiIds([])
      return
    }
    setSelectedApiIds(availableApis.map(api => api.id))
  }

  const handleSwitchCampaign = (id: string) => {
    const next = campaigns.find(item => item.id === id)
    if (!next || next.id === campaign?.id || !confirmLeaveSetupDraft()) return
    focusCampaign(next)
  }

  return (
    <div className='relative flex h-full flex-col overflow-hidden'>
      {isPreparing && (
        <div
          key={`prep-glow-${activeCampaignId}-${activeRound?.id ?? 'none'}`}
          className='incubator-preparing-frame__glow'
          role='status'
          aria-label='本轮未开始，交易所下单不会跟单'
        />
      )}
      {isRunning && (
        <div
          key={`run-glow-${activeCampaignId}-${activeRound?.id ?? 'none'}`}
          className='incubator-running-frame__glow'
          role='status'
          aria-label='本轮进行中，跟单已生效'
        />
      )}
      <div className='bg-background text-foreground flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 lg:p-6'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl font-bold tracking-tight'>项目看板</h1>
          <p className='text-muted-foreground text-sm'>
            {demoMode
              ? isPreparing
                ? '模拟演示 · 准备中：可拖拽调整分组，确认领单后开始本轮'
                : '模拟演示 · 点击账号打开详情'
              : isPreparing
                ? '真实模式 · 本轮未开始，确认领单后开始本轮才会跟单'
                : '真实模式 · 数据来自 Incubator 服务'}
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <button
            type='button'
            role='switch'
            aria-checked={demoMode}
            onClick={() => applyDemoMode(!demoMode)}
            className={cn(
              'inline-flex h-8 items-center gap-2 rounded-full border px-2.5 text-xs transition-colors',
              demoMode
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/70 text-muted-foreground hover:text-foreground'
            )}
          >
            <span
              className={cn(
                'relative h-4 w-7 rounded-full transition-colors',
                demoMode ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'bg-background absolute top-0.5 size-3 rounded-full transition-transform',
                  demoMode ? 'left-3.5' : 'left-0.5'
                )}
              />
            </span>
            模拟演示
          </button>
          <Button
            type='button'
            size='sm'
            onClick={() => setCreateOpen(true)}
          >
            <Plus className='size-4' />
            创建项目
          </Button>
        </div>
      </div>

      <div className='flex flex-wrap gap-2'>
        {campaigns.length === 0 ? (
          <p className='text-muted-foreground text-xs'>暂无项目</p>
        ) : (
          campaigns.map(item => {
            const currentRound =
              item.rounds.find(round => round.index === item.currentRound) ?? item.rounds[0]
            const activeCount = currentRound?.memberCount ?? 0
            const selected = item.id === activeCampaignId

            return (
              <button
                key={item.id}
                type='button'
                onClick={() => handleSwitchCampaign(item.id)}
                className={cn(
                  'min-w-36 rounded-lg border px-3 py-2.5 text-left shadow-sm transition-all',
                  'bg-gradient-to-b from-background to-muted/20 dark:to-muted/10',
                  selected
                    ? 'border-primary bg-primary/5 shadow-none dark:bg-primary/10'
                    : 'border-border/50 hover:border-primary/20 hover:shadow-md dark:hover:bg-muted/20'
                )}
              >
                <div className='flex items-center gap-2'>
                  <ExchangeLogo exchange={item.exchange} className='size-4 shrink-0' />
                  <p className='truncate text-sm font-medium'>{item.name}</p>
                  {item.status === 'RUNNING' && (
                    <PulseDot
                      className='ml-auto'
                      color={
                        item.rounds.find(r => r.index === item.currentRound)?.phase === 'PREPARING'
                          ? 'amber'
                          : 'emerald'
                      }
                    />
                  )}
                </div>
                <p className={cn('mt-1 text-[11px]', selected ? 'text-primary' : 'text-muted-foreground')}>
                  第 {item.currentRound} 轮 · {activeCount} 个号进行中
                </p>
              </button>
            )
          })
        )}
      </div>

      {!campaign || !activeRound ? (
        <Card className='border-dashed py-16 shadow-none'>
          <CardContent className='flex flex-col items-center justify-center text-center'>
            <p className='text-sm font-medium'>
              {demoMode ? '暂无进行中的项目' : '真实模式暂无数据'}
            </p>
            <p className='text-muted-foreground mt-1 text-xs'>
              {demoMode
                ? '创建项目后可在此并行切换查看'
                : '选择可用 API 创建第一个养号项目。'}
            </p>
            <Button type='button' size='sm' className='mt-4' onClick={() => setCreateOpen(true)}>
              <Plus className='size-4' />
              创建项目
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {!demoMode && economicsUnsupported && (
            <div className='rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-700 dark:text-red-300'>
              当前阶段仅支持 OKX 和币安项目收益
            </div>
          )}
          {!demoMode && !economicsUnsupported && (economicsError || economics?.settlement.data_status === 'FAILED') && (
            <div className='rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-700 dark:text-red-300'>
              {economicsError ?? `有 ${economics?.settlement.failed ?? 0} 个结算任务失败，当前收益不是最终结果`}
            </div>
          )}
          <div className='grid gap-4 xl:grid-cols-2'>
            <Card className='gap-0 overflow-hidden py-0 shadow-sm'>
              <CardHeader className={cn(CARD_HERO_HEADER, 'gap-3 rounded-none px-4 py-4')}>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex min-w-0 items-start gap-3'>
                    <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/95 shadow-sm'>
                      <ExchangeLogo exchange={campaign.exchange} className='size-5' />
                    </div>
                    <div className='min-w-0'>
                      <CardDescription className='text-[11px] text-white/70'>
                        项目 {campaign.code}
                      </CardDescription>
                      <CardTitle className='mt-1 text-base text-white'>{campaign.name}</CardTitle>
                      <p className='mt-1 text-xs text-white/75'>
                        初始 {campaign.initialAccounts} 账号 · 第 {campaign.currentRound} /{' '}
                        {campaign.totalRounds} 轮 · {campaign.exchange}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant='secondary'
                    className='inline-flex shrink-0 items-center gap-1.5 border-0 bg-white/95 text-[10px] text-emerald-700 hover:bg-white'
                  >
                    {campaign.status === 'RUNNING' && <PulseDot />}
                    {campaignStatusLabel(campaign.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='dark:bg-muted/15 grid grid-cols-2 border-t border-border/60 p-0 sm:grid-cols-4'>
                <Metric label='项目净收益' value={demoMode ? <PnlText value={campaign.campaignNet} /> : economics ? <DecimalPnlText value={economics.totals.realized_pnl} /> : economicsFallback} tinted />
                <Metric label='手续费' value={demoMode ? <PnlText value={campaign.fees} /> : economics ? <DecimalPnlText value={economics.totals.fee} /> : economicsFallback} tinted />
                <Metric
                  label='交易周期'
                  value={demoMode ? <span className='tabular-nums'>{campaign.cycles}</span> : economics ? <span className='tabular-nums'>{economics.totals.trade_cycle_count}</span> : economicsFallback}
                  tinted
                />
                <Metric
                  label='结算进度'
                  value={demoMode ? (
                    <span className='tabular-nums'>
                      {campaign.settled} / {campaign.cycles}
                    </span>
                  ) : economics ? (
                    <span className='tabular-nums'>{economics.settlement.settled} / {economics.settlement.total}</span>
                  ) : economicsFallback}
                  tinted
                />
              </CardContent>
              {campaign.status !== 'COMPLETED' && (
                <CardFooter className='border-border/60 border-t px-4 py-3'>
                  <div className='flex w-full items-center justify-between gap-3'>
                    <p className='text-muted-foreground min-w-0 flex-1 text-[11px] leading-snug'>
                      {endProjectBlockReason ?? '提前结束将释放账号，本轮数据保留在历史'}
                    </p>
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      disabled={!canEndProject || endProjectBusy}
                      className='h-8 shrink-0 gap-1.5 border-red-500/40 bg-red-500/10 px-3 text-xs text-red-600 hover:bg-red-500/15 hover:text-red-700 disabled:border-red-500/20 disabled:bg-red-500/5 disabled:text-red-400 dark:text-red-400 dark:hover:text-red-300'
                      onClick={() => setEndProjectOpen(true)}
                    >
                      <CircleStop className='size-3.5' />
                      {endProjectBusy ? '结束中…' : '结束项目'}
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>

            <Card className='gap-0 overflow-hidden py-0 shadow-sm'>
              <CardHeader className={cn(CARD_HERO_HEADER, 'gap-3 rounded-none px-4 py-4')}>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex min-w-0 items-start gap-3'>
                    <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/95 text-blue-700 shadow-sm'>
                      <Waypoints className='size-4' />
                    </div>
                    <div className='min-w-0'>
                      <CardDescription className='text-[11px] text-white/70'>本轮运行态</CardDescription>
                      <CardTitle className='mt-1 text-base text-white'>
                        第 {activeRound.index} 轮
                      </CardTitle>
                      <p className='mt-1 text-xs text-white/75'>
                        领单 {leader?.apiLabel ?? '未确认'}
                        {economicsUnsupported ? '' : ` · ${demoMode
                          ? confidenceLabel(campaign.confidence)
                          : economics
                            ? economicsStatusLabel(economics.settlement.data_status)
                            : economicsFallback}`}
                        {setupDirty ? ' · 配置未保存' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant='secondary'
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1.5 border-0 bg-white/95 text-[10px] hover:bg-white',
                      activeRound.phase === 'RUNNING' && 'text-emerald-700',
                      activeRound.phase === 'PREPARING' && 'text-amber-700',
                      activeRound.phase === 'SETTLED' && 'text-slate-600',
                      activeRound.phase === 'ERROR' && 'text-red-700'
                    )}
                  >
                    {activeRound.phase === 'RUNNING' && <PulseDot />}
                    {activeRound.phase === 'PREPARING' && <PulseDot color='amber' />}
                    {roundPhaseLabel(activeRound.phase)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='dark:bg-muted/15 grid grid-cols-2 border-t border-border/60 p-0 sm:grid-cols-4'>
                <Metric label='本轮净收益' value={demoMode ? <PnlText value={activeRound.netPnl} /> : activeRoundEconomics ? <DecimalPnlText value={activeRoundEconomics.totals.realized_pnl} /> : economicsFallback} tinted />
                <Metric label='同向净收益' value={demoMode ? <PnlText value={sameNet} /> : activeRoundEconomics ? <DecimalPnlText value={activeRoundEconomics.same_totals.realized_pnl} /> : economicsFallback} tinted />
                <Metric label='反向净收益' value={demoMode ? <PnlText value={inverseNet} /> : activeRoundEconomics ? <DecimalPnlText value={activeRoundEconomics.inverse_totals.realized_pnl} /> : economicsFallback} tinted />
                <Metric
                  label='未结算'
                  value={<span className='tabular-nums'>{roundUnsettled}</span>}
                  tinted
                />
              </CardContent>
              <CardFooter className='border-border/60 border-t px-4 py-3'>
                {viewingCurrent && campaign.status !== 'COMPLETED' ? (
                  <div className='flex w-full flex-col gap-2'>
                  <div className='grid w-full grid-cols-3 gap-2'>
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      className='h-8 w-full px-3 text-xs'
                      disabled={!isPreparing}
                      onClick={() => {
                        const sameLeader =
                          leader?.relation === 'SAME'
                            ? leader.id
                            : sameMembers.find(m => m.isLeader)?.id
                        setPendingLeaderId(sameLeader ?? sameMembers[0]?.id ?? null)
                        setLeaderOpen(true)
                      }}
                    >
                      {activeRound.leaderConfirmed ? '重新选择领单' : '选择领单'}
                    </Button>
                    <Button
                      type='button'
                      size='sm'
                      className='h-8 w-full gap-1.5 px-3 text-xs'
                      disabled={!canStart}
                      onClick={handleStartRound}
                    >
                      <Play className='size-3.5' />
                      {startBusy
                        ? '启动中…'
                        : activeRound.phase === 'STARTING'
                          ? '等待运行确认'
                          : setupDirty
                            ? '请先保存配置'
                            : '开始本轮'}
                    </Button>
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      className='h-8 w-full gap-1.5 border-red-500/40 bg-red-500/10 px-3 text-xs text-red-600 hover:bg-red-500/15 hover:text-red-700 disabled:border-red-500/20 disabled:bg-red-500/5 disabled:text-red-400 dark:text-red-400 dark:hover:text-red-300'
                      disabled={!isRunning || terminateBusy || Boolean(terminateBlockReason)}
                      onClick={() => {
                        const preferred =
                          demoMode
                            ? sameNet >= inverseNet
                              ? 'SAME'
                              : 'INVERSE'
                            : compareRelationNet(
                                  activeRoundEconomics?.same_totals.realized_pnl,
                                  activeRoundEconomics?.inverse_totals.realized_pnl
                                ) >= 0
                              ? 'SAME'
                              : 'INVERSE'
                        setPendingWinner(preferred)
                        setTerminateOpen(true)
                      }}
                    >
                      <Square className='size-3.5' />
                      {terminateBusy ? '终止中…' : '终止本轮'}
                    </Button>
                  </div>
                  {terminateBlockReason && (
                    <p className='text-muted-foreground text-[11px] leading-snug'>{terminateBlockReason}</p>
                  )}
                  </div>
                ) : (
                  <>
                    {campaign.status === 'COMPLETED' && (
                      <p className='text-muted-foreground text-xs'>项目已结束</p>
                    )}
                    {!viewingCurrent && (
                      <p className='text-muted-foreground text-xs'>
                        正在查看历史轮次，切换到当前轮可操作
                      </p>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          </div>

          {promoteResult && (
            <div className='border-border/60 bg-primary/5 flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0 space-y-0.5'>
                <p className='text-sm font-medium'>
                  第 {promoteResult.roundIndex} 轮已结束 · 晋级 {promoteResult.promoted.length} · 淘汰{' '}
                  {promoteResult.eliminated.length}
                </p>
                <p className='text-muted-foreground text-[11px]'>
                  晋级{relationLabel(promoteResult.winner)}
                  {promoteResult.projectCompleted
                    ? ' · 项目已完结，账号已释放回空闲池'
                    : ` · 已自动均分并进入第 ${promoteResult.nextRoundIndex} 轮准备；淘汰账号已释放`}
                </p>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='h-8 text-xs'
                  onClick={() => setPromoteDetailOpen(true)}
                >
                  查看名单
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant='ghost'
                  className='h-8 px-2'
                  onClick={() => setPromoteResult(null)}
                  aria-label='关闭晋级结果'
                >
                  <X className='size-3.5' />
                </Button>
              </div>
            </div>
          )}

          <Card className='gap-0 overflow-hidden py-0 shadow-sm'>
            <CardHeader className='border-border/60 flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0'>
                  <CardTitle className='flex items-center gap-1.5 text-sm'>
                    <Waypoints className='text-muted-foreground size-3.5 shrink-0' strokeWidth={1.75} />
                    晋级路径
                  </CardTitle>
                  <CardDescription className='mt-1 text-xs'>
                    {isPreparing
                      ? '已按晋级结果自动均分同向 / 反向；可拖拽微调，两边数量须一致。'
                      : '账号位置固定；同向 / 反向是每轮分配，不永久挂在 API 上。'}
                  </CardDescription>
                </div>
              <div className='flex max-w-full items-center gap-2'>
                <div className='flex max-w-full flex-nowrap gap-1.5 overflow-x-auto pb-0.5'>
                {campaign.rounds.map(round => (
                  <button
                    key={round.id}
                    type='button'
                    onClick={() => {
                      if (round.index === roundIndex || !confirmLeaveSetupDraft()) return
                      setRoundIndex(round.index)
                      setSelectedMemberId(
                        round.members.find(m => m.isLeader)?.id ?? round.members[0]?.id ?? null
                      )
                    }}
                    className={cn(
                      'shrink-0 rounded-full border px-2.5 py-1 text-xs transition-colors',
                      round.index === roundIndex
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border/70 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    )}
                  >
                    第 {round.index} 轮 · {round.memberCount}
                  </button>
                ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className='grid gap-0 p-0 md:grid-cols-2 md:divide-x md:divide-border/60'>
              {(['SAME', 'INVERSE'] as MemberRelation[]).map(relation => {
                const members = relation === 'SAME' ? sameMembers : inverseMembers
                const isSame = relation === 'SAME'
                return (
                  <div
                    key={relation}
                    className={cn(
                      'space-y-2.5 p-4 transition-colors',
                      isSame ? 'bg-sky-500/[0.03] dark:bg-sky-400/[0.04]' : 'bg-rose-500/[0.03] dark:bg-rose-400/[0.04]',
                      !isSame && 'border-t border-border/60 md:border-t-0',
                      dragOverRelation === relation &&
                        isPreparing &&
                        (isSame ? 'bg-sky-500/[0.08]' : 'bg-rose-500/[0.08]')
                    )}
                    onDragOver={event => {
                      if (!isPreparing) return
                      event.preventDefault()
                      setDragOverRelation(relation)
                    }}
                    onDragLeave={() => setDragOverRelation(null)}
                    onDrop={event => {
                      event.preventDefault()
                      const id = event.dataTransfer.getData('text/plain')
                      if (id) handleDrop(relation, id)
                    }}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-between rounded-md px-2.5 py-1.5',
                        isSame
                          ? 'bg-sky-500/10 dark:bg-sky-400/10'
                          : 'bg-rose-500/10 dark:bg-rose-400/10'
                      )}
                    >
                      <h3
                        className={cn(
                          'text-[11px] font-semibold tracking-wide',
                          isSame
                            ? 'text-sky-800 dark:text-sky-200'
                            : 'text-rose-800 dark:text-rose-200'
                        )}
                      >
                        {relationLabel(relation)}
                      </h3>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums',
                          isSame
                            ? 'bg-sky-500/15 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200'
                            : 'bg-rose-500/15 text-rose-800 dark:bg-rose-400/15 dark:text-rose-200'
                        )}
                      >
                        {members.length} 账号
                      </span>
                    </div>
                    <div className='max-h-80 min-h-24 space-y-1.5 overflow-y-auto pr-1'>
                      {members.map(member => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          selected={selectedMember?.id === member.id}
                          draggable={isPreparing}
                          detailsAvailable={demoMode}
                          economics={memberEconomics.get(member.id)}
                          economicsUnavailableLabel={economicsUnsupported ? '暂不支持' : undefined}
                          onSelect={() => openInspector(member)}
                          onDragStart={onMemberDragStart(member)}
                        />
                      ))}
                      {members.length === 0 && (
                        <p
                          className={cn(
                            'rounded-md border border-dashed px-3 py-6 text-center text-xs',
                            isSame
                              ? 'border-sky-500/30 bg-sky-500/5 text-sky-800/70 dark:text-sky-200/70'
                              : 'border-rose-500/30 bg-rose-500/5 text-rose-800/70 dark:text-rose-200/70'
                          )}
                        >
                          拖拽账号到此处
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className='gap-0 overflow-hidden py-0 shadow-sm'>
            <CardHeader className='border-border/60 gap-1 border-b px-4 py-4'>
              <CardTitle className='flex items-center gap-1.5 text-sm'>
                <ChartColumn className='text-muted-foreground size-3.5 shrink-0' strokeWidth={1.75} />
                轮次收益
              </CardTitle>
              <CardDescription className='text-xs'>淘汰账号仍永久计入项目累计损益。</CardDescription>
            </CardHeader>
            <CardContent className='dark:bg-muted/15 grid max-h-48 gap-0 overflow-y-auto border-t border-border/60 p-0 sm:grid-cols-2 xl:grid-cols-4'>
              {campaign.rounds.map(round => (
                <div key={round.id} className='bg-card dark:bg-transparent px-4 py-3'>
                  <p className='text-muted-foreground/90 text-[11px] font-medium'>
                    第 {round.index} 轮 · {round.memberCount} 账号
                  </p>
                  {demoMode ? (
                    <PnlText value={round.netPnl} className='mt-1.5 block text-sm' />
                  ) : economics?.rounds.find(item => item.round_id === round.id) ? (
                    <DecimalPnlText
                      value={economics.rounds.find(item => item.round_id === round.id)!.totals.realized_pnl}
                      className='mt-1.5 block text-sm'
                    />
                  ) : (
                    <span className='text-muted-foreground mt-1.5 block text-sm'>{economicsFallback}</span>
                  )}
                </div>
              ))}
              <div className='bg-primary/5 dark:bg-primary/10 px-4 py-3'>
                <p className='text-primary text-[11px] font-medium'>项目合计</p>
                {demoMode ? (
                  <PnlText value={campaign.campaignNet} className='mt-1.5 block text-sm' />
                ) : economics ? (
                  <DecimalPnlText value={economics.totals.realized_pnl} className='mt-1.5 block text-sm' />
                ) : (
                  <span className='text-muted-foreground mt-1.5 block text-sm'>{economicsFallback}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
        <SheetContent className='flex w-full flex-col gap-0 p-0 sm:max-w-lg'>
          <Tabs
            value={inspectorTab}
            onValueChange={setInspectorTab}
            className='flex min-h-0 flex-1 flex-col gap-0'
          >
            <SheetHeader className='space-y-1 border-b-0 px-4 pb-0 pt-4 text-left'>
              <SheetTitle className='text-sm font-semibold tracking-tight'>
                {selectedMember?.apiLabel ?? '账号详情'}
              </SheetTitle>
              <SheetDescription className='text-[11px]'>
                {selectedMember
                  ? `${inspectingLeader ? '领单' : '跟单'} · ${relationLabel(selectedMember.relation)}`
                  : '-'}{' '}
                · 第 {activeRound?.index ?? '-'} 轮 ·{' '}
                {selectedMember ? resultLabel(selectedMember.result) : '-'}
              </SheetDescription>

              <div className='mt-3 space-y-1.5'>
                <p className='text-muted-foreground text-[10px] font-medium'>
                  领单仓位
                  {leader ? ` · ${leader.apiLabel}` : ' · 未确认'}
                </p>
                <div className='max-h-48 overflow-y-auto pr-0.5'>
                  {!leader ? (
                    <p className='text-muted-foreground rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-[11px]'>
                      尚未确认领单，暂无仓位
                    </p>
                  ) : openPositions.length === 0 ? (
                    <p className='text-muted-foreground rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-[11px]'>
                      {demoMode ? '领单暂无当前持仓' : leaderPositionFallback}
                    </p>
                  ) : (
                    <div className='grid grid-cols-2 gap-1.5'>
                      {openPositions.map(position => (
                        <PositionCard key={position.id} position={position} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <TabsList
                variant='line'
                className='mt-3 h-8 w-full justify-start gap-4 rounded-none border-b border-border/60 bg-transparent p-0'
              >
                <TabsTrigger
                  value='copies'
                  className='h-8 flex-none rounded-none px-0 text-xs font-medium data-[state=active]:shadow-none'
                >
                  {recordsTabLabel}
                </TabsTrigger>
                <TabsTrigger
                  value='positions'
                  className='h-8 flex-none rounded-none px-0 text-xs font-medium data-[state=active]:shadow-none'
                >
                  当前持仓
                </TabsTrigger>
                <TabsTrigger
                  value='history'
                  className='h-8 flex-none rounded-none px-0 text-xs font-medium data-[state=active]:shadow-none'
                >
                  历史持仓
                </TabsTrigger>
              </TabsList>
            </SheetHeader>

            <TabsContent value='copies' className='mt-0 flex-1 overflow-y-auto px-4 py-3'>
              {tradeTimelineLoading ? (
                <p className='text-muted-foreground py-6 text-center text-[11px]'>交易记录加载中…</p>
              ) : tradeTimelineError ? (
                <p className='text-red-600/90 dark:text-red-400/90 py-6 text-center text-[11px]'>{tradeTimelineError}</p>
              ) : (
                <TradeTimeline
                  items={tradeTimeline}
                  emptyText={inspectingLeader ? '暂无领单记录' : '暂无跟单记录'}
                />
              )}
              {!demoMode && !tradeTimelineLoading && !tradeTimelineError && tradeTimelineCursor && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='mt-2 w-full'
                  disabled={tradeTimelineMoreLoading}
                  onClick={() => void loadMoreTradeTimeline()}
                >
                  {tradeTimelineMoreLoading ? '加载中…' : '加载更多'}
                </Button>
              )}
            </TabsContent>
            <TabsContent value='positions' className='mt-0 flex-1 overflow-y-auto px-4 py-3'>
              {memberOpenPositions.length === 0 ? (
                <p className='text-muted-foreground text-center text-[11px]'>
                  {demoMode ? '暂无当前持仓' : memberPositionFallback}
                </p>
              ) : (
                <div className='grid grid-cols-2 gap-1.5'>
                  {memberOpenPositions.map(position => (
                    <PositionCard key={position.id} position={position} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value='history' className='mt-0 flex-1 overflow-y-auto px-4 py-3'>
              {demoMode && !leader ? (
                <p className='text-muted-foreground text-center text-[11px]'>尚未确认领单，暂无历史仓位</p>
              ) : !demoMode && historyPositionLoading && closedPositions.length === 0 ? (
                <p className='text-muted-foreground text-center text-[11px]'>历史持仓加载中…</p>
              ) : !demoMode && historyPositionError ? (
                <p className='text-red-600/90 dark:text-red-400/90 text-center text-[11px]'>{historyPositionError}</p>
              ) : closedPositions.length === 0 ? (
                <p className='text-muted-foreground text-center text-[11px]'>暂无历史持仓</p>
              ) : (
                <div className='grid grid-cols-2 gap-1.5'>
                  {closedPositions.map(position => (
                    <PositionCard key={position.id} position={position} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>创建项目</DialogTitle>
            <DialogDescription>
              {availableApis.length < 2
                ? '请先准备至少 2 个同交易所空闲 API。'
                : `当前有 ${availableApis.length} 个可用 API，${selectionCountHint}。${
                    availableMinBalance !== null
                      ? `可用最低 ${formatUsdt(availableMinBalance)} U。`
                      : availableBalancePending
                        ? '可用余额待接入。'
                        : ''
                  }`}
            </DialogDescription>
          </DialogHeader>

          <div className='rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-800 dark:text-amber-200'>
            所有账户默认 1:1 跟单，请确保每个账号里都有充足的资金，杠杆保持一致，以免养号效果不达预期，扩大养号磨损。为避免滑点扩大亏损，请选择主流币，并且在波动低的时段进行交易。
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='campaign-name'>项目名称</Label>
              <Input
                id='campaign-name'
                value={createName}
                onChange={event => setCreateName(event.target.value)}
                placeholder='例如 BTC 养号项目'
              />
            </div>

            <div className='space-y-2'>
              <Label>交易所</Label>
              <Select
                value={createExchange}
                onValueChange={value => {
                  setCreateExchange(value as ExchangeId)
                  setSelectedApiIds([])
                }}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='选择交易所' />
                </SelectTrigger>
                <SelectContent>
                  {EXCHANGES.map(exchange => (
                    <SelectItem key={exchange} value={exchange}>
                      <span className='inline-flex items-center gap-2'>
                        <ExchangeLogo exchange={exchange} />
                        {exchange}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <Label>可用 API</Label>
                  <button
                    type='button'
                    disabled={availableApis.length === 0}
                    onClick={toggleSelectAllApis}
                    className='text-primary disabled:text-muted-foreground text-xs font-medium disabled:cursor-not-allowed'
                  >
                    {allAvailableSelected ? '取消全选' : '全选'}
                  </button>
                </div>
                <span
                  className={cn(
                    'text-xs',
                    selectionCountValid ? 'text-muted-foreground' : 'text-destructive'
                  )}
                >
                  已选 {selectedApiIds.length}
                </span>
              </div>
              <div className='border-border/60 max-h-56 space-y-1 overflow-y-auto rounded-md border p-2'>
                {availableApis.length === 0 ? (
                  <p className='text-muted-foreground px-2 py-6 text-center text-xs'>
                    该交易所暂无可用 API
                  </p>
                ) : (
                  availableApis.map(api => {
                    const checked = selectedApiIds.includes(api.id)
                    const balance = api.balanceUsdt ?? (demoMode ? mockBalanceForApi(api.id) : null)
                    const low = balance !== null && isLowBalance(balance)
                    return (
                      <label
                        key={api.id}
                        className={cn(
                          'hover:bg-muted/40 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2',
                          low && 'bg-amber-500/5'
                        )}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleApi(api.id)} />
                        <div className='flex min-w-0 flex-1 items-center gap-2'>
                          <span className='truncate text-sm'>{api.label}</span>
                          <span
                            className={cn(
                              'shrink-0 text-[11px] tabular-nums',
                              low
                                ? 'font-medium text-amber-700 dark:text-amber-300'
                                : 'text-muted-foreground'
                            )}
                          >
                            {balance === null
                              ? '可用余额待接入'
                              : `可用 ${balance.toLocaleString(undefined, { maximumFractionDigits: 1 })} U`}
                          </span>
                          {low && (
                            <span className='shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300'>
                              余额偏低
                            </span>
                          )}
                        </div>
                        <ExchangeLogo exchange={api.exchange} className='size-4 shrink-0' />
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setCreateOpen(false)}>
              取消
            </Button>
            <Button type='button' disabled={!selectionValid || createBusy} onClick={handleCreateCampaign}>
              {createBusy ? '创建中…' : '创建并进入准备'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={leaderOpen} onOpenChange={setLeaderOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>选择领单 API</DialogTitle>
            <DialogDescription>仅可从同向账号中选择领单，确认后才能开始本轮。</DialogDescription>
          </DialogHeader>
          <div className='max-h-64 space-y-1 overflow-y-auto'>
            {sameMembers.length === 0 ? (
              <p className='text-muted-foreground px-1 py-6 text-center text-xs'>
                同向暂无账号，请先调整分组
              </p>
            ) : (
              sameMembers.map(member => (
                <button
                  key={member.id}
                  type='button'
                  onClick={() => setPendingLeaderId(member.id)}
                  className={cn(
                    'border-border/60 flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm',
                    pendingLeaderId === member.id && 'border-primary bg-primary/5'
                  )}
                >
                  <span>{member.apiLabel}</span>
                  {pendingLeaderId === member.id && <Crown className='text-primary size-3.5' />}
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setLeaderOpen(false)}>
              取消
            </Button>
            <Button
              type='button'
              disabled={!pendingLeaderId || sameMembers.length === 0 || setupBusy}
              onClick={handleConfirmLeader}
            >
              {setupBusy ? '保存中…' : '确认并保存配置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={terminateOpen} onOpenChange={setTerminateOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>终止本轮</DialogTitle>
            <DialogDescription>
              选择晋级分组后确认。晋级侧进入下一轮；淘汰侧释放回空闲 API。
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-2'>
              {(['SAME', 'INVERSE'] as MemberRelation[]).map(relation => (
                <button
                  key={relation}
                  type='button'
                  onClick={() => setPendingWinner(relation)}
                  className={cn(
                    'rounded-lg border px-3 py-3 text-left text-sm transition-colors',
                    pendingWinner === relation
                      ? 'border-primary bg-primary/5'
                      : 'border-border/60 hover:border-primary/20'
                  )}
                >
                  晋级{relationLabel(relation)}
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {(relation === 'SAME' ? sameMembers : inverseMembers).length} 账号
                  </p>
                </button>
              ))}
            </div>

            {(() => {
              const promoteMembers = pendingWinner === 'SAME' ? sameMembers : inverseMembers
              const eliminateMembers = pendingWinner === 'SAME' ? inverseMembers : sameMembers
              const isFinalRound = promoteMembers.length <= 1
              const nextRoundNo = (activeRound?.index ?? campaign?.currentRound ?? 1) + 1

              return (
                <div className='space-y-2'>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='rounded-md border border-sky-500/20 bg-sky-500/[0.04] p-2.5'>
                      <p className='text-[11px] font-medium text-sky-800 dark:text-sky-200'>
                        拟晋级 · {promoteMembers.length}
                      </p>
                      <p className='text-muted-foreground mt-0.5 text-[10px]'>
                        {isFinalRound
                          ? '将完成本项目（决赛）'
                          : `进入第 ${nextRoundNo} 轮准备`}
                      </p>
                      <ul className='mt-2 max-h-36 space-y-1 overflow-y-auto'>
                        {promoteMembers.map(member => (
                          <li
                            key={member.id}
                            className='text-foreground flex items-center justify-between gap-2 text-xs'
                          >
                            <span className='truncate'>{member.apiLabel}</span>
                            <MemberRoundPnlText
                              demoMode={demoMode}
                              demoPnl={member.pnl}
                              economics={memberEconomics.get(member.id)}
                              className='shrink-0 text-[11px]'
                            />
                          </li>
                        ))}
                        {promoteMembers.length === 0 && (
                          <li className='text-muted-foreground text-xs'>暂无账号</li>
                        )}
                      </ul>
                    </div>
                    <div className='rounded-md border border-rose-500/20 bg-rose-500/[0.04] p-2.5'>
                      <p className='text-[11px] font-medium text-rose-800 dark:text-rose-200'>
                        拟淘汰 · {eliminateMembers.length}
                      </p>
                      <p className='text-muted-foreground mt-0.5 text-[10px]'>释放回空闲 API</p>
                      <ul className='mt-2 max-h-36 space-y-1 overflow-y-auto'>
                        {eliminateMembers.map(member => (
                          <li
                            key={member.id}
                            className='text-foreground flex items-center justify-between gap-2 text-xs'
                          >
                            <span className='truncate'>{member.apiLabel}</span>
                            <MemberRoundPnlText
                              demoMode={demoMode}
                              demoPnl={member.pnl}
                              economics={memberEconomics.get(member.id)}
                              className='shrink-0 text-[11px]'
                            />
                          </li>
                        ))}
                        {eliminateMembers.length === 0 && (
                          <li className='text-muted-foreground text-xs'>暂无账号</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <p className='text-muted-foreground text-[11px] leading-relaxed'>
                    {isFinalRound
                      ? '晋级侧仅剩 1 个账号时，确认后项目结束，全部账号释放回空闲池。'
                      : `确认后：晋级 ${promoteMembers.length} 个进入第 ${nextRoundNo} 轮；淘汰 ${eliminateMembers.length} 个立即释放。`}
                  </p>
                </div>
              )
            })()}
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' disabled={terminateBusy} onClick={() => setTerminateOpen(false)}>
              取消
            </Button>
            <Button type='button' disabled={terminateBusy || Boolean(terminateBlockReason)} onClick={() => void handleTerminate()}>
              {terminateBusy ? '终止中…' : '确认终止'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={promoteDetailOpen && Boolean(promoteResult)}
        onOpenChange={open => {
          setPromoteDetailOpen(open)
          if (!open && promoteResult?.projectCompleted) {
            setPromoteResult(null)
          }
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              第 {promoteResult?.roundIndex ?? '-'} 轮晋级结果
            </DialogTitle>
            <DialogDescription>
              {promoteResult
                ? promoteResult.projectCompleted
                  ? '项目已完结。晋级侧决出最终结果，全部账号已释放回空闲池。'
                  : `晋级${relationLabel(promoteResult.winner)}已自动均分进入第 ${promoteResult.nextRoundIndex} 轮；淘汰账号已释放。`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {promoteResult && (
            <div className='grid grid-cols-2 gap-2'>
              <div className='rounded-md border border-sky-500/20 bg-sky-500/[0.04] p-2.5'>
                <p className='text-[11px] font-medium text-sky-800 dark:text-sky-200'>
                  晋级 · {promoteResult.promoted.length}
                </p>
                <p className='text-muted-foreground mt-0.5 text-[10px]'>
                  {promoteResult.projectCompleted
                    ? '项目完结'
                    : `进入第 ${promoteResult.nextRoundIndex} 轮`}
                </p>
                <ul className='mt-2 max-h-48 space-y-1 overflow-y-auto'>
                  {promoteResult.promoted.map(member => (
                    <li
                      key={member.apiId}
                      className='flex items-center justify-between gap-2 text-xs'
                    >
                      <span className='truncate'>{member.apiLabel}</span>
                      <MemberRoundPnlText
                        demoMode={demoMode}
                        demoPnl={member.pnl}
                        economics={memberEconomicsByApiId.get(member.apiId)}
                        className='shrink-0 text-[11px]'
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div className='rounded-md border border-rose-500/20 bg-rose-500/[0.04] p-2.5'>
                <p className='text-[11px] font-medium text-rose-800 dark:text-rose-200'>
                  淘汰 · {promoteResult.eliminated.length}
                </p>
                <p className='text-muted-foreground mt-0.5 text-[10px]'>释放回空闲 API</p>
                <ul className='mt-2 max-h-48 space-y-1 overflow-y-auto'>
                  {promoteResult.eliminated.map(member => (
                    <li
                      key={member.apiId}
                      className='flex items-center justify-between gap-2 text-xs'
                    >
                      <span className='truncate'>{member.apiLabel}</span>
                      <MemberRoundPnlText
                        demoMode={demoMode}
                        demoPnl={member.pnl}
                        economics={memberEconomicsByApiId.get(member.apiId)}
                        className='shrink-0 text-[11px]'
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type='button'
              onClick={() => {
                setPromoteDetailOpen(false)
                if (promoteResult?.projectCompleted) setPromoteResult(null)
              }}
            >
              知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={endProjectOpen} onOpenChange={setEndProjectOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>结束项目</DialogTitle>
            <DialogDescription>
              {endProjectBlockReason
                ? endProjectBlockReason
                : '确认后项目将立即结束，当前轮账号释放回空闲池。此操作不可撤销。须领单已全部平仓且收益统计完成。'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type='button' variant='outline' disabled={endProjectBusy} onClick={() => setEndProjectOpen(false)}>
              取消
            </Button>
            <Button
              type='button'
              variant='destructive'
              disabled={!canEndProject || endProjectBusy}
              onClick={() => void handleEndProject()}
            >
              {endProjectBusy ? '结束中…' : '确认结束'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  bordered = false,
  tinted = false
}: {
  label: string
  value: ReactNode
  bordered?: boolean
  tinted?: boolean
}) {
  return (
    <div
      className={cn(
        'px-4 py-3',
        tinted && 'bg-card dark:bg-transparent',
        bordered &&
          'border-border/50 from-background to-muted/20 dark:to-muted/10 rounded-lg border bg-gradient-to-b shadow-sm'
      )}
    >
      <p className='text-muted-foreground/90 text-[11px] font-medium dark:text-muted-foreground/80'>
        {label}
      </p>
      <div className='text-foreground mt-1.5 text-sm font-semibold tabular-nums'>{value}</div>
    </div>
  )
}
