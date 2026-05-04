'use client'

import { useCallback } from 'react'

import { useTopLoader } from 'nextjs-toploader'

import { usePathname, useRouter as useLocaleRouter } from '@/i18n/routing'

export const useDashboardRouter = () => {
  const router = useLocaleRouter()
  const pathname = usePathname()
  const topLoader = useTopLoader()

  const startNavigation = useCallback(
    (href: unknown) => {
      if (typeof href === 'string' && href === pathname) return

      topLoader.start()
      topLoader.setProgress(0.08)
    },
    [pathname, topLoader]
  )

  const push = useCallback(
    (...args: Parameters<typeof router.push>) => {
      startNavigation(args[0])

      return router.push(...args)
    },
    [router, startNavigation]
  )

  const replace = useCallback(
    (...args: Parameters<typeof router.replace>) => {
      startNavigation(args[0])

      return router.replace(...args)
    },
    [router, startNavigation]
  )

  const back = useCallback(() => {
    topLoader.start()
    topLoader.setProgress(0.08)

    return router.back()
  }, [router, topLoader])

  return {
    ...router,
    push,
    replace,
    back
  }
}
