'use client'

import { useCallback, useEffect, useState } from 'react'

function isTurnstileApiReady(win: Window): boolean {
  const ts = (win as Window & { turnstile?: { render?: unknown } }).turnstile

  return typeof ts?.render === 'function'
}

/**
 * Turnstile 脚本可能已在文档中（例如从登录/注册页客户端跳转回来），
 * 此时 next/script 的 onLoad 不会再触发，需在挂载后同步检测 window.turnstile。
 */
export function useTurnstileScriptLoaded(siteKey: string) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!siteKey) {
      return
    }
    if (typeof window === 'undefined') {
      return
    }
    if (isTurnstileApiReady(window)) {
      setLoaded(true)
    }
  }, [siteKey])

  const onScriptLoad = useCallback(() => {
    setLoaded(true)
  }, [])

  return { turnstileScriptLoaded: loaded, onTurnstileScriptLoad: onScriptLoad }
}
