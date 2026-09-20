export type MemberRelation = 'SAME' | 'INVERSE'
export type MemberResult = 'ACTIVE' | 'PROMOTED' | 'ELIMINATED' | 'WINNER'
export type CampaignStatus = 'RUNNING' | 'COMPLETED' | 'PAUSED'
export type DataConfidence = 'LIVE' | 'PROVISIONAL' | 'FINAL'
export type RoundPhase = 'PREPARING' | 'RUNNING' | 'SETTLED'
export type ExchangeId = 'Binance' | 'OKX' | 'Gate'

export type RoundMember = {
  id: string
  apiId: string
  apiLabel: string
  relation: MemberRelation
  result: MemberResult
  pnl: number
  trades: number
  /** 可用保证金 / 余额（USDT）；缺省时用 mockBalanceForApi 推导 */
  balanceUsdt?: number
  isLeader?: boolean
}

/** 低于该阈值视为需补保证金 */
export const LOW_BALANCE_USDT = 200

export function mockBalanceForApi(apiId: string) {
  let hash = 0
  for (let i = 0; i < apiId.length; i++) {
    hash = (hash * 31 + apiId.charCodeAt(i)) >>> 0
  }
  // 约 1/9 做成低余额，方便演示高亮
  if (hash % 9 === 0) {
    return Number((40 + (hash % 120)).toFixed(1))
  }
  return Number((280 + (hash % 1800) + (hash % 97) / 10).toFixed(1))
}

export function isLowBalance(balanceUsdt: number) {
  return balanceUsdt < LOW_BALANCE_USDT
}

export type RoundSnapshot = {
  id: string
  index: number
  memberCount: number
  netPnl: number
  phase: RoundPhase
  leaderConfirmed: boolean
  members: RoundMember[]
}

export type CopyRecord = {
  id: string
  time: string
  side: 'BUY' | 'SELL'
  symbol: string
  qty: number
  price: number
  pnl: number
  status: 'FILLED' | 'PARTIAL' | 'CANCELED'
}

export type OpenPosition = {
  id: string
  symbol: string
  side: 'LONG' | 'SHORT'
  marginMode: '全仓' | '逐仓'
  leverage: number
  pnlUsdt: number
  roiPct: number
  qty: number
  qtyAsset: string
  entryPrice: number
  openedAt: string
}

export type ClosedPosition = OpenPosition & {
  closedAt: string
}

export type Campaign = {
  id: string
  code: string
  name: string
  exchange: ExchangeId
  status: CampaignStatus
  confidence: DataConfidence
  initialAccounts: number
  currentRound: number
  totalRounds: number
  campaignNet: number
  fees: number
  cycles: number
  settled: number
  rounds: RoundSnapshot[]
}

export type IdleApi = {
  id: string
  label: string
  exchange: ExchangeId
  busy: boolean
  balanceUsdt?: number
}

export const EXCHANGES: ExchangeId[] = ['Binance', 'OKX', 'Gate']

export const MOCK_IDLE_APIS: IdleApi[] = [
  { id: 'api-11', label: 'B11', exchange: 'Binance', busy: false },
  { id: 'api-12', label: 'B12', exchange: 'Binance', busy: false },
  { id: 'api-13', label: 'B13', exchange: 'Binance', busy: false },
  { id: 'api-14', label: 'B14', exchange: 'Binance', busy: false },
  { id: 'api-15', label: 'B15', exchange: 'Binance', busy: false },
  { id: 'api-16', label: 'B16', exchange: 'Binance', busy: false },
  { id: 'api-17', label: 'B17', exchange: 'Binance', busy: false },
  { id: 'api-18', label: 'B18', exchange: 'Binance', busy: false },
  { id: 'api-19', label: 'B19', exchange: 'Binance', busy: false },
  { id: 'api-20', label: 'B20', exchange: 'Binance', busy: false },
  { id: 'api-21', label: 'O21', exchange: 'OKX', busy: true },
  { id: 'api-22', label: 'O22', exchange: 'OKX', busy: true },
  { id: 'api-23', label: 'O23', exchange: 'OKX', busy: true },
  { id: 'api-24', label: 'O24', exchange: 'OKX', busy: true },
  { id: 'api-25', label: 'O25', exchange: 'OKX', busy: true },
  { id: 'api-31', label: 'G31', exchange: 'Gate', busy: false },
  { id: 'api-32', label: 'G32', exchange: 'Gate', busy: false },
  { id: 'api-33', label: 'G33', exchange: 'Gate', busy: false },
  { id: 'api-34', label: 'G34', exchange: 'Gate', busy: false }
]

