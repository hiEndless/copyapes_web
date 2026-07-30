'use client'

import { useState, useEffect } from 'react'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { CircleHelp } from 'lucide-react'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { getApiOptions, getTraderBalance, addTask } from '@/api/task'
import { request } from '@/api/request'
import { settingsApi } from '@/api/settings'
import { useDashboardRouter as useRouter } from '@/hooks/use-dashboard-router'

import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors'
import { tourSafeDialogProps } from '@/features/tour/dialog-guard'
import { TOUR_IDS } from '@/features/tour/registry'
import { useTour } from '@/features/tour/tour-provider'

import { CopyTradeProtocolDialog } from './copy-trade-protocol-dialog'
import { buildFollowRatioPreview } from '@/lib/follow-ratio'

function splitCookieModeUniqueName(uniqueName: string): { leaderId: string; cookieId: string | null } {
  const raw = String(uniqueName || '').trim()
  if (!raw || !raw.includes('-')) {
    return { leaderId: raw, cookieId: null }
  }
  const lastDash = raw.lastIndexOf('-')
  const leaderId = raw.slice(0, lastDash).trim()
  const cookieIdText = raw.slice(lastDash + 1).trim()
  if (!leaderId || !/^\d+$/.test(cookieIdText)) {
    return { leaderId: raw, cookieId: null }
  }

  return { leaderId, cookieId: cookieIdText }
}

function buildUniqueName(
  traderId: string,
  cookieId: string | undefined,
  traderPlatform: number | string | undefined
): string {
  const tp = Number(traderPlatform)
  if (tp !== 7 && tp !== 8) {
    return traderId
  }

  const id = String(traderId || '').trim()
  if (!cookieId) {
    return id
  }

  const cid = String(cookieId).trim()
  const { leaderId } = splitCookieModeUniqueName(id)

  return `${leaderId || id}-${cid}`
}

const API_EXCHANGE_LOGO: Record<string, string> = {
  '1': '/exchanges/okx.png',
  '2': '/exchanges/binance.png',
  '3': '/exchanges/gate.png',
  '4': '/exchanges/bitget.png',
  '5': '/exchanges/weex.png',
  okx: '/exchanges/okx.png',
  binance: '/exchanges/binance.png',
  gate: '/exchanges/gate.png',
  bitget: '/exchanges/bitget.png',
  weex: '/exchanges/weex.png'
}

function getApiExchangeLogo(platformOrExchange: string | number | undefined): string | null {
  const key = String(platformOrExchange ?? '').trim()
  if (!key) return null

  return API_EXCHANGE_LOGO[key] ?? API_EXCHANGE_LOGO[key.toLowerCase()] ?? null
}

function normalizeCoinSymbol(raw: string): string {
  const tag = String(raw || '').trim().toUpperCase()
  if (!tag) return ''

  if (tag.includes('-')) {
    return tag.split('-')[0]
  }

  if (tag.endsWith('USDT') && tag.length > 4) {
    return tag.slice(0, -4)
  }

  return tag
}

function normalizeCoinSymbolList(values: unknown): string[] {
  if (!Array.isArray(values)) return []

  const normalized: string[] = []

  values.forEach(item => {
    const symbol = normalizeCoinSymbol(String(item ?? ''))
    if (symbol && !normalized.includes(symbol)) {
      normalized.push(symbol)
    }
  })

  return normalized
}

type ConfigSummaryItem = {
  key: string
  label: string
  value: string
  tone?: 'normal' | 'risk' | 'warning'
  tab?: 'basic' | 'advanced'
}

