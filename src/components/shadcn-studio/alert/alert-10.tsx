'use client'

import { useState } from 'react'

import { CircleAlertIcon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Alert10() {
  const t = useTranslations('DashboardShell')
  const [isActive, setIsActive] = useState(true)

  if (!isActive) return null

  return (
    <Alert className='border-accent-foreground/20 from-accent text-accent-foreground !flex !items-center gap-2 bg-gradient-to-b to-transparent to-60% py-1.5 pl-3 pr-2 [&>svg]:!translate-y-0'>
      <CircleAlertIcon className='text-accent-foreground/90 size-3.5 shrink-0 self-center' />
      <AlertDescription className='text-accent-foreground/90 !col-auto !block min-w-0 flex-1 self-center text-left text-xs leading-snug'>
        {t('riskBanner')}
      </AlertDescription>
      <button
        type='button'
        className='text-accent-foreground/80 hover:text-accent-foreground shrink-0 self-center p-0.5'
        onClick={() => setIsActive(false)}
      >
        <XIcon className='size-4' />
        <span className='sr-only'>{t('close')}</span>
      </button>
    </Alert>
  )
}