export const MOCK_ACTIVE_CAMPAIGN: Campaign = {
  id: 'c-a017',
  code: 'A017',
  name: 'BTC 养号项目',
  exchange: 'Binance',
  status: 'RUNNING',
  confidence: 'LIVE',
  initialAccounts: 8,
  currentRound: 3,
  totalRounds: 3,
  campaignNet: -154.4,
  fees: -38.9,
  cycles: 31,
  settled: 30,
  rounds: [
    {
      id: 'r1',
      index: 1,
      memberCount: 8,
      netPnl: -78.8,
      phase: 'SETTLED',
      leaderConfirmed: true,
      members: [
        { id: 'r1-a01', apiId: 'api-01', apiLabel: 'A01', relation: 'SAME', result: 'PROMOTED', pnl: 42.1, trades: 9, isLeader: true },
        { id: 'r1-a02', apiId: 'api-02', apiLabel: 'A02', relation: 'SAME', result: 'PROMOTED', pnl: 18.4, trades: 7 },
        { id: 'r1-a03', apiId: 'api-03', apiLabel: 'A03', relation: 'SAME', result: 'ELIMINATED', pnl: -36.2, trades: 11 },
        { id: 'r1-a04', apiId: 'api-04', apiLabel: 'A04', relation: 'SAME', result: 'PROMOTED', pnl: 55.0, trades: 10 },
        { id: 'r1-a05', apiId: 'api-05', apiLabel: 'A05', relation: 'INVERSE', result: 'PROMOTED', pnl: 12.3, trades: 8 },
        { id: 'r1-a06', apiId: 'api-06', apiLabel: 'A06', relation: 'INVERSE', result: 'ELIMINATED', pnl: -41.5, trades: 12 },
        { id: 'r1-a07', apiId: 'api-07', apiLabel: 'A07', relation: 'INVERSE', result: 'ELIMINATED', pnl: -68.0, trades: 14 },
        { id: 'r1-a08', apiId: 'api-08', apiLabel: 'A08', relation: 'INVERSE', result: 'ELIMINATED', pnl: -60.9, trades: 13 }
      ]
    },
    {
      id: 'r2',
      index: 2,
      memberCount: 4,
      netPnl: -41.0,
      phase: 'SETTLED',
      leaderConfirmed: true,
      members: [
        { id: 'r2-a01', apiId: 'api-01', apiLabel: 'A01', relation: 'SAME', result: 'ELIMINATED', pnl: -22.4, trades: 6 },
        { id: 'r2-a04', apiId: 'api-04', apiLabel: 'A04', relation: 'SAME', result: 'PROMOTED', pnl: 38.6, trades: 8, isLeader: true },
        { id: 'r2-a02', apiId: 'api-02', apiLabel: 'A02', relation: 'INVERSE', result: 'ELIMINATED', pnl: -48.1, trades: 9 },
        { id: 'r2-a05', apiId: 'api-05', apiLabel: 'A05', relation: 'INVERSE', result: 'PROMOTED', pnl: -9.1, trades: 7 }
      ]
    },
    {
      id: 'r3',
      index: 3,
      memberCount: 2,
      netPnl: 0,
      phase: 'PREPARING',
      leaderConfirmed: false,
      members: [
        { id: 'r3-a04', apiId: 'api-04', apiLabel: 'A04', relation: 'SAME', result: 'ACTIVE', pnl: 0, trades: 0, isLeader: true },
        { id: 'r3-a05', apiId: 'api-05', apiLabel: 'A05', relation: 'INVERSE', result: 'ACTIVE', pnl: 0, trades: 0 }
      ]
    }
  ]
}

export const MOCK_ACTIVE_CAMPAIGN_ETH: Campaign = {
  id: 'c-a018',
  code: 'A018',
  name: 'ETH 养号项目',
  exchange: 'OKX',
  status: 'RUNNING',
  confidence: 'LIVE',
  initialAccounts: 4,
  currentRound: 1,
  totalRounds: 2,
  campaignNet: 12.6,
  fees: -4.2,
  cycles: 8,
  settled: 8,
  rounds: [
    {
      id: 'eth-r1',
      index: 1,
      memberCount: 4,
      netPnl: 12.6,
      phase: 'RUNNING',
      leaderConfirmed: true,
      members: [
        { id: 'eth-r1-o21', apiId: 'api-21', apiLabel: 'O21', relation: 'SAME', result: 'ACTIVE', pnl: 18.4, trades: 5, isLeader: true },
        { id: 'eth-r1-o22', apiId: 'api-22', apiLabel: 'O22', relation: 'SAME', result: 'ACTIVE', pnl: 6.2, trades: 4 },
        { id: 'eth-r1-o23', apiId: 'api-23', apiLabel: 'O23', relation: 'INVERSE', result: 'ACTIVE', pnl: -4.8, trades: 5 },
        { id: 'eth-r1-o24', apiId: 'api-24', apiLabel: 'O24', relation: 'INVERSE', result: 'ACTIVE', pnl: -7.2, trades: 3 }
      ]
    }
  ]
}

