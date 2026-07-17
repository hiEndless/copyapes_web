/**
 * 国内网络 + Turnstile 不可用时，请求后端降级跳过人机校验。
 * 后端仍会校验：IP 属国内 + 每 IP 每天限额。
 */

export function isLikelyDomesticClient(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (/Shanghai|Chongqing|Urumqi|Harbin|Hong_Kong|Macau|Taipei/i.test(tz)) {
      // 仅大陆时区视为国内降级候选；港台 Turnstile 通常可用
      return /Shanghai|Chongqing|Urumqi|Harbin/i.test(tz)
    }
    const lang = (navigator.language || '').toLowerCase()
    if (lang === 'zh-cn' || lang.startsWith('zh-cn')) {
      return true
    }
  } catch {
    // ignore
  }
  return false
}

export function shouldUseTurnstileDegrade(opts: {
  timedOut: boolean
  widgetError: boolean
}): boolean {
  return Boolean(opts.timedOut || opts.widgetError) && isLikelyDomesticClient()
}

export function buildTurnstileRequestFields(opts: {
  siteKey: string
  token?: string
  timedOut: boolean
  widgetError: boolean
}): { cf_turnstile_token?: string; turnstile_degrade?: boolean } {
  if (!opts.siteKey) {
    return {}
  }
  const trimmed = (opts.token || '').trim()
  if (trimmed) {
    return { cf_turnstile_token: trimmed }
  }
  if (shouldUseTurnstileDegrade({ timedOut: opts.timedOut, widgetError: opts.widgetError })) {
    return { turnstile_degrade: true }
  }
  return {}
}
