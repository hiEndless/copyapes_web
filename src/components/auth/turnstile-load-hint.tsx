'use client'

import { Button } from '@/components/ui/button'

import { isLikelyDomesticClient } from '@/lib/turnstile-degrade'

type Props = {
  visible: boolean
  /** script：脚本超时/失败；widget：组件已出但校验失败 */
  reason?: 'script' | 'widget'
}

export function TurnstileLoadHint({ visible, reason = 'script' }: Props) {
  if (!visible) {
    return null
  }

  const canTrySubmit = isLikelyDomesticClient()
  const message = (() => {
    if (reason === 'widget') {
      return canTrySubmit
        ? '人机验证失败，请刷新页面重试，或切换海外网络。若仍无法完成，可尝试直接提交，系统将按网络情况处理。'
        : '人机验证失败，请刷新页面重试。若仍无法完成，请切换海外网络后访问。'
    }
    return canTrySubmit
      ? '人机验证加载超时，请刷新页面重试，或切换海外网络。若仍无法加载，可尝试直接提交，系统将按网络情况处理。'
      : '人机验证加载超时，请刷新页面重试。若仍无法加载，请切换海外网络后访问。'
  })()

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

export function turnstileMissingTokenMessage(unavailable: boolean): string {
  if (!unavailable) {
    return '请完成人机验证'
  }
  if (isLikelyDomesticClient()) {
    return '人机验证未就绪，可尝试直接提交；若失败请刷新或切换海外网络'
  }
  return '人机验证未就绪，请刷新页面或切换海外网络后重试'
}