function buildLargeDemoCampaign(initialAccounts = 64): Campaign {
  const totalRounds = Math.log2(initialAccounts)
  const labels = Array.from({ length: initialAccounts }, (_, i) => `L${String(i + 1).padStart(2, '0')}`)
  const apiIds = labels.map((_, i) => `api-large-${i + 1}`)

  const buildSettledRound = (index: number, survivors: number[]): RoundSnapshot => {
    const count = survivors.length
    const half = count / 2
    const promoteEach = count / 4
    const same = survivors.slice(0, half).map((srcIndex, i) => ({
      id: `large-r${index}-${apiIds[srcIndex]}`,
      apiId: apiIds[srcIndex],
      apiLabel: labels[srcIndex],
      relation: 'SAME' as const,
      result: (i < promoteEach ? 'PROMOTED' : 'ELIMINATED') as MemberResult,
      pnl: Number(((i < promoteEach ? 1 : -1) * (8 + (i % 7) * 3.1)).toFixed(1)),
      trades: 4 + (i % 9),
      balanceUsdt: mockBalanceForApi(apiIds[srcIndex]),
      isLeader: i === 0
    }))
    const inverse = survivors.slice(half).map((srcIndex, i) => ({
      id: `large-r${index}-${apiIds[srcIndex]}`,
      apiId: apiIds[srcIndex],
      apiLabel: labels[srcIndex],
      relation: 'INVERSE' as const,
      result: (i < promoteEach ? 'PROMOTED' : 'ELIMINATED') as MemberResult,
      pnl: Number(((i < promoteEach ? 1 : -1) * (6 + (i % 5) * 2.4)).toFixed(1)),
      trades: 3 + (i % 8),
      balanceUsdt: mockBalanceForApi(apiIds[srcIndex]),
      isLeader: false
    }))
    const members = [...same, ...inverse]

    return {
      id: `large-r${index}`,
      index,
      memberCount: count,
      netPnl: Number(members.reduce((sum, member) => sum + member.pnl, 0).toFixed(1)),
      phase: 'SETTLED',
      leaderConfirmed: true,
      members
    }
  }

  let survivors = Array.from({ length: initialAccounts }, (_, i) => i)
  const settledRounds: RoundSnapshot[] = []
  // 打到只剩 16 人进入准备态，可同时切换查看历史大轮次（64/32）
  const currentRoundIndex = 3

  for (let round = 1; round < currentRoundIndex; round++) {
    const snapshot = buildSettledRound(round, survivors)
    settledRounds.push(snapshot)
    survivors = snapshot.members
      .filter(member => member.result === 'PROMOTED')
      .map(member => apiIds.indexOf(member.apiId))
  }

  const half = survivors.length / 2
  const preparingMembers: RoundMember[] = survivors.map((srcIndex, i) => ({
    id: `large-r${currentRoundIndex}-${apiIds[srcIndex]}`,
    apiId: apiIds[srcIndex],
    apiLabel: labels[srcIndex],
    relation: (i < half ? 'SAME' : 'INVERSE') as MemberRelation,
    result: 'ACTIVE' as const,
    pnl: 0,
    trades: 0,
    isLeader: i === 0,
    balanceUsdt: mockBalanceForApi(apiIds[srcIndex])
  }))

  // 额外：第 1 轮保留完整 64 人，方便切历史轮看长列表效果
  //（上面 settledRounds 已包含）

  return {
    id: 'c-a064',
    code: 'A064',
    name: '大规模 64 号演示',
    exchange: 'Binance',
    status: 'RUNNING',
    confidence: 'LIVE',
    initialAccounts,
    currentRound: currentRoundIndex,
    totalRounds,
    campaignNet: -86.4,
    fees: -112.5,
    cycles: 58,
    settled: 55,
    rounds: [
      ...settledRounds,
      {
        id: `large-r${currentRoundIndex}`,
        index: currentRoundIndex,
        memberCount: preparingMembers.length,
        netPnl: 0,
        phase: 'PREPARING',
        leaderConfirmed: false,
        members: preparingMembers
      }
    ]
  }
}

export const MOCK_ACTIVE_CAMPAIGN_LARGE = buildLargeDemoCampaign(64)