function buildConfigSummary(params: {
  t: ReturnType<typeof useTranslations>
  traderName?: string
  traderId: string | null
  apiName: string
  formData: {
    label: string
    follow_type: string
    benchMark: string
    investment: string
    lever_set: number
    leverage: string
    margin_mode_set: number
    first_open_type: number
    uplRatio: string
    first_order_set: number
  }
  toggles: {
    multiple_visible: boolean
    multiple: string
    posSide_set_visible: boolean
    fast_mode_visible: boolean
    trade_trigger_visible: boolean
    tp_trigger_px: string
    sl_trigger_px: string
    pos_visible: boolean
    pos_value: string
    vol24h_visible: boolean
    vol24h_num: string
    balance_monitor_visible: boolean
    balance_monitor_value: string
    white_list_visible: boolean
    white_list: string[]
    black_list_visible: boolean
    black_list: string[]
  }
  followRatioPreview: ReturnType<typeof buildFollowRatioPreview> | null
}): ConfigSummaryItem[] {
  const { t, traderName, traderId, apiName, formData, toggles, followRatioPreview } = params

  const dash = t('summary.values.dash')

  const marginModeLabel =
    formData.margin_mode_set === 1
      ? t('summary.values.marginCross')
      : formData.margin_mode_set === 2
        ? t('summary.values.marginIsolated')
        : t('summary.values.followLeader')

  const firstOrderLabel =
    formData.first_order_set === 2
      ? t('summary.values.copyCurrent')
      : formData.first_order_set === 3
        ? t('summary.values.copyLossOnly')
        : t('summary.values.copyNewOnly')

  const ratioValue =
    followRatioPreview?.ready === true
      ? followRatioPreview.formula.split(' = ').pop() || dash
      : t('summary.values.waitingInput')

  const items: ConfigSummaryItem[] = [
    { key: 'trader', label: t('summary.labels.trader'), value: traderName || traderId || dash },
    { key: 'api', label: t('summary.labels.api'), value: apiName, tab: 'basic' }
  ]

  if (formData.label.trim()) {
    items.push({ key: 'taskLabel', label: t('summary.labels.taskLabel'), value: formData.label.trim(), tab: 'basic' })
  }

  if (formData.follow_type === '2') {
    items.push({
      key: 'followMode',
      label: t('summary.labels.followMode'),
      value: t('summary.values.fixedRatio'),
      tab: 'basic'
    })
  }

  items.push(
    {
      key: 'benchMark',
      label: t('summary.labels.benchMark'),
      value: formData.benchMark ? t('summary.values.usdt', { value: formData.benchMark }) : t('summary.values.notFilled'),
      tab: 'basic'
    },
    {
      key: 'investment',
      label: t('summary.labels.investment'),
      value: formData.investment ? t('summary.values.usdt', { value: formData.investment }) : t('summary.values.notFilled'),
      tab: 'basic'
    },
    {
      key: 'ratio',
      label: t('summary.labels.ratio'),
      value: ratioValue,
      tone: followRatioPreview?.ready === true && followRatioPreview.lowRatioWarning ? 'warning' : 'normal',
      tab: 'basic'
    },
    {
      key: 'leverage',
      label: t('summary.labels.leverage'),
      value:
        formData.lever_set === 2
          ? t('summary.values.customLeverage', { leverage: formData.leverage || dash })
          : t('summary.values.followLeader'),
      tone: formData.lever_set === 2 ? 'risk' : 'normal',
      tab: 'basic'
    },
    {
      key: 'marginMode',
      label: t('summary.labels.marginMode'),
      value: marginModeLabel,
      tone: formData.margin_mode_set !== 0 ? 'risk' : 'normal',
      tab: 'basic'
    },
    {
      key: 'openType',
      label: t('summary.labels.openType'),
      value:
        formData.first_open_type === 2
          ? t('summary.values.intervalOrder', { ratio: formData.uplRatio || dash })
          : t('summary.values.marketPrice'),
      tab: 'basic'
    },
    {
      key: 'firstOrder',
      label: t('summary.labels.firstOrder'),
      value: firstOrderLabel,
      tone: formData.first_order_set !== 1 ? 'risk' : 'normal',
      tab: 'basic'
    }
  )

  if (toggles.multiple_visible) {
    items.push({
      key: 'multiple',
      label: t('summary.labels.multiple'),
      value: t('summary.values.multipleTimes', { value: toggles.multiple || '1' }),
      tone: 'risk',
      tab: 'basic'
    })
  }

  if (toggles.posSide_set_visible) {
    items.push({
      key: 'reverse',
      label: t('summary.labels.reverse'),
      value: t('summary.values.enabled'),
      tone: 'risk',
      tab: 'advanced'
    })
  }

  if (toggles.fast_mode_visible) {
    items.push({ key: 'fastMode', label: t('summary.labels.fastMode'), value: t('summary.values.enabled'), tab: 'advanced' })
  }

  if (toggles.trade_trigger_visible) {
    items.push({
      key: 'tradeTrigger',
      label: t('summary.labels.tradeTrigger'),
      value: t('summary.values.tpSl', { tp: toggles.tp_trigger_px || '0', sl: toggles.sl_trigger_px || '0' }),
      tab: 'advanced'
    })
  }

  if (toggles.pos_visible) {
    items.push({
      key: 'posStrategy',
      label: t('summary.labels.posStrategy'),
      value: toggles.pos_value === 'short' ? t('summary.values.followShort') : t('summary.values.followLong'),
      tab: 'advanced'
    })
  }

  if (toggles.vol24h_visible) {
    items.push({
      key: 'vol24h',
      label: t('summary.labels.vol24h'),
      value: t('summary.values.topN', { n: toggles.vol24h_num || dash }),
      tab: 'advanced'
    })
  }

  if (toggles.balance_monitor_visible) {
    items.push({
      key: 'balanceMonitor',
      label: t('summary.labels.balanceMonitor'),
      value: t('summary.values.minAmount', { value: toggles.balance_monitor_value || dash }),
      tab: 'advanced'
    })
  }

  if (toggles.white_list_visible && toggles.white_list.length > 0) {
    items.push({
      key: 'whiteList',
      label: t('summary.labels.whiteList'),
      value: toggles.white_list.join(', '),
      tab: 'advanced'
    })
  }

  if (toggles.black_list_visible && toggles.black_list.length > 0) {
    items.push({
      key: 'blackList',
      label: t('summary.labels.blackList'),
      value: toggles.black_list.join(', '),
      tab: 'advanced'
    })
  }

  return items
}

function buildConfigSummaryBrief(items: ConfigSummaryItem[], t: ReturnType<typeof useTranslations>): string {
  const ratioItem = items.find(item => item.key === 'ratio')
  const leverItem = items.find(item => item.key === 'leverage')
  const ratio = ratioItem?.value || t('summary.values.dash')
  const leverShort =
    leverItem && leverItem.value !== t('summary.values.followLeader')
      ? leverItem.value
      : t('summary.leverFollow')
  const riskCount = items.filter(item => item.tone === 'risk' || item.tone === 'warning').length
  const riskText = riskCount > 0 ? t('summary.riskCount', { count: riskCount }) : t('summary.noRisk')

  return t('summary.brief', { ratio, lever: leverShort, risk: riskText })
}

