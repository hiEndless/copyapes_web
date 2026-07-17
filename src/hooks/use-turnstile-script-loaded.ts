'use client'

import { useCallback, useEffect, useState } from 'react'

const DEFAULT_TIMEOUT_MS = 8000

function isTurnstileApiReady(win: Window): boolean {
  const ts = (win as Window & { turnstile?: { render?: unknown } }).turnstile

  return typeof ts?.render === 'function'
}

/**
 * Turnstile 脚本可能已在文档中（例如从登录/注册页客户端跳转回来），
 * 此时 next/script 的 onLoad 不会再触发，需在挂载后同步检测 window.turnstile。
 *
 * 国内网络下 challenges.cloudflare.com 常失败：超时后解除按钮禁用，由页面提示刷新/海外网络。
 */
export function useTurnstileScriptLoaded(siteKey: string, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const [loaded, setLoaded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!siteKey) {
      return
    }
    if (typeof window === 'undefined') {
      return
    }

    setLoaded(false)
    setTimedOut(false)

    if (isTurnstileApiReady(window)) {
      setLoaded(true)

      return
    }

    const startedAt = Date.now()
    const poll = window.setInterval(() => {
      if (isTurnstileApiReady(window)) {
        setLoaded(true)
        setTimedOut(false)
        window.clearInterval(poll)

        return
      }
      if (Date.now() - startedAt >= timeoutMs) {
        setTimedOut(true)
        window.clearInterval(poll)
      }
    }, 250)

    return () => window.clearInterval(poll)
  }, [siteKey, timeoutMs])

  const onScriptLoad = useCallback(() => {
    setLoaded(true)
    setTimedOut(false)
  }, [])

  const onScriptError = useCallback(() => {
    setTimedOut(true)
  }, [])

  const turnstileBlocking = Boolean(siteKey) && !loaded && !timedOut

  return {
    turnstileScriptLoaded: loaded,
    turnstileLoadTimedOut: timedOut,
    turnstileBlocking,
    onTurnstileScriptLoad: onScriptLoad,
    onTurnstileScriptError: onScriptError,
  }
}