export const MOCK_ACTIVE_CAMPAIGNS: Campaign[] = [
  MOCK_ACTIVE_CAMPAIGN_LARGE,
  MOCK_ACTIVE_CAMPAIGN,
  MOCK_ACTIVE_CAMPAIGN_ETH
]

/** 看板模拟演示开关（localStorage） */
export const INCUBATOR_BOARD_DEMO_MODE_KEY = 'incubator.board.demoMode'
export const INCUBATOR_DEMO_MODE_EVENT = 'incubator-demo-mode-change'

export function readBoardDemoMode(): boolean {
  if (typeof window === 'undefined') return true
  const raw = window.localStorage.getItem(INCUBATOR_BOARD_DEMO_MODE_KEY)
  if (raw === null) return true
  return raw === '1' || raw === 'true'
}

export function writeBoardDemoMode(enabled: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(INCUBATOR_BOARD_DEMO_MODE_KEY, enabled ? '1' : '0')
  window.dispatchEvent(
    new CustomEvent(INCUBATOR_DEMO_MODE_EVENT, {
      detail: { enabled }
    })
  )
}

/** 深拷贝载入模拟看板 + 历史数据，避免运行时改到静态常量 */
export function cloneDemoBoardData(): {
  campaigns: Campaign[]
  idleApis: IdleApi[]
  historyCampaigns: Campaign[]
} {
  return {
    campaigns: JSON.parse(JSON.stringify(MOCK_ACTIVE_CAMPAIGNS)) as Campaign[],
    idleApis: JSON.parse(JSON.stringify(MOCK_IDLE_APIS)) as IdleApi[],
    historyCampaigns: JSON.parse(JSON.stringify(MOCK_HISTORY_CAMPAIGNS)) as Campaign[]
  }
}

export const MOCK_HISTORY_CAMPAIGNS: Campaign[] = [
  {
    ...MOCK_ACTIVE_CAMPAIGN,
    id: 'c-a012',
    code: 'A012',
    name: 'ETH 养号项目',
    exchange: 'OKX',
    status: 'COMPLETED',
    confidence: 'FINAL',
    campaignNet: 286.5,
    fees: -52.1,
    cycles: 44,
    settled: 44,
    currentRound: 3,
    rounds: MOCK_ACTIVE_CAMPAIGN.rounds.map((round, index) =>
      index === 2
        ? {
            ...round,
            phase: 'SETTLED' as const,
            leaderConfirmed: true,
            netPnl: 143.4,
            members: [
              {
                id: 'h-r3-a04',
                apiId: 'api-04',
                apiLabel: 'A04',
                relation: 'SAME',
                result: 'WINNER',
                pnl: 92.4,
                trades: 12,
                isLeader: true
              },
              {
                id: 'h-r3-a05',
                apiId: 'api-05',
                apiLabel: 'A05',
                relation: 'INVERSE',
                result: 'ELIMINATED',
                pnl: 51.0,
                trades: 10
              }
            ]
          }
        : { ...round, phase: 'SETTLED' as const }
    )
  },
  {
    ...MOCK_ACTIVE_CAMPAIGN,
    id: 'c-a009',
    code: 'A009',
    name: 'BTC 养号项目',
    exchange: 'Binance',
    status: 'COMPLETED',
    confidence: 'FINAL',
    campaignNet: -92.3,
    fees: -29.4,
    cycles: 28,
    settled: 28,
    currentRound: 3
  },
  {
    ...MOCK_ACTIVE_CAMPAIGN,
    id: 'c-a005',
    code: 'A005',
    name: 'SOL 养号项目',
    exchange: 'Gate',
    status: 'COMPLETED',
    confidence: 'FINAL',
    campaignNet: 141.8,
    fees: -33.7,
    cycles: 36,
    settled: 36,
    currentRound: 3
  }
]