function ConfigSummaryDetailList({
  items,
  onJumpToItem,
  modifyLabel
}: {
  items: ConfigSummaryItem[]
  onJumpToItem: (tab?: 'basic' | 'advanced') => void
  modifyLabel: string
}) {
  return (
    <div className='space-y-2'>
      {items.map(item => (
        <div key={`${item.label}-${item.value}`} className='flex items-start justify-between gap-3 text-xs'>
          <span className='text-muted-foreground shrink-0'>{item.label}</span>
          <div className='flex min-w-0 items-start justify-end gap-2 text-right'>
            <span
              className={
                item.tone === 'risk'
                  ? 'font-medium text-red-600'
                  : item.tone === 'warning'
                    ? 'font-medium text-amber-600'
                    : 'text-foreground font-medium'
              }
            >
              {item.value}
            </span>
            {item.tab ? (
              <button
                type='button'
                className='text-primary shrink-0 hover:underline'
                onClick={() => onJumpToItem(item.tab)}
              >
                {modifyLabel}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Utility Component for Tags ---
function TagInput({
  tags,
  onChange,
  placeholder
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder: string
}) {
  const [inputValue, setInputValue] = useState('')

  const commitInput = () => {
    const parsedTags = inputValue
      .split(/[,，\n]+/)
      .map(tag => normalizeCoinSymbol(tag))
      .filter(Boolean)

    if (parsedTags.length === 0) {
      setInputValue('')

      return
    }

    const mergedTags = [...tags]

    parsedTags.forEach(tag => {
      if (!mergedTags.includes(tag)) {
        mergedTags.push(tag)
      }
    })

    if (mergedTags.length !== tags.length) {
      onChange(mergedTags)
    }

    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitInput()
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='mb-1 flex flex-wrap gap-2'>
        {tags.map(tag => (
          <span
            key={tag}
            className='border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium'
          >
            {tag}
            <button
              type='button'
              onClick={() => removeTag(tag)}
              className='text-primary/70 hover:text-destructive ml-1 focus:outline-none'
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitInput}
        placeholder={placeholder}
      />
    </div>
  )
}

export interface CopyTaskConfigSheetProps {
  isOpen: boolean
  onClose: () => void
  traderId: string | null
  traderName?: string
  platform: 'binance' | 'okx' | 'cookie' | 'exchange' | 'hyper' | 'hot' | string
  traderPlatform?: number | string // 交易员平台 ID (1: OKX, 2: Binance, 3: 币coin, 4: 热门, 5: Cookie, 6: API, 7: 币安带单, 8: OKX带单, 9: Hyperliquid, 10: Bitget)
  roleType?: string // 交易员实盘类型，由上一级页面传入
  cookieId?: string
  initialBenchMark?: string | number // 初始本金，如已有则优先使用该值
  initialTaskData?: any // 从复制任务传入的初始数据
  onSuccess?: () => void // 创建成功后的回调函数，用于同页面刷新等场景
}

export function CopyTaskConfigSheet({
  isOpen,
  onClose,
  traderId,
  traderName,
  platform,
  traderPlatform,
  roleType,
  cookieId,
  initialBenchMark,
  initialTaskData,
  onSuccess
}: CopyTaskConfigSheetProps) {
  const t = useTranslations('DashboardCopyTaskConfig')
  const router = useRouter()
  const { startTourById } = useTour()
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToProtocol, setAgreedToProtocol] = useState(false)
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [summaryDetailOpen, setSummaryDetailOpen] = useState(false)
  const [summaryViewed, setSummaryViewed] = useState(false)
  const [apiOptions, setApiOptions] = useState<any[]>([])
  const [notificationStatus, setNotificationStatus] = useState<{
    loading: boolean
    configured: boolean
  }>({ loading: false, configured: false })

  const hasAnyNotificationConfigured = async () => {
    try {
      const res = await request<{
        wx?: boolean
        wx_code?: string
        qq_mail?: boolean
        qq?: string
        password?: string
        ding_bot?: boolean
        ding_webhook?: string
        ding_secret?: string
      }>('/notify/', { method: 'GET', silent: true })
      if (res.code !== 0 || !res.data) {
        return false
      }
      const data = res.data
      const wxCode = String(data.wx_code || '').trim()
      const qq = String(data.qq || '').trim()
      const qqPwd = String(data.password || '').trim()
      const dingWebhook = String(data.ding_webhook || '').trim()

      return Boolean(wxCode || (qq && qqPwd) || dingWebhook)
    } catch (error) {
      console.error('Failed to precheck notification channels:', error)
      return false
    }
  }

  const refreshNotificationStatus = async () => {
    setNotificationStatus(prev => ({ ...prev, loading: true }))
    const configured = await hasAnyNotificationConfigured()
    setNotificationStatus({ loading: false, configured })
  }

  const mappedRoleType = roleType || '1'

  const hideFollowLeverage =
    String(traderPlatform) === '4' ||
    (String(traderPlatform) === '3' && mappedRoleType === '1') ||
    (String(traderPlatform) === '2' && mappedRoleType === '2')

  const disableIntervalOpen = hideFollowLeverage

  // Form State
  const [formData, setFormData] = useState({
    api_id: '',
    label: '',
    follow_type: '2', // 固定比例
    benchMark: '',
    investment: '',
    lever_set: hideFollowLeverage ? 2 : 1,
    leverage: '',
    margin_mode_set: 0,
    first_open_type: 1,
    uplRatio: '0',
    first_order_set: 1
  })

  // Toggle Switches State
  const [toggles, setToggles] = useState({
    multiple_visible: false,
    multiple: '1',
    posSide_set_visible: false,
    fast_mode_visible: true,
    trade_trigger_visible: false,
    tp_trigger_px: '0',
    sl_trigger_px: '0',
    pos_visible: false,
    pos_value: 'long',
    vol24h_visible: false,
    vol24h_num: '0',
    balance_monitor_visible: false,
    balance_monitor_value: '0',
    white_list_visible: false,
    white_list: [] as string[],
    black_list_visible: false,
    black_list: [] as string[]
  })

  useEffect(() => {
    if (!isOpen) {
      setAgreedToProtocol(false)
      setProtocolDialogOpen(false)
      setActiveTab('basic')
      setSummaryDetailOpen(false)
      setSummaryViewed(false)
    }
  }, [isOpen])

  // Load APIs
  useEffect(() => {
    if (isOpen) {
      refreshNotificationStatus()
      getApiOptions().then(res => {
        if (res.code === 0 && Array.isArray(res.data)) {
          const validApis = res.data.filter((item: any) => item.is_readonly === false)

          setApiOptions(validApis)

          const selectedStillValid = validApis.some((item: any) => String(item.id) === formData.api_id)

          if (validApis.length > 0 && (!formData.api_id || !selectedStillValid)) {
            setFormData(prev => ({ ...prev, api_id: String(validApis[0].id) }))
          } else if (validApis.length === 0 && formData.api_id) {
            setFormData(prev => ({ ...prev, api_id: '' }))
          }
        }
      })
    }
  }, [isOpen, formData.api_id])

  const updateForm = (key: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const updateToggle = (key: keyof typeof toggles, value: any) => {
    setToggles(prev => ({ ...prev, [key]: value }))
  }

  const handleWhiteListChange = (tags: string[]) => {
    const normalizedTags = normalizeCoinSymbolList(tags)
    const filteredTags = normalizedTags.filter(tag => {
      if (toggles.black_list.includes(tag)) {
        toast.error(t('toast.tagInBlacklist', { tag }))
        return false
      }
      return true
    })
    updateToggle('white_list', filteredTags)
  }

  const handleBlackListChange = (tags: string[]) => {
    const normalizedTags = normalizeCoinSymbolList(tags)
    const filteredTags = normalizedTags.filter(tag => {
      if (toggles.white_list.includes(tag)) {
        toast.error(t('toast.tagInWhitelist', { tag }))
        return false
      }
      return true
    })
    updateToggle('black_list', filteredTags)
  }

  const fetchBenchMark = async (isAuto = false) => {
    if (!traderPlatform || !traderId) return

    const resolvedUniqueName = buildUniqueName(traderId || '', cookieId, traderPlatform)

    const res = await getTraderBalance({
      trader_platform: traderPlatform,
      role_type: roleType || '1',
      uniqueName: resolvedUniqueName
    })

    if (res.code === 0) {
      updateForm('benchMark', String(res.data))
      if (!isAuto) toast.success(res.msg || t('toast.fetchSuccess'))
    } else {
      if (!isAuto) toast.error(res.msg || t('toast.fetchBenchmarkFailed'))
    }
  }

  // Effect to reset/init form when traderId changes
  useEffect(() => {
    if (isOpen && traderId) {
      if (initialTaskData) {
        // 当传入了初始任务数据（复制任务）时，回填各项参数
        setFormData(prev => ({
          ...prev,
          api_id: initialTaskData.api_id ? String(initialTaskData.api_id) : prev.api_id,
          label: initialTaskData.label ? String(initialTaskData.label) : '',
          follow_type: String(initialTaskData.follow_type || '2'),
          benchMark: initialTaskData.benchMark ? String(initialTaskData.benchMark) : initialBenchMark ? String(initialBenchMark) : prev.benchMark,
          investment: initialTaskData.investment ? String(initialTaskData.investment) : prev.investment,
          lever_set: initialTaskData.lever_set || (hideFollowLeverage ? 2 : 1),
          leverage: initialTaskData.leverage ? String(initialTaskData.leverage) : prev.leverage,
          margin_mode_set: Number(initialTaskData.margin_mode_set ?? 0),
          first_open_type: disableIntervalOpen ? 1 : initialTaskData.first_open_type || 1,
          uplRatio: initialTaskData.uplRatio ? String(initialTaskData.uplRatio) : prev.uplRatio,
          first_order_set: initialTaskData.first_order_set || 1
        }))

        setToggles({
          multiple_visible: Number(initialTaskData.multiple) !== 1,
          multiple: initialTaskData.multiple ? String(initialTaskData.multiple) : '1',
          posSide_set_visible: initialTaskData.posSide_set === 2,
          fast_mode_visible: initialTaskData.fast_mode === 1,
          trade_trigger_visible: initialTaskData.trade_trigger_mode === 1,
          tp_trigger_px: initialTaskData.tp_trigger_px ? String(initialTaskData.tp_trigger_px) : '0',
          sl_trigger_px: initialTaskData.sl_trigger_px ? String(initialTaskData.sl_trigger_px) : '0',
          pos_visible: initialTaskData.pos_mode === 1,
          pos_value: initialTaskData.pos_value || 'long',
          vol24h_visible: initialTaskData.vol24h_mode === 1,
          vol24h_num: initialTaskData.vol24h_num ? String(initialTaskData.vol24h_num) : '0',
          balance_monitor_visible: initialTaskData.balance_monitor_mode === 1,
          balance_monitor_value: initialTaskData.balance_monitor_value ? String(initialTaskData.balance_monitor_value) : '0',
          white_list_visible: initialTaskData.white_list_mode === 1,
          white_list: normalizeCoinSymbolList(initialTaskData.white_list),
          black_list_visible: initialTaskData.black_list_mode === 1,
          black_list: normalizeCoinSymbolList(initialTaskData.black_list)
        })
      } else {
        // 普通创建任务
        setFormData(prev => ({
          ...prev,
          lever_set: hideFollowLeverage ? 2 : 1,
          label: '',
          benchMark: initialBenchMark ? String(initialBenchMark) : prev.benchMark,
          first_open_type: disableIntervalOpen && prev.first_open_type === 2 ? 1 : prev.first_open_type
        }))

        // 重置 toggles
        setToggles({
          multiple_visible: false,
          multiple: '1',
          posSide_set_visible: false,
          fast_mode_visible: true,
          trade_trigger_visible: false,
          tp_trigger_px: '0',
          sl_trigger_px: '0',
          pos_visible: false,
          pos_value: 'long',
          vol24h_visible: false,
          vol24h_num: '0',
          balance_monitor_visible: false,
          balance_monitor_value: '0',
          white_list_visible: false,
          white_list: [],
          black_list_visible: false,
          black_list: []
        })
      }

      // 如果没有传入初始本金，且也不是复制任务或者复制任务没有金额，则尝试自动获取交易员本金
      if (!initialBenchMark && (!initialTaskData || !initialTaskData.benchMark)) {
        fetchBenchMark(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, traderId, platform, hideFollowLeverage, disableIntervalOpen, initialBenchMark, initialTaskData])

  const followRatioPreview =
    formData.follow_type === '2'
      ? buildFollowRatioPreview(
          formData.investment,
          formData.benchMark,
          toggles.multiple_visible,
          toggles.multiple,
          t('summary.labels.ratio'),
          {
            empty: t('ratioPreview.emptyHint'),
            investmentInvalid: t('ratioPreview.investmentInvalid'),
            benchMarkInvalid: t('ratioPreview.benchMarkInvalid'),
            multipleInvalid: t('ratioPreview.multipleInvalid')
          }
        )
      : null

  const selectedApi = apiOptions.find(api => String(api.id) === formData.api_id)
  const selectedApiName =
    selectedApi?.api_name ||
    (formData.api_id ? t('apiSelect.fallbackName', { id: formData.api_id }) : t('apiSelect.unselected'))

  const configSummaryItems = buildConfigSummary({
    t,
    traderName,
    traderId,
    apiName: selectedApiName,
    formData,
    toggles,
    followRatioPreview
  })

  const configSummaryBrief = buildConfigSummaryBrief(configSummaryItems, t)

  const jumpToSummaryItem = (tab?: 'basic' | 'advanced') => {
    if (tab) {
      setActiveTab(tab)
    }
    setSummaryDetailOpen(false)
  }

  const handleSubmit = async () => {
    if (!agreedToProtocol) {
      toast.error(t('toast.agreeProtocolFirst'))
      return
    }

    if (!summaryViewed) {
      setSummaryDetailOpen(true)
      setSummaryViewed(true)
      toast.error(t('toast.reviewConfigFirst'))

      return
    }

    setIsLoading(true)

    try {
      const hasNotification = await hasAnyNotificationConfigured()
      if (!hasNotification) {
        toast.error(t('toast.notifyRequired'))
        onClose()
        router.push('/dashboard/notifications')
        return
      }

      const payload = {
        trader_platform: traderPlatform,
        uniqueName: buildUniqueName(traderId || '', cookieId, traderPlatform),
        label: formData.label || '',
        api: formData.api_id,
        follow_type: formData.follow_type,
        multiple: toggles.multiple_visible ? toggles.multiple : '1',
        sums: '0',
        ratio: '0',
        lever_set: String(formData.lever_set),
        leverage: String(formData.lever_set) === '2' && formData.leverage ? formData.leverage : '1',
        margin_mode_set: String(formData.margin_mode_set),
        first_open_type: disableIntervalOpen ? '1' : String(formData.first_open_type),
        uplRatio: formData.uplRatio,
        first_order_set: String(formData.first_order_set),
        posSide_set: toggles.posSide_set_visible ? '2' : '1',
        role_type: mappedRoleType,
        reduce_ratio: '0',
        fast_mode: toggles.fast_mode_visible ? '1' : '0',
        benchMark: formData.benchMark,
        investment: formData.investment,
        trade_trigger_mode: toggles.trade_trigger_visible ? '1' : '0',
        sl_trigger_px: toggles.trade_trigger_visible ? toggles.sl_trigger_px : '0',
        tp_trigger_px: toggles.trade_trigger_visible ? toggles.tp_trigger_px : '0',
        pos_mode: toggles.pos_visible ? '1' : '0',
        pos_value: toggles.pos_visible ? toggles.pos_value : '',
        vol24h_mode: toggles.vol24h_visible ? '1' : '0',
        vol24h_num: toggles.vol24h_num,
        balance_monitor_mode: toggles.balance_monitor_visible ? '1' : '0',
        balance_monitor_value: toggles.balance_monitor_value,
        white_list_mode: toggles.white_list_visible ? '1' : '0',
        white_list: toggles.white_list_visible ? toggles.white_list : [],
        black_list_mode: toggles.black_list_visible ? '1' : '0',
        black_list: toggles.black_list_visible ? toggles.black_list : []
      }

      console.log('Submitting Task Config:', payload)
      const res = await addTask(payload)

      if (res.code === 0) {
        toast.success(res.msg || t('toast.createSuccess'))

        // 刷新全局权益信息，同步剩余跟单任务额度
        try {
          const profile = await settingsApi.getEntitlementProfile()

          if (profile) {
            localStorage.setItem('entitlementProfile', JSON.stringify(profile))
            window.dispatchEvent(new Event('entitlementProfileUpdated'))
          }
        } catch (err) {
          console.error('Failed to fetch entitlement profile after adding task:', err)
        }

        onClose()

        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/dashboard/task_list')
        }
      } else {
        // request method automatically handles toast
        setIsLoading(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const normalizedPlatform = String(platform || '').toLowerCase()
  const normalizedRoleType = String(roleType || '').toLowerCase()
  const normalizedTraderPlatform = String(traderPlatform || '').toLowerCase()

  const isApiFollow =
    normalizedRoleType === 'api' ||
    normalizedPlatform === 'api' ||
    normalizedTraderPlatform === '5' ||
    normalizedTraderPlatform === '6'

  const isHotFollow =
    normalizedPlatform === 'hot' ||
    normalizedPlatform === '4' ||
    normalizedTraderPlatform === '4'

  const isHyperliquidFollow =
    normalizedPlatform === 'hyperliquid' ||
    normalizedPlatform === 'hyper' ||
    normalizedTraderPlatform === '10'

  const isBicoinFollow =
    normalizedPlatform === 'bicoin' ||
    normalizedTraderPlatform === '3'

  const isBinanceFollow =
    normalizedPlatform === 'binance' ||
    normalizedTraderPlatform === '2' ||
    normalizedTraderPlatform === '5' ||
    normalizedTraderPlatform === '7'

  const isOkxFollow =
    normalizedPlatform === 'okx' ||
    normalizedTraderPlatform === '1' ||
    normalizedTraderPlatform === '6' ||
    normalizedTraderPlatform === '8'

  const isCookieFollow = normalizedPlatform === 'cookie' || normalizedTraderPlatform === '7' || normalizedTraderPlatform === '8'
  const isRoleTypeTwo = normalizedRoleType === '2'

  const allCopyApi = !isApiFollow && !isHotFollow && (
    isHyperliquidFollow ||
    isOkxFollow ||
    isCookieFollow ||
    (isBinanceFollow && !isRoleTypeTwo) ||
    (isBicoinFollow && normalizedRoleType !== '1')
  )

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent side='right' className='flex flex-col p-0 sm:max-w-lg' {...tourSafeDialogProps}>
        <SheetHeader className='px-6 pt-6 pb-2'>
          <div className='flex items-start justify-between gap-2 pr-6'>
            <div className='min-w-0'>
              <SheetTitle>
                {t('sheet.titleWithName', { name: traderName || traderId || '' })}
              </SheetTitle>
              <SheetDescription>{t('sheet.description')}</SheetDescription>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 shrink-0 gap-1.5 px-2 text-xs font-semibold'
              onClick={() => startTourById(TOUR_IDS.taskConfigGuide)}
            >
              <CircleHelp className='size-4' />
              {t('sheet.guide')}
            </Button>
          </div>
        </SheetHeader>

        <div className='px-6 pb-1' {...tourAnchor(TOUR_ANCHORS.taskNotifyStatus)}>
          <div className='bg-muted/40 flex items-center justify-between rounded-md border px-3 py-2 text-xs'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground'>{t('notify.statusLabel')}</span>
              {notificationStatus.loading ? (
                <span className='text-muted-foreground'>{t('notify.checking')}</span>
              ) : notificationStatus.configured ? (
                <span className='font-medium text-green-600'>{t('notify.configured')}</span>
              ) : (
                <span className='font-medium text-red-600'>{t('notify.notConfigured')}</span>
              )}
            </div>
            <button
              type='button'
              className='text-primary hover:underline'
              onClick={() => {
                onClose()
                router.push('/dashboard/notifications')
              }}
            >
              {t('notify.goConfig')}
            </button>
          </div>
        </div>

        {/* tab选择：基础设置（默认）和高级设置 */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className='flex h-full flex-1 flex-col overflow-hidden'>
          <div className='px-6'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='basic'>{t('tabs.basic')}</TabsTrigger>
              <TabsTrigger value='advanced'>{t('tabs.advanced')}</TabsTrigger>
            </TabsList>
          </div>

          <div className='flex-1 overflow-y-auto px-6 py-4'>
            <TabsContent value='basic' className='mt-0 space-y-6'>
              {/* 选择跟单 API */}
              <div {...tourAnchor(TOUR_ANCHORS.taskApiSelect)}>
                <div className='mb-2 text-sm font-medium'>{t('apiSelect.label')}</div>
                {apiOptions.length === 0 ? (
                  <div className='bg-muted/40 flex items-center justify-between rounded-md border px-3 py-2 text-xs'>
                    <span className='text-muted-foreground'>{t('apiSelect.empty')}</span>
                    <button
                      type='button'
                      className='text-primary hover:underline'
                      onClick={() => {
                        onClose()
                        router.push('/dashboard/api')
                      }}
                    >
                      {t('apiSelect.goAdd')}
                    </button>
                  </div>
                ) : (
                  <div className='flex flex-wrap gap-2'>
                    {apiOptions.map(api => {
                      const apiId = String(api.id)
                      const active = formData.api_id === apiId
                      const exchangeLogo = getApiExchangeLogo(api.platform ?? api.exchange)

                      return (
                        <button
                          key={api.id}
                          type='button'
                          className={`rounded-md border px-3 py-2 text-left transition-colors ${
                            active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'
                          }`}
                          onClick={() => updateForm('api_id', apiId)}
                        >
                          <div className='flex items-center gap-2'>
                            {exchangeLogo ? (
                              <img src={exchangeLogo} alt='' className='h-4 w-4 shrink-0 rounded-sm object-contain' />
                            ) : null}
                            <span
                              className={`text-xs font-medium ${active ? 'text-primary-foreground' : 'text-foreground'}`}
                            >
                              {api.api_name || t('apiSelect.fallbackName', { id: api.id })}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <label className='mb-2 block text-sm font-medium'>{t('label.label')}</label>
                <Input
                  value={formData.label}
                  onChange={e => updateForm('label', e.target.value)}
                  maxLength={64}
                  placeholder={t('label.placeholder')}
                />
              </div>

              {/* 跟单模式 */}
              <div className='space-y-2' {...tourAnchor(TOUR_ANCHORS.taskFollowMode)}>
                <label className='mb-2 block text-sm font-medium'>{t('followMode.label')}</label>
                <div className='flex items-center gap-4'>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.follow_type === '2'}
                      onCheckedChange={checked => {
                        if (checked) updateForm('follow_type', '2')
                      }}
                    />
                    <div className='flex items-center gap-1'>
                      <span className='text-sm'>{t('followMode.fixedRatio')}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CircleHelp className='text-muted-foreground h-4 w-4' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-[240px]'>
                            <p>{t('followMode.tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </label>
                </div>
              </div>

              {/* 倍投模式 */}
              {formData.follow_type === '2' && (
                <div className='bg-muted/20 rounded-md border p-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1'>
                      <div className='text-sm font-medium'>{t('multiple.title')}</div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CircleHelp className='text-muted-foreground h-4 w-4' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-[240px]'>
                            <p>{t('multiple.tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      checked={toggles.multiple_visible}
                      onCheckedChange={(val: boolean) => updateToggle('multiple_visible', val)}
                    />
                  </div>
                  {toggles.multiple_visible && (
                    <div className='animate-in fade-in mt-4 space-y-2'>
                      <label className='mb-2 block text-sm font-medium'>{t('multiple.label')}</label>
                      <Input
                        type='number'
                        min='0.01'
                        step='0.1'
                        value={toggles.multiple}
                        onChange={e => updateToggle('multiple', e.target.value)}
                        placeholder={t('multiple.placeholder')}
                      />
                      <p className='mt-1 text-xs font-medium text-red-500'>{t('multiple.warning')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 本金与投资额 */}
              <div className='space-y-4'>
                <div className='space-y-2' {...tourAnchor(TOUR_ANCHORS.taskBenchmark)}>
                  <label className='mb-2 block text-sm font-medium'>{t('benchMark.label')}</label>
                  <div className='flex gap-2'>
                    <Input
                      value={formData.benchMark}
                      onChange={e => updateForm('benchMark', e.target.value)}
                      placeholder={t('benchMark.placeholder')}
                    />
                    <Button variant='secondary' className='px-3' onClick={() => fetchBenchMark()}>
                      {t('benchMark.autoFetch')}
                    </Button>
                  </div>
                  {initialTaskData && (
                    <div className='rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200'>
                      {t('benchMark.keepHint')}
                    </div>
                  )}
                </div>

                {formData.follow_type === '2' && (
                  <div className='space-y-2' {...tourAnchor(TOUR_ANCHORS.taskInvestment)}>
                    <label className='mb-2 block text-sm font-medium'>{t('investment.label')}</label>
                    <Input
                      value={formData.investment}
                      onChange={e => updateForm('investment', e.target.value)}
                      placeholder={t('investment.placeholder')}
                    />
                  </div>
                )}

                {followRatioPreview && (
                  <div
                    className='bg-muted/40 rounded-md border px-3 py-2 text-xs leading-relaxed'
                    {...tourAnchor(TOUR_ANCHORS.taskRatioPreview)}
                  >
                    {followRatioPreview.ready ? (
                      <>
                        <div className='text-muted-foreground mb-1'>{t('ratioPreview.title')}</div>
                        <div className='text-foreground font-medium'>{followRatioPreview.formula}</div>
                        {!toggles.multiple_visible && (
                          <div className='text-muted-foreground mt-1'>{t('ratioPreview.multipleOffHint')}</div>
                        )}
                        {followRatioPreview.lowRatioWarning && (
                          <div className='mt-2 font-medium text-amber-600'>{t('ratioPreview.lowRatioWarning')}</div>
                        )}
                      </>
                    ) : (
                      <span className='text-muted-foreground'>{followRatioPreview.hint}</span>
                    )}
                  </div>
                )}
              </div>

              {/* 杠杆模式 */}
              <div className='space-y-2' {...tourAnchor(TOUR_ANCHORS.taskLeverage)}>
                <label className='mb-2 block text-sm font-medium'>{t('leverage.label')}</label>
                <div className='flex items-center gap-4'>
                  {!hideFollowLeverage && (
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={formData.lever_set === 1}
                        onCheckedChange={checked => {
                          if (checked) updateForm('lever_set', 1)
                        }}
                      />
                      <span className='text-sm'>{t('leverage.follow')}</span>
                    </label>
                  )}
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.lever_set === 2}
                      onCheckedChange={checked => {
                        if (checked) updateForm('lever_set', 2)
                      }}
                    />
                    <div className='flex items-center gap-1'>
                      <span className='text-sm'>{t('leverage.custom')}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CircleHelp className='text-muted-foreground h-4 w-4' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-[240px]'>
                            <p>{t('leverage.customTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </label>
                </div>
              </div>

              {formData.lever_set === 2 && (
                <div className='animate-in fade-in space-y-2'>
                  <label className='mb-2 block text-sm font-medium'>{t('leverage.valueLabel')}</label>
                  <Input
                    type='number'
                    min='1'
                    max='75'
                    value={formData.leverage}
                    onChange={e => updateForm('leverage', e.target.value)}
                    placeholder={t('leverage.valuePlaceholder')}
                  />
                </div>
              )}

              {/* 保证金模式 */}
              <div className='space-y-2'>
                <label className='mb-2 block text-sm font-medium'>{t('marginMode.label')}</label>
                <div className='flex flex-wrap gap-3'>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.margin_mode_set === 0}
                      onCheckedChange={checked => {
                        if (checked) updateForm('margin_mode_set', 0)
                      }}
                    />
                    <span className='text-sm'>{t('marginMode.follow')}</span>
                  </label>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.margin_mode_set === 1}
                      onCheckedChange={checked => {
                        if (checked) updateForm('margin_mode_set', 1)
                      }}
                    />
                    <span className='text-sm'>{t('marginMode.cross')}</span>
                  </label>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.margin_mode_set === 2}
                      onCheckedChange={checked => {
                        if (checked) updateForm('margin_mode_set', 2)
                      }}
                    />
                    <span className='text-sm'>{t('marginMode.isolated')}</span>
                  </label>
                </div>
                <p className='text-muted-foreground text-xs'>{t('marginMode.hint')}</p>
              </div>

              {/* 开仓模式 */}
              <div className='space-y-2'>
                <label className='mb-2 block text-sm font-medium'>{t('openType.label')}</label>
                <div className='flex items-center gap-4'>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.first_open_type === 1}
                      onCheckedChange={checked => {
                        if (checked) updateForm('first_open_type', 1)
                      }}
                    />
                    <span className='text-sm'>{t('openType.market')}</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 ${disableIntervalOpen ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <Checkbox
                      checked={formData.first_open_type === 2}
                      disabled={disableIntervalOpen}
                      onCheckedChange={checked => {
                        if (checked) updateForm('first_open_type', 2)
                      }}
                    />
                    <div className='flex items-center gap-1'>
                      <span className='text-sm'>{t('openType.interval')}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CircleHelp className='text-muted-foreground h-4 w-4' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-[240px]'>
                            <p>{t('openType.intervalTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </label>
                </div>
              </div>

              {formData.first_open_type === 2 && (
                <div className='animate-in fade-in space-y-2'>
                  <label className='mb-2 block text-sm font-medium'>{t('openType.rangeLabel')}</label>
                  <Input
                    value={formData.uplRatio}
                    onChange={e => updateForm('uplRatio', e.target.value)}
                    placeholder={t('openType.rangePlaceholder')}
                  />
                  <p className='text-muted-foreground text-xs'>{t('openType.rangeHint')}</p>
                </div>
              )}

              {/* 首单交易设置 */}
              <div className='space-y-2'>
                <label className='mb-2 block text-sm font-medium'>{t('firstOrder.label')}</label>
                <div className='flex flex-col gap-2'>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.first_order_set === 1}
                      onCheckedChange={checked => {
                        if (checked) updateForm('first_order_set', 1)
                      }}
                    />
                    <span className='text-sm'>{t('firstOrder.newOnly')}</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 ${!allCopyApi ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <Checkbox
                      checked={formData.first_order_set === 2}
                      disabled={!allCopyApi}
                      onCheckedChange={checked => {
                        if (checked) updateForm('first_order_set', 2)
                      }}
                    />
                    <span className='text-sm'>{t('firstOrder.copyCurrent')}</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 ${!allCopyApi ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <Checkbox
                      checked={formData.first_order_set === 3}
                      disabled={!allCopyApi}
                      onCheckedChange={checked => {
                        if (checked) updateForm('first_order_set', 3)
                      }}
                    />
                    <span className='text-sm'>{t('firstOrder.copyLossOnly')}</span>
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='advanced' className='mt-0 space-y-4'>
              <div className='flex items-center justify-between rounded-md border p-3'>
                <div className='text-sm font-medium'>{t('advanced.reverse')}</div>
                <Switch
                  checked={toggles.posSide_set_visible}
                  onCheckedChange={(v: boolean) => updateToggle('posSide_set_visible', v)}
                />
              </div>

              <div className='flex items-center justify-between rounded-md border p-3'>
                <div className='text-sm font-medium'>{t('advanced.fastMode')}</div>
                <Switch
                  checked={toggles.fast_mode_visible}
                  onCheckedChange={(v: boolean) => updateToggle('fast_mode_visible', v)}
                />
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>{t('advanced.tradeTrigger.title')}</div>
                  <Switch
                    checked={toggles.trade_trigger_visible}
                    onCheckedChange={(v: boolean) => updateToggle('trade_trigger_visible', v)}
                  />
                </div>
                {toggles.trade_trigger_visible && (
                  <div className='animate-in fade-in mt-4 grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>{t('advanced.tradeTrigger.tpLabel')}</label>
                      <Input
                        value={toggles.tp_trigger_px}
                        onChange={e => updateToggle('tp_trigger_px', e.target.value)}
                        placeholder={t('advanced.tradeTrigger.placeholder')}
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>{t('advanced.tradeTrigger.slLabel')}</label>
                      <Input
                        value={toggles.sl_trigger_px}
                        onChange={e => updateToggle('sl_trigger_px', e.target.value)}
                        placeholder={t('advanced.tradeTrigger.placeholder')}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>{t('advanced.posStrategy.title')}</div>
                  <Switch
                    checked={toggles.pos_visible}
                    onCheckedChange={(v: boolean) => updateToggle('pos_visible', v)}
                  />
                </div>
                {toggles.pos_visible && (
                  <div className='animate-in fade-in mt-4 flex items-center gap-4'>
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={toggles.pos_value === 'long'}
                        onCheckedChange={checked => {
                          if (checked) updateToggle('pos_value', 'long')
                        }}
                      />
                      <span className='text-sm'>{t('advanced.posStrategy.long')}</span>
                    </label>
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={toggles.pos_value === 'short'}
                        onCheckedChange={checked => {
                          if (checked) updateToggle('pos_value', 'short')
                        }}
                      />
                      <span className='text-sm'>{t('advanced.posStrategy.short')}</span>
                    </label>
                  </div>
                )}
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>{t('advanced.vol24h.title')}</div>
                  <Switch
                    checked={toggles.vol24h_visible}
                    onCheckedChange={(v: boolean) => updateToggle('vol24h_visible', v)}
                  />
                </div>
                {toggles.vol24h_visible && (
                  <div className='animate-in fade-in mt-4 space-y-2'>
                    <label className='text-sm font-medium'>{t('advanced.vol24h.rankLabel')}</label>
                    <Input
                      value={toggles.vol24h_num}
                      onChange={e => updateToggle('vol24h_num', e.target.value)}
                      placeholder={t('advanced.vol24h.placeholder')}
                    />
                  </div>
                )}
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>{t('advanced.balanceMonitor.title')}</div>
                  <Switch
                    checked={toggles.balance_monitor_visible}
                    onCheckedChange={(v: boolean) => updateToggle('balance_monitor_visible', v)}
                  />
                </div>
                {toggles.balance_monitor_visible && (
                  <div className='animate-in fade-in mt-4 space-y-2'>
                    <label className='text-sm font-medium'>{t('advanced.balanceMonitor.valueLabel')}</label>
                    <Input
                      value={toggles.balance_monitor_value}
                      onChange={e => updateToggle('balance_monitor_value', e.target.value)}
                      placeholder={t('advanced.balanceMonitor.placeholder')}
                    />
                  </div>
                )}
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>{t('advanced.whiteList.title')}</div>
                  <Switch
                    checked={toggles.white_list_visible}
                    onCheckedChange={(v: boolean) => updateToggle('white_list_visible', v)}
                  />
                </div>
                {toggles.white_list_visible && (
                  <div className='animate-in fade-in mt-4 space-y-2'>
                    <label className='text-sm font-medium'>{t('advanced.whiteList.inputLabel')}</label>
                    <TagInput
                      tags={toggles.white_list}
                      onChange={handleWhiteListChange}
                      placeholder={`${t('advanced.whiteList.placeholder')}${t('tagInput.hint')}`}
                    />
                  </div>
                )}
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>{t('advanced.blackList.title')}</div>
                  <Switch
                    checked={toggles.black_list_visible}
                    onCheckedChange={(val: boolean) => updateToggle('black_list_visible', val)}
                  />
                </div>
                {toggles.black_list_visible && (
                  <div className='animate-in fade-in mt-4 space-y-2'>
                    <label className='text-sm font-medium'>{t('advanced.blackList.inputLabel')}</label>
                    <TagInput
                      tags={toggles.black_list}
                      onChange={handleBlackListChange}
                      placeholder={`${t('advanced.blackList.placeholder')}${t('tagInput.hint')}`}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <SheetFooter className='bg-background/95 supports-[backdrop-filter]:bg-background/60 relative z-50 shrink-0 flex-col gap-3 border-t p-4 backdrop-blur sm:flex-col'>
          <div className='bg-muted/30 relative w-full rounded-md border px-3 py-2'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-muted-foreground min-w-0 truncate text-xs' title={configSummaryBrief}>
                {configSummaryBrief}
              </span>
              <button
                type='button'
                className='text-primary shrink-0 text-xs hover:underline'
                onClick={() => {
                  setSummaryViewed(true)
                  setSummaryDetailOpen(prev => !prev)
                }}
              >
                {summaryDetailOpen ? t('summary.collapse') : t('summary.viewDetail')}
              </button>
            </div>
            {summaryDetailOpen && (
              <div className='bg-background absolute right-0 bottom-full left-0 z-50 mb-2 max-h-72 overflow-y-auto rounded-md border px-3 py-3 shadow-lg'>
                <div className='mb-2 text-sm font-medium'>{t('summary.confirmTitle')}</div>
                <ConfigSummaryDetailList
                  items={configSummaryItems}
                  onJumpToItem={jumpToSummaryItem}
                  modifyLabel={t('summary.modify')}
                />
              </div>
            )}
          </div>

          <label className='flex w-full cursor-pointer items-start gap-2' {...tourAnchor(TOUR_ANCHORS.taskProtocol)}>
            <Checkbox
              checked={agreedToProtocol}
              onCheckedChange={checked => setAgreedToProtocol(checked === true)}
              className='mt-0.5'
            />
            <span className='text-muted-foreground text-sm leading-snug'>
              {t('protocolAgree.prefix')}
              <button
                type='button'
                className='text-primary hover:underline'
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  setProtocolDialogOpen(true)
                }}
              >
                {t('protocolAgree.linkText')}
              </button>
            </span>
          </label>
          <div className='flex w-full justify-end gap-2' {...tourAnchor(TOUR_ANCHORS.taskSubmit)}>
            <Button variant='outline' onClick={onClose} disabled={isLoading}>
              {t('footer.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                !agreedToProtocol ||
                !formData.api_id ||
                !formData.investment ||
                (formData.lever_set === 2 && !formData.leverage)
              }
            >
              {isLoading ? t('footer.submitting') : t('footer.submit')}
            </Button>
          </div>
        </SheetFooter>
        <CopyTradeProtocolDialog open={protocolDialogOpen} onOpenChange={setProtocolDialogOpen} />
      </SheetContent>
    </Sheet>
  )
}
