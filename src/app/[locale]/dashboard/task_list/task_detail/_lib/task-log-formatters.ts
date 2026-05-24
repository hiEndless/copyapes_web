import type { TaskLogItem } from './types'

type LogFormatContext = {
  payload: Record<string, unknown>
  payloadUniqueName: string
  payloadInstId: string
  payloadPosSide: string
  payloadSignalType: string
  payloadReason: string
  asText: (v: unknown, fallback?: string) => string
  asNumberText: (v: unknown, fallback?: string) => string
}

const TERMINATION_EVENT_CODES = new Set([
  'leader_close_requested',
  'leader_positions_hidden_or_closed',
  'task_manual_stopped',
  'manual_stop',
  'task_stopped',
  'cookie_auth_expired',
  'token_expired_auto_close',
  'crawler_auto_stop_fetch_failure',
  'task_terminated_manual_close_required',
  'task_follow_terminated_manual_close_required'
])

const EVENT_CODE_TERMINATION_REASON: Record<string, string> = {
  leader_close_requested: '交易员已关闭带单项目或隐藏了仓位',
  leader_positions_hidden_or_closed: '交易员已关闭带单项目或隐藏了仓位',
  task_manual_stopped: '用户手动终止',
  manual_stop: '用户手动终止',
  cookie_auth_expired: 'Cookie已过期，请重新获取后再跟单',
  token_expired_auto_close: 'IP和TOKEN过期，任务自动终止',
  crawler_auto_stop_fetch_failure: '爬虫自动停机（连续抓取失败）',
  task_terminated_manual_close_required: '任务已结束，需手动平仓',
  task_follow_terminated_manual_close_required: '任务已结束，需手动平仓'
}

export function getColorClass(color: string | undefined) {
  if (color === 'SUCCESS' || color === 'green') return 'bg-green-500'
  if (color === 'WARNING' || color === 'danger') return 'bg-red-500'
  if (color === 'INFO' || color === 'primary') return 'bg-blue-500'

  return 'bg-gray-500'
}

