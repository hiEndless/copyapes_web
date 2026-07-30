'use client'

import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'

import { Button } from '@/components/ui/button'

const ResetPasswordForm = () => {
  const t = useTranslations('Auth.reset')

  return (
    <div className='space-y-4'>
      <p className='text-muted-foreground text-sm'>{t('hint')}</p>
      <Button asChild className='w-full'>
        <Link href='/forgot-password'>{t('goForgot')}</Link>
      </Button>
    </div>
  )
}

export default ResetPasswordForm
