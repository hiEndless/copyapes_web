import type { TaskParameterItem } from './types'
import { formatTaskCreatedTime } from '@/lib/task-time'

export function getPlatformName(val: number) {
  if (val == 1) return 'OKX'
  if (val == 2) return 'Binance'
  if (val == 3) return '币coin'
  if (val == 4) return '热门交易员'
  if (val == 5 || val == 6) return 'API'
  if (val == 7) return 'Binance'
  if (val == 8) return 'OKX'
  if (val == 9) return 'NOF1'
  if (val == 10) return 'HyperLiquid'

  return '未知'
}

export function getFollowType() {
  return '固定比例'
}

export function getFirstOrderSetLabel(value: number | string | undefined) {
  const v = String(value ?? '1')

  if (v === '2') return '复制当前持仓'
  if (v === '3') return '仅复制当前亏损仓位'

  return '仅复制新开仓'
}

export function getMarginModeSetLabel(value: number | string | undefined) {
  const v = String(value ?? '0')

  if (v === '1') return '全仓'
  if (v === '2') return '逐仓'

  return '跟随交易员'
}

export function isDefaultMultiple(value: unknown) {
  const num = Number(value)

  if (!Number.isFinite(num)) return true

  return num === 1
}

export function getRoleType(roleType: number | string, traderPlatform: number | string) {
  const rt = String(roleType)
  const tp = String(traderPlatform)

  if (tp === '1' || tp === '6' || tp === '8') {
    if (rt === '1') return '合约带单'
    if (rt === '2') return '个人概况'
  } else if (tp === '2' || tp === '5' || tp === '7') {
    if (rt === '1') return '公开带单'
    if (rt === '2') return '隐藏带单'
    if (rt === '3') return '聪明钱'
  } else if (tp === '3') {
    if (rt === '1' || rt === '3') return '操作记录'
    if (rt === '2' || rt === '4') return '合约仓位'
  } else if (tp === '9') {
    return 'AI模型'
  } else if (tp === '10') {
    return '钱包地址'
  }

  return '未知'
}

export function buildTaskParameterList(task: Record<string, unknown>): TaskParameterItem[] {
  const list: TaskParameterItem[] = []

  list.push({ label: '跟单平台', value: getPlatformName(task.trader_platform as number) })
  list.push({ label: '跟单对象', value: (String(task.label || '').trim() || task.uniqueName) as string })
  list.push({ label: '创建时间', value: formatTaskCreatedTime(task) })
  list.push({ label: '反向跟单', value: String(task.posSide_set) === '1' ? '否' : '是' })
  list.push({ label: 'API', value: task.api_name as string })
  list.push({
    label: '交易员类型',
    value: getRoleType(task.role_type as number | string, task.trader_platform as number | string)
  })
  list.push({ label: '跟单模式', value: getFollowType() })
  if (!isDefaultMultiple(task.multiple)) {
    list.push({ label: '智能倍数', value: task.multiple as string | number })
  }
  list.push({ label: '投资额', value: task.investment as string | number })
  list.push({ label: '对标资金', value: task.benchMark as string | number })
  list.push({
    label: '杠杆设置',
    value: String(task.lever_set) === '1' ? '跟随交易员' : (task.leverage as string | number)
  })
  list.push({
    label: '保证金模式',
    value: getMarginModeSetLabel(task.margin_mode_set as number | string | undefined)
  })
  list.push({
    label: '首单交易设置',
    value: getFirstOrderSetLabel(task.first_order_set as number | string | undefined)
  })

  if (String(task.trade_trigger_mode) === '1') {
    list.push({
      label: '单笔止盈',
      value: String(task.tp_trigger_px) === '0' ? '未设置' : `${task.tp_trigger_px}%`
    })
    list.push({
      label: '单笔止损',
      value: String(task.sl_trigger_px) === '0' ? '未设置' : `${task.sl_trigger_px}%`
    })
  }

  if (String(task.first_open_type) === '2') {
    list.push({ label: '区间委托(新开仓)', value: `收益率小于${task.uplRatio}%时跟单` })
  }

  if (String(task.pos_mode) === '1') {
    list.push({ label: '多空策略', value: task.pos_value === 'long' ? '只开多单' : '只开空单' })
  }

  if (String(task.vol24h_mode) === '1') {
    list.push({ label: '24h成交量', value: `只跟排行前${task.vol24h_num}的币种` })
  }

  if (String(task.balance_monitor_mode) === '1') {
    list.push({ label: '带单本金', value: `低于${task.balance_monitor_value}U不跟单` })
  }

  const whiteList = task.white_list as string[] | undefined
  if (String(task.white_list_mode) === '1' && whiteList && whiteList.length > 0) {
    list.push({ label: '白名单策略', value: whiteList.join(', ') })
  }

  const blackList = task.black_list as string[] | undefined
  if (String(task.black_list_mode) === '1' && blackList && blackList.length > 0) {
    list.push({ label: '黑名单策略', value: blackList.join(', ') })
  }

  return list
}