export function getSideTagClass(sideTag: string) {
  const side = String(sideTag || '').toUpperCase()
  if (side === 'LONG') {
    return 'rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  }
  if (side === 'SHORT') {
    return 'rounded bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
  }
  return 'rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
}

export function getActionTagClass(actionTag: string) {
  const action = String(actionTag || '').trim()
  if (action === '开仓' || action === '加仓') {
    return 'rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  }
  if (action === '减仓' || action === '平仓') {
    return 'rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
  }
  return 'rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
}

export function getResultTagClass(resultTag: string) {
  if (resultTag === '成功') {
    return 'rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  }
  if (resultTag === '提示') {
    return 'rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
  }
  return 'rounded bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
}

export function createTaskLogFormatters(locale: string) {
  const asText = (v: unknown, fallback = '-') => {
    const s = String(v ?? '').trim()
    return s || fallback
  }

  const asNumberText = (v: unknown, fallback = '-') => {
    if (v === null || v === undefined || v === '') return fallback
    const n = Number(v)
    return Number.isFinite(n) ? String(n) : fallback
  }

  const localizeReason = (reasonRaw: string) => {
    const key = String(reasonRaw || '').trim()
    if (!key) return '-'
    const lang = locale.toLowerCase().startsWith('en') ? 'en' : 'zh'
    const reasonI18nMap: Record<string, Record<string, string>> = {
      target_volume_rounded_to_zero: {
        zh: '由于币种交易精度限制，交易量过低，无法下单',
        en: 'Order quantity is too small after precision rounding'
      },
      leader_positions_hidden_or_closed: {
        zh: '交易员已关闭带单项目或隐藏了仓位',
        en: 'Trader copy project closed or positions hidden'
      },
      cookie_auth_expired: {
        zh: 'Cookie已过期，请重新获取后再跟单',
        en: 'Cookie authentication expired'
      },
      token_expired_auto_close: {
        zh: 'IP和TOKEN过期，任务自动终止',
        en: 'IP and token expired, task auto-terminated'
      },
      crawler_auto_stop_fetch_failure: {
        zh: '爬虫自动停机（连续抓取失败）',
        en: 'Crawler auto-stopped due to consecutive fetch failures'
      },
      manual_stop: {
        zh: '用户手动终止',
        en: 'Manually stopped by user'
      },
      task_terminated_manual_close_required: {
        zh: '任务已结束，需手动平仓',
        en: 'Task terminated, manual close required'
      }
    }
    return reasonI18nMap[key]?.[lang] || key
  }

  const isTerminationEvent = (eventCode: string) => TERMINATION_EVENT_CODES.has(eventCode)

  const isFollowTradeTerminationLog = (item: TaskLogItem) => {
    const title = asText(item?.title, '')
    if (title === '结束跟单') return true
    const desc = asText(item?.description, '')
    return desc.includes('当前已有持仓不会平仓') || desc.includes('后续请手动平仓')
  }

  const resolveTerminationReason = (
    eventCode: string,
    payload: Record<string, unknown>,
    item: TaskLogItem
  ) => {
    if (EVENT_CODE_TERMINATION_REASON[eventCode]) {
      return EVENT_CODE_TERMINATION_REASON[eventCode]
    }
    const reasonKey = asText(payload['reason'], asText(item?.reason, ''))
    if (reasonKey) {
      const localized = localizeReason(reasonKey)
      if (localized !== '-') return localized
    }
    const localizedEvent = localizeReason(eventCode)
    return localizedEvent !== eventCode ? localizedEvent : asText(item?.description, '-')
  }

  const formatTerminationDescription = (
    eventCode: string,
    payload: Record<string, unknown>,
    item: TaskLogItem
  ) => `结束原因：${resolveTerminationReason(eventCode, payload, item)}`

  const formatTradeTerminationDescription = () => '当前已有持仓不会平仓，后续请手动平仓'

  const formatLogTitle = (item: TaskLogItem) => {
    const payload = (item.log_payload || {}) as Record<string, unknown>
    const eventCode = asText(item?.event_code, asText(payload['event_code'], ''))
    const payloadUniqueName = asText(payload['unique_name'], asText(item?.unique_name, ''))

    if (isTerminationEvent(eventCode)) {
      return '结束跟单'
    }

    const titleMap: Record<string, string> = {
      trader_position_changed: (() => {
        const signal = asText(payload['signal_type'], '').toLowerCase()
        if (signal === 'open') return payloadUniqueName ? `交易员${payloadUniqueName}开仓` : '交易员开仓'
        if (signal === 'add') return payloadUniqueName ? `交易员${payloadUniqueName}加仓` : '交易员加仓'
        if (signal === 'reduce') return payloadUniqueName ? `交易员${payloadUniqueName}减仓` : '交易员减仓'
        if (signal === 'close') return payloadUniqueName ? `交易员${payloadUniqueName}平仓` : '交易员平仓'
        return payloadUniqueName ? `交易员${payloadUniqueName}仓位变更` : '交易员仓位变更'
      })(),
      signal_rejected_precision_too_small: '信号被拦截',
      target_volume_rounded_to_zero: '交易失败',
      task_command_publish_failed: '交易指令投递失败'
    }
    return titleMap[eventCode] || asText(item?.title, '日志')
  }

  const formatLogDescription = (item: TaskLogItem) => {
    const payload = (item.log_payload || {}) as Record<string, unknown>
    const payloadEventCode = asText(payload['event_code'], '')
    const hasPayloadObject = Boolean(item?.log_payload && typeof item.log_payload === 'object')
    const payloadSize = hasPayloadObject ? Object.keys(item.log_payload as Record<string, unknown>).length : 0
    const hasStructured = Boolean(
      (item?.has_structured_log || asText(item?.event_code, '') !== '' || payloadEventCode !== '') &&
        hasPayloadObject &&
        payloadSize > 0
    )
    if (!hasStructured) {
      return asText(item?.description, asText(item?.title, '暂无详情'))
    }

    const eventCode = asText(item?.event_code, payloadEventCode)
    const payloadUniqueName = asText(payload['unique_name'], asText(item?.unique_name, '-'))
    const payloadInstId = asText(payload['inst_id'], asText(item?.inst_id))
    const payloadPosSide = asText(payload['pos_side'], asText(item?.pos_side))
    const payloadSignalType = asText(payload['signal_type'], asText(item?.signal_type))
    const payloadReason = localizeReason(asText(payload['reason'], asText(item?.reason, '-')))

    if (isTerminationEvent(eventCode)) {
      return formatTerminationDescription(eventCode, payload, item)
    }

    const formatters: Record<string, (ctx: LogFormatContext) => string> = {
      trader_position_changed: (ctx) => {
        const signal = String(ctx.payloadSignalType || '').toLowerCase()
        const tradeVolume = ctx.asNumberText(ctx.payload['delta_pos'])
        const positionVolume = ctx.asNumberText(ctx.payload['trader_position_size'])
        if (signal === 'open') {
          const rawUplRatio = ctx.payload['trader_upl_ratio']
          const hasUplRatio = !(rawUplRatio === null || rawUplRatio === undefined || String(rawUplRatio).trim() === '')
          const uplRatio = hasUplRatio ? ctx.asNumberText(rawUplRatio) : '-'
          const rawOpenConditionMet = ctx.payload['open_condition_met']
          const openConditionMet = hasUplRatio ? Boolean(rawOpenConditionMet) : true
          return `交易量：${tradeVolume}
持仓量：${positionVolume}
当前收益率：${uplRatio}
是否满足开仓条件：${openConditionMet ? '是' : '否'}`
        }
        if (signal === 'add' || signal === 'reduce' || signal === 'close') {
          return `交易量：${tradeVolume}
持仓量：${positionVolume}`
        }
        return `交易员仓位变更：${ctx.payloadInstId} ${ctx.payloadPosSide}，信号：${ctx.payloadSignalType}。`
      },
      signal_rejected_precision_too_small: (ctx) =>
        `信号被拦截：${ctx.payloadInstId} ${ctx.payloadPosSide}，信号：${ctx.payloadSignalType}。原因：交易精度限制导致数量过低。`,
      target_volume_rounded_to_zero: (ctx) =>
        `交易失败：${ctx.payloadInstId} ${ctx.payloadPosSide}，信号：${ctx.payloadSignalType}。原因：交易精度限制导致数量过低（交易员仓位量：${ctx.asNumberText(
          ctx.payload['trader_position_size']
        )}）。`,
      task_command_publish_failed: (ctx) =>
        `交易指令投递失败：${ctx.payloadInstId} ${ctx.payloadPosSide}，信号：${ctx.payloadSignalType}，交易员仓位量：${ctx.asNumberText(
          ctx.payload['trader_position_size']
        )}，stream_error=${ctx.asText(ctx.payload['publish_error'], '-')}，legacy_error=${ctx.asText(ctx.payload['legacy_error'], '-')}。`
    }
    const formatter = formatters[eventCode]
    if (formatter) {
      return formatter({
        payload,
        payloadUniqueName,
        payloadInstId,
        payloadPosSide,
        payloadSignalType,
        payloadReason,
        asText,
        asNumberText
      })
    }

    return asText(item?.description, asText(item?.title, '暂无详情'))
  }

  const formatLogTitleMeta = (item: TaskLogItem) => {
    const payload = (item.log_payload || {}) as Record<string, unknown>
    const eventCode = asText(item?.event_code, asText(payload['event_code'], ''))
    if (eventCode !== 'trader_position_changed') {
      return {
        main: formatLogTitle(item),
        sideTag: '',
        actionTag: ''
      }
    }

    const instId = asText(payload['inst_id'], asText(item?.inst_id, '-'))
    const side = asText(payload['pos_side'], asText(item?.pos_side, '')).toUpperCase()
    const signal = asText(payload['signal_type'], asText(item?.signal_type, '')).toLowerCase()
    const actionMap: Record<string, string> = {
      open: '开仓',
      add: '加仓',
      reduce: '减仓',
      close: '平仓'
    }
    return {
      main: instId,
      sideTag: side,
      actionTag: actionMap[signal] || '变更'
    }
  }

  const isTradeFailedLog = (item: TaskLogItem) => {
    const payload = (item.log_payload || {}) as Record<string, unknown>
    const eventCode = asText(item?.event_code, asText(payload['event_code'], ''))
    const failedCodes = new Set(['target_volume_rounded_to_zero', 'task_command_publish_failed'])
    const color = String(item?.color || '').toUpperCase()
    return failedCodes.has(eventCode) || color === 'WARNING' || color === 'DANGER'
  }

  const formatTradeLogTitleMeta = (item: TaskLogItem) => {
    const payload = (item.log_payload || {}) as Record<string, unknown>
    const eventCode = asText(item?.event_code, asText(payload['event_code'], ''))
    if (isTerminationEvent(eventCode) || isFollowTradeTerminationLog(item)) {
      return {
        instId: '结束跟单',
        side: '',
        resultTag: ''
      }
    }
    return {
      instId: asText(payload['inst_id'], asText(item?.inst_id, '-')),
      side: asText(payload['pos_side'], asText(item?.pos_side, '')).toUpperCase(),
      resultTag: isTradeFailedLog(item) ? '失败' : '成功'
    }
  }

  const formatTradeLogDescription = (item: TaskLogItem) => {
    const payload = (item.log_payload || {}) as Record<string, unknown>
    const eventCode = asText(item?.event_code, asText(payload['event_code'], ''))
    if (isTerminationEvent(eventCode) || isFollowTradeTerminationLog(item)) {
      return formatTradeTerminationDescription()
    }
    const exchange = asText(payload['exchange'], '-')
    const volume = asNumberText(payload['delta_pos'], asNumberText(payload['trader_position_size'], '-'))
    if (isTradeFailedLog(item)) {
      const rawReason = asText(payload['reason'], asText(item?.reason, asText(item?.description, '-')))
      const reason = localizeReason(rawReason)
      return `交易所：${exchange}\n交易量：${volume}\n失败原因：${reason}`
    }
    return `交易所：${exchange}\n交易量：${volume}`
  }

  return {
    formatLogDescription,
    formatLogTitleMeta,
    formatTradeLogTitleMeta,
    formatTradeLogDescription
  }
}
