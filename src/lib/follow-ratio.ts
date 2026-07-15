export type FollowRatioPreview =
  | { ready: false; hint: string }
  | { ready: true; formula: string; ratioPercent: number; lowRatioWarning: boolean }

export function formatAmountForDisplay(value: number): string {
  if (!Number.isFinite(value)) return ''
  if (Number.isInteger(value)) return String(value)

  return String(Number(value.toFixed(4)))
}

export function isDefaultFollowMultiple(value: unknown) {
  const num = Number(value)

  if (!Number.isFinite(num)) return true

  return num === 1
}

export function buildFollowRatioPreview(
  investmentRaw: string,
  benchMarkRaw: string,
  multipleVisible: boolean,
  multipleRaw: string,
  label = '跟单比例'
): FollowRatioPreview {
  const investmentText = investmentRaw.trim()
  const benchMarkText = benchMarkRaw.trim()

  if (!investmentText || !benchMarkText) {
    return { ready: false, hint: '填写本金与投资额后，将在此显示跟单比例计算过程' }
  }

  const investment = Number(investmentText)
  const benchMark = Number(benchMarkText)
  const multiple = multipleVisible ? Number(multipleRaw) : 1

  if (!Number.isFinite(investment) || investment <= 0) {
    return { ready: false, hint: '投资额必须大于 0' }
  }
  if (!Number.isFinite(benchMark) || benchMark <= 0) {
    return { ready: false, hint: '交易员本金必须大于 0' }
  }
  if (!Number.isFinite(multiple) || multiple <= 0) {
    return { ready: false, hint: '倍投倍数必须大于 0' }
  }

  const ratioPercent = (investment / benchMark) * multiple * 100
  const formula = `${label} = ${formatAmountForDisplay(investment)} ÷ ${formatAmountForDisplay(benchMark)} × ${formatAmountForDisplay(multiple)} = ${ratioPercent.toFixed(2)}%`

  return { ready: true, formula, ratioPercent, lowRatioWarning: ratioPercent < 10 }
}

export function buildFollowRatioFromTask(task: Record<string, unknown> | null | undefined): FollowRatioPreview | null {
  if (!task) return null
  if (String(task.follow_type ?? '2') !== '2') return null

  const multipleVisible = !isDefaultFollowMultiple(task.multiple)

  return buildFollowRatioPreview(
    String(task.investment ?? ''),
    String(task.benchMark ?? ''),
    multipleVisible,
    String(task.multiple ?? '1'),
    '开仓比例'
  )
}
