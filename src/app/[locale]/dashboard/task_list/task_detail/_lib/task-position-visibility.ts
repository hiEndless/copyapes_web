type TaskLike = {
  trader_platform?: number | string
  role_type?: number | string
}

export function shouldShowTaskPositionSummary(task: TaskLike | null | undefined) {
  if (!task) return false

  const platform = Number(task.trader_platform)

  // tg_service 热门跟单任务暂无交易员持仓快照
  if (platform === 4) return false

  return true
}

export function shouldShowSimulatedPositionWarning(task: TaskLike | null | undefined) {
  if (!task) return false

  const platform = Number(task.trader_platform)
  const roleType = String(task.role_type ?? '')

  // bn_close_service: Binance 隐藏带单，按操作记录模拟持仓
  if (platform === 2 && roleType === '2') return true

  // bicoin_record_service: 币coin 操作记录
  if (platform === 3 && (roleType === '1' || roleType === '3')) return true

  return false
}
