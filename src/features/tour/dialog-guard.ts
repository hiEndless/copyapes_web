/**
 * 弹窗内播放引导时的保护措施。
 *
 * driver.js 的弹层挂在 body 下，属于 Radix Dialog 的「外部」，
 * 用户点「下一步」会被判定为外部交互而关掉弹窗，Esc 也会同时被两者响应。
 * 引导期间 driver 的遮罩已经拦掉了非高亮元素的点击，
 * 因此只要引导在进行中，就一律不让弹窗因这些交互而关闭。
 */
type CancelableEvent = { preventDefault: () => void }

export const isTourActive = () =>
  typeof document !== 'undefined' && document.body.classList.contains('driver-active')

const preventWhileTourActive = (event: CancelableEvent) => {
  if (isTourActive()) {
    event.preventDefault()
  }
}

/** 展开到 `DialogContent` 上即可：`<DialogContent {...tourSafeDialogProps} />` */
export const tourSafeDialogProps = {
  onPointerDownOutside: preventWhileTourActive,
  onInteractOutside: preventWhileTourActive,
  onEscapeKeyDown: preventWhileTourActive
}