export const MOCK_COPY_RECORDS: Record<string, CopyRecord[]> = {
  'api-04': [
    { id: 't1', time: '2026-09-19 14:22:08', side: 'BUY', symbol: 'BTCUSDT', qty: 0.02, price: 64210, pnl: 18.4, status: 'FILLED' },
    { id: 't2', time: '2026-09-19 13:05:41', side: 'SELL', symbol: 'BTCUSDT', qty: 0.02, price: 63880, pnl: -6.2, status: 'FILLED' },
    { id: 't3', time: '2026-09-19 11:48:19', side: 'BUY', symbol: 'BTCUSDT', qty: 0.015, price: 64105, pnl: 12.1, status: 'FILLED' },
    { id: 't4', time: '2026-09-19 10:12:55', side: 'SELL', symbol: 'BTCUSDT', qty: 0.015, price: 63990, pnl: 4.8, status: 'FILLED' },
    { id: 't5', time: '2026-09-18 22:36:02', side: 'BUY', symbol: 'BTCUSDT', qty: 0.01, price: 63720, pnl: 9.6, status: 'FILLED' }
  ],
  'api-05': [
    { id: 't6', time: '2026-09-19 14:22:11', side: 'SELL', symbol: 'BTCUSDT', qty: 0.02, price: 64205, pnl: 16.2, status: 'FILLED' },
    { id: 't7', time: '2026-09-19 13:05:44', side: 'BUY', symbol: 'BTCUSDT', qty: 0.02, price: 63885, pnl: 5.1, status: 'FILLED' },
    { id: 't8', time: '2026-09-19 11:48:22', side: 'SELL', symbol: 'BTCUSDT', qty: 0.015, price: 64100, pnl: -8.4, status: 'FILLED' }
  ]
}

export type TradeTimelineAction = 'open' | 'add' | 'reduce' | 'close'

export type TradeTimelineEvent = {
  id: string
  eventAt: string
  action: TradeTimelineAction
  side: 'buy' | 'sell'
  posSide: 'long' | 'short'
  symbol: string
  quantity: number
  price?: number
  apiLabel?: string
  error?: { code: number | string; msg: string }
}

/** 演示用：领单成交时间轴 */
export const MOCK_LEADER_TIMELINE: TradeTimelineEvent[] = [
  {
    id: 'tl-l1',
    eventAt: '2026-09-19 15:32:46',
    action: 'open',
    side: 'sell',
    posSide: 'short',
    symbol: 'ETHUSDT',
    quantity: 0.6,
    price: 2524.8
  },
  {
    id: 'tl-l2',
    eventAt: '2026-09-19 14:05:11',
    action: 'open',
    side: 'sell',
    posSide: 'short',
    symbol: 'BTCUSDT',
    quantity: 0.04,
    price: 64180
  },
  {
    id: 'tl-l3',
    eventAt: '2026-09-19 12:18:03',
    action: 'add',
    side: 'buy',
    posSide: 'long',
    symbol: 'SOLUSDT',
    quantity: 12.5,
    price: 178.2
  },
  {
    id: 'tl-l4',
    eventAt: '2026-09-19 10:18:22',
    action: 'open',
    side: 'buy',
    posSide: 'long',
    symbol: 'SOLUSDT',
    quantity: 30,
    price: 176.42
  },
  {
    id: 'tl-l5',
    eventAt: '2026-09-18 21:45:18',
    action: 'close',
    side: 'sell',
    posSide: 'long',
    symbol: 'BTCUSDT',
    quantity: 0.03,
    price: 63880
  },
  {
    id: 'tl-l6',
    eventAt: '2026-09-18 16:28:03',
    action: 'close',
    side: 'buy',
    posSide: 'short',
    symbol: 'SOLUSDT',
    quantity: 28,
    price: 180.6
  },
  {
    id: 'tl-l7',
    eventAt: '2026-09-18 11:05:22',
    action: 'open',
    side: 'sell',
    posSide: 'short',
    symbol: 'SOLUSDT',
    quantity: 28,
    price: 182.1
  }
]

/** 演示用：跟单成交时间轴（相对领单略延迟） */
export const MOCK_FOLLOWER_TIMELINE: TradeTimelineEvent[] = [
  {
    id: 'tl-f1',
    eventAt: '2026-09-19 15:32:49',
    action: 'open',
    side: 'sell',
    posSide: 'short',
    symbol: 'ETHUSDT',
    quantity: 0.6,
    price: 2525.1
  },
  {
    id: 'tl-f2',
    eventAt: '2026-09-19 14:05:14',
    action: 'open',
    side: 'sell',
    posSide: 'short',
    symbol: 'BTCUSDT',
    quantity: 0.04,
    price: 64172,
    error: {
      code: -4164,
      msg: "Order's notional must be no smaller than 20 (unless you choose reduce only)."
    }
  },
  {
    id: 'tl-f3',
    eventAt: '2026-09-19 12:18:07',
    action: 'add',
    side: 'buy',
    posSide: 'long',
    symbol: 'SOLUSDT',
    quantity: 12.5,
    price: 178.15,
    error: {
      code: -2019,
      msg: 'Margin is insufficient.'
    }
  },
  {
    id: 'tl-f4',
    eventAt: '2026-09-19 10:18:26',
    action: 'open',
    side: 'buy',
    posSide: 'long',
    symbol: 'SOLUSDT',
    quantity: 30,
    price: 176.5
  },
  {
    id: 'tl-f5',
    eventAt: '2026-09-18 21:45:22',
    action: 'close',
    side: 'sell',
    posSide: 'long',
    symbol: 'BTCUSDT',
    quantity: 0.03,
    price: 63875
  }
]

