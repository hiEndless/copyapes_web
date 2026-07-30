'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { localizeTour } from './localize'
import { featureTours as featureTourDefs, findPageTour, getTourById, stripLocale } from './registry'
import { hasSeenTour, resetAllTours } from './storage'

import type { TourDef } from './types'

/** 等页面首屏与骨架渲染稳定后再自动开场，避免高亮到还没挂载的节点 */
const AUTO_START_DELAY = 900

type TourContextValue = {
  pageTour?: TourDef
  featureTours: TourDef[]
  startTour: (tour: TourDef) => void
  startTourById: (id: string) => void
  resetProgress: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const t = useTranslations('Tour')
  const pathname = usePathname()
  const route = stripLocale(pathname ?? '')
  const pageTour = useMemo(() => {
    const tour = findPageTour(route)
    return tour ? localizeTour(tour, t) : undefined
  }, [route, t])
  const featureTours = useMemo(
    () => featureTourDefs.map(tour => localizeTour(tour, t)),
    [t]
  )
  const autoStartedRef = useRef<string | null>(null)

  const uiLabels = useMemo(
    () => ({
      next: t('buttons.next'),
      prev: t('buttons.prev'),
      done: t('buttons.done'),
      gotIt: t('buttons.gotIt')
    }),
    [t]
  )

  const startTour = useCallback(
    (tour: TourDef) => {
      void import('./tour-runner').then(({ startTour: run }) => {
        // 从下拉菜单触发时，等 Radix 关闭动画释放 body 的 pointer-events 再开场
        window.setTimeout(() => {
          if (!run(tour, uiLabels)) {
            toast.info(tour.unavailableHint ?? t('fallbackUnavailable'))
          }
        }, 160)
      })
    },
    [t, uiLabels]
  )

  const startTourById = useCallback(
    (id: string) => {
      const tour = getTourById(id)

      if (!tour) {
        console.warn(`[tour] unknown tour id: ${id}`)

        return
      }

      startTour(localizeTour(tour, t))
    },
    [startTour, t]
  )

  const resetProgress = useCallback(() => {
    resetAllTours()
    autoStartedRef.current = null
    toast.success(t('resetSuccess'))
  }, [t])

  useEffect(() => {
    if (!pageTour?.autoStart) return
    if (autoStartedRef.current === pageTour.id) return
    if (hasSeenTour(pageTour)) return

    let cancelled = false
    let attempt = 0
    let retryTimer: number | undefined

    const tryStart = () => {
      void import('./tour-runner').then(({ startTour: run }) => {
        if (cancelled) return

        if (run(pageTour, uiLabels)) {
          autoStartedRef.current = pageTour.id

          return
        }

        // 页面还在拉数据时锚点未挂载，短重试几次；成功才记已开场
        if (attempt < 6) {
          attempt += 1
          retryTimer = window.setTimeout(tryStart, 500)
        }
      })
    }

    const timer = window.setTimeout(tryStart, AUTO_START_DELAY)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      if (retryTimer) window.clearTimeout(retryTimer)
    }
  }, [pageTour, uiLabels])

  const value = useMemo<TourContextValue>(
    () => ({ pageTour, featureTours, startTour, startTourById, resetProgress }),
    [pageTour, featureTours, startTour, startTourById, resetProgress]
  )

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export const useTour = () => {
  const context = useContext(TourContext)

  if (!context) {
    throw new Error('useTour must be used within TourProvider')
  }

  return context
}
