import type { TaskLogItem } from './types'

type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string

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

const EVENT_CODE_TERMINATION_REASON_KEY: Record<string, string> = {
  leader_close_requested: 'leader_positions_hidden_or_closed',
  leader_positions_hidden_or_closed: 'leader_positions_hidden_or_closed',
  task_manual_stopped: 'manual_stop',
  manual_stop: 'manual_stop',
  cookie_auth_expired: 'cookie_auth_expired',
  token_expired_auto_close: 'token_expired_auto_close',
  crawler_auto_stop_fetch_failure: 'crawler_auto_stop_fetch_failure',
  task_terminated_manual_close_required: 'task_terminated_manual_close_required',
  task_follow_terminated_manual_close_required: 'task_follow_terminated_manual_close_required'
}

const KNOWN_REASON_KEYS = new Set([
  'target_volume_rounded_to_zero',
  'leader_positions_hidden_or_closed',
  'cookie_auth_expired',
  'token_expired_auto_close',
  'crawler_auto_stop_fetch_failure',
  'manual_stop',
  'task_terminated_manual_close_required',
  'task_follow_terminated_manual_close_required'
])

const ACTION_CODE_FROM_LEGACY: Record<string, string> = {
  开仓: 'open',
  加仓: 'add',
  减仓: 'reduce',
  平仓: 'close',
  变更: 'change'
}

const RESULT_CODE_FROM_LEGACY: Record<string, string> = {
  成功: 'success',
  失败: 'failed',
  提示: 'info'
}

function normalizeActionCode(actionTag: string) {
  const raw = String(actionTag || '').trim()
  return (ACTION_CODE_FROM_LEGACY[raw] || raw).toLowerCase()
}

