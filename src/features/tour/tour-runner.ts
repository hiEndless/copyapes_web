import { driver, type Driver } from 'driver.js'

import 'driver.js/dist/driver.css'

import { anchorSelector } from './anchors'
import { markTourSeen } from './storage'

import type { TourDef } from './types'

export type TourUiLabels = {
  next: string
  prev: string
  done: string
  gotIt: string
}

const DEFAULT_UI_LABELS: TourUiLabels = {
  next: '下一步',
  prev: '上一步',
  done: '完成',
  gotIt: '知道了'
}

let activeDriver: Driver | null = null

const stopActiveDriver = () => {
  if (!activeDriver) return

  activeDriver.destroy()
  activeDriver = null
}

/**
 * 预检：至少要有一个锚点存在于当前 DOM。
 * 全部缺失通常意味着入口不在当前视图（例如移动端侧栏未展开），
 * 此时直接放弃比弹一个空引导更好。
 */
const hasAnyAnchor = (tour: TourDef) => {
  const anchored = tour.steps.filter(step => step.anchor)

  if (anchored.length === 0) return true

  return anchored.some(step => document.querySelector(anchorSelector(step.anchor!)) !== null)
}

export const startTour = (tour: TourDef, labels: TourUiLabels = DEFAULT_UI_LABELS): boolean => {
  if (typeof document === 'undefined') return false

  if (!hasAnyAnchor(tour)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[tour] "${tour.id}" 的所有锚点都不在当前页面，已跳过`)
    }

    return false
  }

  stopActiveDriver()

  const isSingleStep = tour.steps.length === 1

  activeDriver = driver({
    popoverClass: 'copyapes-tour',
    overlayColor: '#09090b',
    overlayOpacity: 0.6,
    stagePadding: 6,
    stageRadius: 8,
    popoverOffset: 12,
    smoothScroll: true,
    allowClose: true,
    // 锚点被删除或尚未渲染时不要中断整条引导
    skipMissingElement: true,
    waitForElement: 1500,
    showProgress: !isSingleStep,
    progressText: '{{current}} / {{total}}',
    nextBtnText: labels.next,
    prevBtnText: labels.prev,
    doneBtnText: isSingleStep ? labels.gotIt : labels.done,
    showButtons: isSingleStep ? ['next'] : ['next', 'previous', 'close'],
    steps: tour.steps.map(step => ({
      element: step.anchor ? anchorSelector(step.anchor) : undefined,
      popover: {
        title: step.title,
        description: step.description,
        side: step.side,
        align: step.align
      }
    })),
    onDestroyed: () => {
      activeDriver = null
      markTourSeen(tour)
    }
  })

  activeDriver.drive()

  return true
}
