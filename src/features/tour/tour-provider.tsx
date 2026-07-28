'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'

import { usePathname } from 'next/navigation'

import { toast } from 'sonner'

import { featureTours, findPageTour, getTourById, stripLocale } from './registry'
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
  const pathname = usePathname()
  const route = stripLocale(pathname ?? '')
  const pageTour = useMemo(() => findPageTour(route), [route])
  const autoStartedRef = useRef<string | null>(null)

  const startTour = useCallback((tour: TourDef) => {
    void import('./tour-runner').then(({ startTour: run }) => {
      // 从下拉菜单触发时，等 Radix 关闭动画释放 body 的 pointer-events 再开场
      window.setTimeout(() => {
        if (!run(tour)) {
          toast.info(tour.unavailableHint ?? '当前页面找不到该功能入口，请先展开侧边栏或进入对应页面')
        }
      }, 160)
    })
  }, [])

  const startTourById = useCallback(
    (id: string) => {
      const tour = getTourById(id)

      if (!tour) {
        console.warn(`[tour] unknown tour id: ${id}`)

        return
      }

      startTour(tour)
    },
    [startTour]
  )

  const resetProgress = useCallback(() => {
    resetAllTours()
    autoStartedRef.current = null
    toast.success('引导记录已重置，下次进入相关页面会重新提示')
  }, [])

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

        if (run(pageTour)) {
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
  }, [pageTour])

  const value = useMemo<TourContextValue>(
    () => ({ pageTour, featureTours, startTour, startTourById, resetProgress }),
    [pageTour, startTour, startTourById, resetProgress]
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