function normalizeResultCode(resultTag: string) {
  const raw = String(resultTag || '').trim()
  return (RESULT_CODE_FROM_LEGACY[raw] || raw).toLowerCase()
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
  const action = normalizeActionCode(actionTag)
  if (action === 'open' || action === 'add') {
    return 'rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  }
  if (action === 'reduce' || action === 'close') {
    return 'rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
  }
  return 'rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
}

export function getResultTagClass(resultTag: string) {
  const result = normalizeResultCode(resultTag)
  if (result === 'success') {
    return 'rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  }
  if (result === 'info') {
    return 'rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
  }
  return 'rounded bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
}

export function createTaskLogFormatters(t: TranslateFn) {
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
    if (KNOWN_REASON_KEYS.has(key)) {
      return t(`logs.reasons.${key}`)
    }
    return key
  }

  const isTerminationEvent = (eventCode: string) => TERMINATION_EVENT_CODES.has(eventCode)

  // 保留对后端中文描述的识别兜底
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
    const mappedKey = EVENT_CODE_TERMINATION_REASON_KEY[eventCode]
    if (mappedKey) {
      return t(`logs.reasons.${mappedKey}`)
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
  ) => t('logs.desc.terminationReason', { reason: resolveTerminationReason(eventCode, payload, item) })

  const formatTradeTerminationDescription = () => t('logs.desc.tradeTermination')

  const formatLogTitle = (item: TaskLogItem) => {
    const payload = (item.log_payload || {}) as Record<string, unknown>
    const eventCode = asText(item?.event_code, asText(payload['event_code'], ''))
    const payloadUniqueName = asText(payload['unique_name'], asText(item?.unique_name, ''))

    if (isTerminationEvent(eventCode)) {
      return t('logs.titles.followEnded')
    }

    if (eventCode === 'trader_position_changed') {
      const signal = asText(payload['signal_type'], '').toLowerCase()
      if (signal === 'open') {
        return payloadUniqueName
          ? t('logs.titles.traderOpen', { name: payloadUniqueName })
          : t('logs.titles.traderOpenNoName')
      }
      if (signal === 'add') {
        return payloadUniqueName
          ? t('logs.titles.traderAdd', { name: payloadUniqueName })
          : t('logs.titles.traderAddNoName')
      }
      if (signal === 'reduce') {
        return payloadUniqueName
          ? t('logs.titles.traderReduce', { name: payloadUniqueName })
          : t('logs.titles.traderReduceNoName')
      }
      if (signal === 'close') {
        return payloadUniqueName
          ? t('logs.titles.traderClose', { name: payloadUniqueName })
          : t('logs.titles.traderCloseNoName')
      }
      return payloadUniqueName
        ? t('logs.titles.traderChange', { name: payloadUniqueName })
        : t('logs.titles.traderChangeNoName')
    }

    if (eventCode === 'signal_rejected_precision_too_small') {
      return t('logs.titles.signalRejected')
    }
    if (eventCode === 'target_volume_rounded_to_zero') {
      return t('logs.titles.tradeFailed')
    }
    if (eventCode === 'task_command_publish_failed') {
      return t('logs.titles.commandPublishFailed')
    }

    return asText(item?.title, t('logs.titles.fallback'))
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
      return asText(item?.description, asText(item?.title, t('logs.desc.noDetail')))
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
          return t('logs.desc.positionOpen', {
            tradeVolume,
            positionVolume,
            uplRatio,
            openConditionMet: openConditionMet ? t('params.values.yes') : t('params.values.no')
          })
        }
        if (signal === 'add' || signal === 'reduce' || signal === 'close') {
          return t('logs.desc.positionDelta', {
            tradeVolume,
            positionVolume
          })
        }
        return t('logs.desc.positionChangedGeneric', {
          instId: ctx.payloadInstId,
          posSide: ctx.payloadPosSide,
          signalType: ctx.payloadSignalType
        })
      },
      signal_rejected_precision_too_small: (ctx) =>
        t('logs.desc.signalRejected', {
          instId: ctx.payloadInstId,
          posSide: ctx.payloadPosSide,
          signalType: ctx.payloadSignalType
        }),
      target_volume_rounded_to_zero: (ctx) =>
        t('logs.desc.tradeFailed', {
          instId: ctx.payloadInstId,
          posSide: ctx.payloadPosSide,
          signalType: ctx.payloadSignalType,
          traderPositionSize: ctx.asNumberText(ctx.payload['trader_position_size'])
        }),
      task_command_publish_failed: (ctx) =>
        t('logs.desc.commandPublishFailed', {
          instId: ctx.payloadInstId,
          posSide: ctx.payloadPosSide,
          signalType: ctx.payloadSignalType,
          traderPositionSize: ctx.asNumberText(ctx.payload['trader_position_size']),
          streamError: ctx.asText(ctx.payload['publish_error'], '-'),
          legacyError: ctx.asText(ctx.payload['legacy_error'], '-')
        })
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

    return asText(item?.description, asText(item?.title, t('logs.desc.noDetail')))
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
      open: 'open',
      add: 'add',
      reduce: 'reduce',
      close: 'close'
    }
    return {
      main: instId,
      sideTag: side,
      actionTag: actionMap[signal] || 'change'
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
        instId: t('logs.titles.followEnded'),
        side: '',
        resultTag: ''
      }
    }
    return {
      instId: asText(payload['inst_id'], asText(item?.inst_id, '-')),
      side: asText(payload['pos_side'], asText(item?.pos_side, '')).toUpperCase(),
      resultTag: isTradeFailedLog(item) ? 'failed' : 'success'
    }
  }

  const formatLeverageWarningLine = (payload: Record<string, unknown>) => {
    const warning = payload['leverage_warning']
    if (!warning || typeof warning !== 'object') return ''
    const reason = asText((warning as Record<string, unknown>)['reason'], '')
    return reason ? t('logs.desc.leverageWarning', { reason }) : ''
  }

  const formatTradeLogDescription = (item: TaskLogItem) => {
    const payload = (item.log_payload || {}) as Record<string, unknown>
    const eventCode = asText(item?.event_code, asText(payload['event_code'], ''))
    if (isTerminationEvent(eventCode) || isFollowTradeTerminationLog(item)) {
      return formatTradeTerminationDescription()
    }
    const exchange = asText(payload['exchange'], '-')
    const volume = asNumberText(payload['delta_pos'], asNumberText(payload['trader_position_size'], '-'))
    const leverageWarningLine = formatLeverageWarningLine(payload)
    if (isTradeFailedLog(item)) {
      const rawReason = asText(payload['reason'], asText(item?.reason, asText(item?.description, '-')))
      const reason = localizeReason(rawReason)
      return (
        t('logs.desc.tradeFailedFull', { exchange, volume, reason }) + leverageWarningLine
      )
    }
    return t('logs.desc.tradeSuccess', { exchange, volume }) + leverageWarningLine
  }

  return {
    formatLogDescription,
    formatLogTitleMeta,
    formatTradeLogTitleMeta,
    formatTradeLogDescription
  }
}
