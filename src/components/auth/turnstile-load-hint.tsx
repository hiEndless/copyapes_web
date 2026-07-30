'use client'

import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

import { isLikelyDomesticClient } from '@/lib/turnstile-degrade'

type Props = {
  visible: boolean
  /** script：脚本超时/失败；widget：组件已出但校验失败 */
  reason?: 'script' | 'widget'
}

export function TurnstileLoadHint({ visible, reason = 'script' }: Props) {
  const t = useTranslations('Auth.turnstile')

  if (!visible) {
    return null
  }

  const canTrySubmit = isLikelyDomesticClient()
  const message = (() => {
    if (reason === 'widget') {
      return canTrySubmit ? t('widgetFailDomestic') : t('widgetFailOverseas')
    }
    return canTrySubmit ? t('scriptFailDomestic') : t('scriptFailOverseas')
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
        {t('refresh')}
      </Button>
    </div>
  )
}

export function useTurnstileMissingTokenMessage() {
  const t = useTranslations('Auth.turnstile')

  return (unavailable: boolean): string => {
    if (!unavailable) {
      return t('complete')
    }
    if (isLikelyDomesticClient()) {
      return t('notReadyDomestic')
    }
    return t('notReadyOverseas')
  }
}

/** @deprecated Prefer useTurnstileMissingTokenMessage in components */
export function turnstileMissingTokenMessage(unavailable: boolean): string {
  if (!unavailable) {
    return '请完成人机验证'
  }
  if (isLikelyDomesticClient()) {
    return '人机验证未就绪，可尝试直接提交；若失败请刷新或切换海外网络'
  }
  return '人机验证未就绪，请刷新页面或切换海外网络后重试'
}