export function getMemberTradeTimeline(options: {
  apiId?: string | null
  apiLabel?: string | null
  isLeader: boolean
}): TradeTimelineEvent[] {
  if (!options.apiId) return []
  const source = options.isLeader ? MOCK_LEADER_TIMELINE : MOCK_FOLLOWER_TIMELINE
  return source.map(item => ({
    ...item,
    id: `${options.apiId}-${item.id}`,
    apiLabel: options.apiLabel ?? undefined
  }))
}

/** 演示用：领单 API 当前持仓（跟单源） */
export const MOCK_LEADER_OPEN_POSITIONS: OpenPosition[] = [
  {
    id: 'pos-leader-1',
    symbol: 'SOLUSDT',
    side: 'LONG',
    marginMode: '全仓',
    leverage: 10,
    pnlUsdt: 128.46,
    roiPct: 18.32,
    qty: 42.5,
    qtyAsset: 'SOL',
    entryPrice: 176.42,
    openedAt: '2026-09-19 10:18:22'
  },
  {
    id: 'pos-leader-2',
    symbol: 'BTCUSDT',
    side: 'SHORT',
    marginMode: '全仓',
    leverage: 5,
    pnlUsdt: -24.8,
    roiPct: -3.15,
    qty: 0.04,
    qtyAsset: 'BTC',
    entryPrice: 64180,
    openedAt: '2026-09-19 14:05:11'
  },
  {
    id: 'pos-leader-3',
    symbol: 'ETHUSDT',
    side: 'SHORT',
    marginMode: '逐仓',
    leverage: 8,
    pnlUsdt: -12.6,
    roiPct: -2.48,
    qty: 0.6,
    qtyAsset: 'ETH',
    entryPrice: 2524.8,
    openedAt: '2026-09-19 15:32:46'
  }
]

export function getLeaderOpenPositions(
  leaderApiId: string | null | undefined,
  phase?: RoundPhase | null
): OpenPosition[] {
  if (!leaderApiId) return []
  // 模拟：仅运行中有未平仓；准备/已结算视为已平完并可统计收益
  if (phase && phase !== 'RUNNING') return []
  return MOCK_LEADER_OPEN_POSITIONS
}

/** 演示用：领单 API 历史持仓 */
export const MOCK_LEADER_CLOSED_POSITIONS: ClosedPosition[] = [
  {
    id: 'pos-closed-1',
    symbol: 'BTCUSDT',
    side: 'LONG',
    marginMode: '全仓',
    leverage: 5,
    pnlUsdt: 86.2,
    roiPct: 12.4,
    qty: 0.03,
    qtyAsset: 'BTC',
    entryPrice: 63210,
    openedAt: '2026-09-18 09:12:40',
    closedAt: '2026-09-18 21:45:18'
  },
  {
    id: 'pos-closed-2',
    symbol: 'SOLUSDT',
    side: 'SHORT',
    marginMode: '全仓',
    leverage: 10,
    pnlUsdt: -18.5,
    roiPct: -4.2,
    qty: 28,
    qtyAsset: 'SOL',
    entryPrice: 182.1,
    openedAt: '2026-09-18 11:05:22',
    closedAt: '2026-09-18 16:28:03'
  },
  {
    id: 'pos-closed-3',
    symbol: 'ETHUSDT',
    side: 'LONG',
    marginMode: '逐仓',
    leverage: 8,
    pnlUsdt: 41.7,
    roiPct: 7.8,
    qty: 1.1,
    qtyAsset: 'ETH',
    entryPrice: 2465.3,
    openedAt: '2026-09-17 14:33:09',
    closedAt: '2026-09-18 08:11:55'
  },
  {
    id: 'pos-closed-4',
    symbol: 'BNBUSDT',
    side: 'SHORT',
    marginMode: '全仓',
    leverage: 5,
    pnlUsdt: 9.3,
    roiPct: 2.1,
    qty: 6,
    qtyAsset: 'BNB',
    entryPrice: 598.4,
    openedAt: '2026-09-17 20:02:14',
    closedAt: '2026-09-17 23:40:41'
  }
]

export function getLeaderClosedPositions(leaderApiId: string | null | undefined): ClosedPosition[] {
  if (!leaderApiId) return []
  return MOCK_LEADER_CLOSED_POSITIONS
}

export function formatPnl(value: number) {
  const sign = value > 0 ? '+' : ''

  return `${sign}${value.toFixed(1)} U`
}

