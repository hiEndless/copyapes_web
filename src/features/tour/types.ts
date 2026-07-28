import type { TourAnchor } from './anchors'

export type TourKind = 'page' | 'feature'

export type TourStepDef = {
  /** 不填则为屏幕居中的说明卡，用于开场或收尾 */
  anchor?: TourAnchor
  title: string
  description: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

export type TourDef = {
  id: string
  kind: TourKind
  /** 帮助菜单里展示的名称 */
  title: string
  /** 内容有实质调整时 +1，用户会重新看到一次自动引导 */
  version: number
  /** page 类必填：去掉 locale 前缀后的路由 */
  route?: string
  /** 首次进入该路由时自动播放 */
  autoStart?: boolean
  /** 锚点都不在当前 DOM 时的提示语，用于依赖弹窗等临时视图的引导 */
  unavailableHint?: string
  /** 不在帮助菜单里列出，只由组件内的入口主动触发 */
  hiddenInMenu?: boolean
  steps: TourStepDef[]
}
