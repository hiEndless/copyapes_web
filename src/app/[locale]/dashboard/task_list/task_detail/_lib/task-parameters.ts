import type { TaskParameterItem } from './types'
import { formatTaskCreatedTime } from '@/lib/task-time'

export type TaskDetailTranslate = (
  key: string,
  values?: Record<string, string | number | Date>
) => string

export function getPlatformName(val: number, t: TaskDetailTranslate) {
  const known = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  if (known.has(val)) {
    return t(`params.platforms.${val}`)
  }

  return t('params.platforms.unknown')
}

export function getFollowType(t: TaskDetailTranslate) {
  return t('params.values.fixedRatio')
}

export function getFirstOrderSetLabel(value: number | string | undefined, t: TaskDetailTranslate) {
  const v = String(value ?? '1')

  if (v === '2') return t('params.firstOrder.copyCurrent')
  if (v === '3') return t('params.firstOrder.copyLossOnly')

  return t('params.firstOrder.newOnly')
}

export function getMarginModeSetLabel(value: number | string | undefined, t: TaskDetailTranslate) {
  const v = String(value ?? '0')

  if (v === '1') return t('params.marginMode.cross')
  if (v === '2') return t('params.marginMode.isolated')

  return t('params.marginMode.follow')
}

export function isDefaultMultiple(value: unknown) {
  const num = Number(value)

  if (!Number.isFinite(num)) return true

  return num === 1
}

export function getRoleType(
  roleType: number | string,
  traderPlatform: number | string,
  t: TaskDetailTranslate
) {
  const rt = String(roleType)
  const tp = String(traderPlatform)

  if (tp === '1' || tp === '6') {
    if (rt === '1') return t('params.roleTypes.okxContract')
    if (rt === '2') return t('params.roleTypes.okxProfile')
  } else if (tp === '8') {
    if (rt === '1') return t('params.roleTypes.okxContract')
    if (rt === '2') return t('params.roleTypes.okxCookieProject')
  } else if (tp === '2' || tp === '5' || tp === '7') {
    if (rt === '1') return t('params.roleTypes.binancePublic')
    if (rt === '2') return t('params.roleTypes.binanceHidden')
    if (rt === '3') return t('params.roleTypes.binanceSmart')
  } else if (tp === '3') {
    if (rt === '1' || rt === '3') return t('params.roleTypes.bicoinOps')
    if (rt === '2' || rt === '4') return t('params.roleTypes.bicoinPosition')
  } else if (tp === '9') {
    return t('params.roleTypes.aiModel')
  } else if (tp === '10') {
    return t('params.roleTypes.wallet')
  }

  return t('params.roleTypes.unknown')
}

export function buildTaskParameterList(
  task: Record<string, unknown>,
  t: TaskDetailTranslate
): TaskParameterItem[] {
  const list: TaskParameterItem[] = []

  list.push({ label: t('params.labels.platform'), value: getPlatformName(task.trader_platform as number, t) })
  list.push({
    label: t('params.labels.trader'),
    value: (String(task.label || '').trim() || task.uniqueName) as string
  })
  list.push({ label: t('params.labels.createdAt'), value: formatTaskCreatedTime(task) })
  list.push({
    label: t('params.labels.reverse'),
    value: String(task.posSide_set) === '1' ? t('params.values.no') : t('params.values.yes')
  })
  list.push({ label: t('params.labels.api'), value: task.api_name as string })
  list.push({
    label: t('params.labels.roleType'),
    value: getRoleType(task.role_type as number | string, task.trader_platform as number | string, t)
  })
  list.push({ label: t('params.labels.followMode'), value: getFollowType(t) })
  if (!isDefaultMultiple(task.multiple)) {
    list.push({ label: t('params.labels.multiple'), value: task.multiple as string | number })
  }
  list.push({ label: t('params.labels.investment'), value: task.investment as string | number })
  list.push({ label: t('params.labels.benchMark'), value: task.benchMark as string | number })
  list.push({
    label: t('params.labels.leverage'),
    value:
      String(task.lever_set) === '1'
        ? t('params.values.followTrader')
        : (task.leverage as string | number)
  })
  list.push({
    label: t('params.labels.marginMode'),
    value: getMarginModeSetLabel(task.margin_mode_set as number | string | undefined, t)
  })
  list.push({
    label: t('params.labels.firstOrder'),
    value: getFirstOrderSetLabel(task.first_order_set as number | string | undefined, t)
  })

  if (String(task.trade_trigger_mode) === '1') {
    list.push({
      label: t('params.labels.tp'),
      value:
        String(task.tp_trigger_px) === '0'
          ? t('params.values.notSet')
          : t('params.values.percent', { value: String(task.tp_trigger_px) })
    })
    list.push({
      label: t('params.labels.sl'),
      value:
        String(task.sl_trigger_px) === '0'
          ? t('params.values.notSet')
          : t('params.values.percent', { value: String(task.sl_trigger_px) })
    })
  }

  if (String(task.first_open_type) === '2') {
    list.push({
      label: t('params.labels.intervalOrder'),
      value: t('params.values.uplRatioFollow', { ratio: String(task.uplRatio) })
    })
  }

  if (String(task.pos_mode) === '1') {
    list.push({
      label: t('params.labels.posStrategy'),
      value: task.pos_value === 'long' ? t('params.values.longOnly') : t('params.values.shortOnly')
    })
  }

  if (String(task.vol24h_mode) === '1') {
    list.push({
      label: t('params.labels.vol24h'),
      value: t('params.values.vol24hTop', { num: String(task.vol24h_num) })
    })
  }

  if (String(task.balance_monitor_mode) === '1') {
    list.push({
      label: t('params.labels.balanceMonitor'),
      value: t('params.values.balanceBelow', { value: String(task.balance_monitor_value) })
    })
  }

  const whiteList = task.white_list as string[] | undefined
  if (String(task.white_list_mode) === '1' && whiteList && whiteList.length > 0) {
    list.push({ label: t('params.labels.whitelist'), value: whiteList.join(', ') })
  }

  const blackList = task.black_list as string[] | undefined
  if (String(task.black_list_mode) === '1' && blackList && blackList.length > 0) {
    list.push({ label: t('params.labels.blacklist'), value: blackList.join(', ') })
  }

  return list
}