export function relationLabel(relation: MemberRelation) {
  return relation === 'SAME' ? '同向' : '反向'
}

export function resultLabel(result: MemberResult) {
  switch (result) {
    case 'ACTIVE':
      return '运行中'
    case 'PROMOTED':
      return '已晋级'
    case 'ELIMINATED':
      return '已淘汰'
    case 'WINNER':
      return '冠军'
    default:
      return result
  }
}

export function campaignStatusLabel(status: CampaignStatus) {
  switch (status) {
    case 'RUNNING':
      return '进行中'
    case 'COMPLETED':
      return '已结束'
    case 'PAUSED':
      return '已暂停'
    default:
      return status
  }
}

export function confidenceLabel(confidence: DataConfidence) {
  switch (confidence) {
    case 'LIVE':
      return '实时'
    case 'PROVISIONAL':
      return '暂估'
    case 'FINAL':
      return '已定稿'
    default:
      return confidence
  }
}

export function sideLabel(side: CopyRecord['side']) {
  return side === 'BUY' ? '买入' : '卖出'
}

export function fillStatusLabel(status: CopyRecord['status']) {
  switch (status) {
    case 'FILLED':
      return '已成交'
    case 'PARTIAL':
      return '部分成交'
    case 'CANCELED':
      return '已撤销'
    default:
      return status
  }
}

export function roundPhaseLabel(phase: RoundPhase) {
  switch (phase) {
    case 'PREPARING':
      return '准备中'
    case 'RUNNING':
      return '进行中'
    case 'SETTLED':
      return '已结算'
    default:
      return phase
  }
}

export function isPowerOfTwo(n: number) {
  return n >= 2 && (n & (n - 1)) === 0
}

export function totalRoundsFromCount(n: number) {
  return Math.log2(n)
}

function nextCode() {
  return `A${String(Math.floor(Math.random() * 900) + 100)}`
}

export function splitIntoRelations(apis: Array<{ id: string; label: string }>): RoundMember[] {
  const half = apis.length / 2

  return apis.map((api, index) => ({
    id: `m-${api.id}-${index}`,
    apiId: api.id,
    apiLabel: api.label,
    relation: (index < half ? 'SAME' : 'INVERSE') as MemberRelation,
    result: 'ACTIVE' as const,
    pnl: 0,
    trades: 0,
    balanceUsdt: mockBalanceForApi(api.id)
  }))
}

/** 准备态：将当前轮成员重新均分到同向 / 反向，并清空领单 */
export function reshuffleRoundMembers(members: RoundMember[]): RoundMember[] {
  if (members.length < 2) return members

  const pool = [...members]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const half = pool.length / 2
  return pool.map((member, index) => ({
    ...member,
    relation: (index < half ? 'SAME' : 'INVERSE') as MemberRelation,
    isLeader: false,
    result: 'ACTIVE' as const
  }))
}

export type PromoteResultSummary = {
  roundIndex: number
  winner: MemberRelation
  promoted: Array<Pick<RoundMember, 'apiId' | 'apiLabel' | 'pnl'>>
  eliminated: Array<Pick<RoundMember, 'apiId' | 'apiLabel' | 'pnl'>>
  nextRoundIndex: number | null
  projectCompleted: boolean
}

export function buildPromoteResultSummary(
  members: RoundMember[],
  roundIndex: number,
  winner: MemberRelation,
  nextRoundIndex: number | null,
  projectCompleted: boolean
): PromoteResultSummary {
  const promoted = members
    .filter(member => member.relation === winner)
    .map(member => ({ apiId: member.apiId, apiLabel: member.apiLabel, pnl: member.pnl }))
  const eliminated = members
    .filter(member => member.relation !== winner)
    .map(member => ({ apiId: member.apiId, apiLabel: member.apiLabel, pnl: member.pnl }))

  return {
    roundIndex,
    winner,
    promoted,
    eliminated,
    nextRoundIndex,
    projectCompleted
  }
}

export function memberBalance(member: RoundMember) {
  return member.balanceUsdt ?? mockBalanceForApi(member.apiId)
}

export function createCampaignFromApis(input: {
  name: string
  exchange: ExchangeId
  apis: Array<{ id: string; label: string }>
}): Campaign {
  const members = splitIntoRelations(input.apis)
  const count = members.length

  return {
    id: `c-${Date.now()}`,
    code: nextCode(),
    name: input.name.trim() || `${input.exchange} 养号项目`,
    exchange: input.exchange,
    status: 'RUNNING',
    confidence: 'LIVE',
    initialAccounts: count,
    currentRound: 1,
    totalRounds: totalRoundsFromCount(count),
    campaignNet: 0,
    fees: 0,
    cycles: 0,
    settled: 0,
    rounds: [
      {
        id: `r-${Date.now()}`,
        index: 1,
        memberCount: count,
        netPnl: 0,
        phase: 'PREPARING',
        leaderConfirmed: false,
        members
      }
    ]
  }
}

