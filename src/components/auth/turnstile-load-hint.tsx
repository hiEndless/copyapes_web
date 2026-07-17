'use client'

import { Button } from '@/components/ui/button'

type Props = {
  visible: boolean
  /** script：脚本超时/失败；widget：组件已出但校验失败 */
  reason?: 'script' | 'widget'
}

export function TurnstileLoadHint({ visible, reason = 'script' }: Props) {
  if (!visible) {
    return null
  }

  const message =
    reason === 'widget'
      ? '人机验证失败，请刷新页面重试。若仍无法完成，请切换海外网络后访问。'
      : '人机验证加载超时，请刷新页面重试。若仍无法加载，请切换海外网络后访问。'

  return (
    <div className='rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-900 dark:text-amber-200'>
      <p>{message}</p>
      <Button
        type='button'
        variant='link'
        className='text-amber-900 dark:text-amber-200 h-auto px-0 py-1'
        onClick={() => window.location.reload()}
      >
        刷新页面
      </Button>
    </div>
  )
}

export function turnstileMissingTokenMessage(timedOut: boolean): string {
  return timedOut
    ? '人机验证未就绪，请刷新页面或切换海外网络后重试'
    : '请完成人机验证'
}