export function updateMemberRelation(
  members: RoundMember[],
  memberId: string,
  relation: MemberRelation
): RoundMember[] {
  return members.map(member => (member.id === memberId ? { ...member, relation } : member))
}

export function confirmLeader(members: RoundMember[], memberId: string): RoundMember[] {
  return members.map(member => ({
    ...member,
    isLeader: member.id === memberId
  }))
}

export function startRound(campaign: Campaign): Campaign {
  const rounds = campaign.rounds.map(round =>
    round.index === campaign.currentRound
      ? { ...round, phase: 'RUNNING' as const }
      : round
  )

  return { ...campaign, rounds, confidence: 'LIVE' }
}

export function terminateRound(campaign: Campaign, winner: MemberRelation): Campaign {
  const current = campaign.rounds.find(round => round.index === campaign.currentRound)
  if (!current || current.phase !== 'RUNNING') return campaign

  const settledMembers = current.members.map(member => {
    if (member.relation === winner) {
      const survivors = current.members.filter(m => m.relation === winner)
      if (survivors.length === 1) {
        return { ...member, result: 'WINNER' as const }
      }
      return { ...member, result: 'PROMOTED' as const }
    }
    return { ...member, result: 'ELIMINATED' as const }
  })

  const roundNet = settledMembers.reduce((sum, member) => sum + member.pnl, 0)
  const settledRound: RoundSnapshot = {
    ...current,
    phase: 'SETTLED',
    netPnl: roundNet,
    members: settledMembers
  }

  const promoted = settledMembers.filter(member => member.result === 'PROMOTED' || member.result === 'WINNER')
  const previousRounds = campaign.rounds.map(round =>
    round.index === current.index ? settledRound : round
  )

  if (promoted.length <= 1) {
    return {
      ...campaign,
      status: 'COMPLETED',
      confidence: 'FINAL',
      campaignNet: campaign.campaignNet + roundNet,
      rounds: previousRounds
    }
  }

  const nextMembers = splitIntoRelations(
    promoted.map(member => ({ id: member.apiId, label: member.apiLabel }))
  ).map(member => ({ ...member, id: `r${current.index + 1}-${member.apiId}` }))

  const nextRound: RoundSnapshot = {
    id: `r-${Date.now()}`,
    index: current.index + 1,
    memberCount: nextMembers.length,
    netPnl: 0,
    phase: 'PREPARING',
    leaderConfirmed: false,
    members: nextMembers
  }

  return {
    ...campaign,
    currentRound: nextRound.index,
    totalRounds: Math.max(campaign.totalRounds, nextRound.index),
    campaignNet: campaign.campaignNet + roundNet,
    rounds: [...previousRounds, nextRound]
  }
}

export function endCampaignEarly(campaign: Campaign): Campaign {
  if (campaign.status === 'COMPLETED') return campaign

  const current = campaign.rounds.find(round => round.index === campaign.currentRound)
  if (!current) {
    return { ...campaign, status: 'COMPLETED', confidence: 'FINAL' }
  }

  const settledMembers = current.members.map(member => ({
    ...member,
    result: member.result === 'ACTIVE' ? ('ELIMINATED' as const) : member.result,
    isLeader: false
  }))
  const roundNet = settledMembers.reduce((sum, member) => sum + member.pnl, 0)

  return {
    ...campaign,
    status: 'COMPLETED',
    confidence: 'FINAL',
    campaignNet: campaign.campaignNet + (current.phase === 'SETTLED' ? 0 : roundNet),
    rounds: campaign.rounds.map(round =>
      round.index === current.index
        ? {
            ...round,
            phase: 'SETTLED' as const,
            netPnl: current.phase === 'SETTLED' ? round.netPnl : roundNet,
            leaderConfirmed: false,
            members: settledMembers
          }
        : round
    )
  }
}

export function getCampaignApiIds(campaign: Campaign) {
  const ids = new Set<string>()
  for (const round of campaign.rounds) {
    for (const member of round.members) {
      ids.add(member.apiId)
    }
  }
  return ids
}

export function getAvailableApis(apis: IdleApi[], exchange: ExchangeId, busyApiIds: Set<string>) {
  return apis.filter(
    api => api.exchange === exchange && !api.busy && !busyApiIds.has(api.id)
  )
}
