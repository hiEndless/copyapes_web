'use client'

import { ChevronLeftIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'

import { Button } from '@/components/ui/button'

import Logo from '@/components/logo'
import ResetPasswordForm from '@/components/auth/reset-password/reset-password-form'

const ResetPassword = () => {
  const t = useTranslations('Auth.reset')
  const tc = useTranslations('Auth.common')

  return (
    <div className='flex flex-col gap-6'>
      <Link href='/'>
        <Logo />
      </Link>

      <div>
        <h1 className='mb-2 text-2xl font-semibold'>{t('title')}</h1>
        <p className='text-muted-foreground'>{t('subtitle')}</p>
      </div>

      <div className='space-y-3'>
        <ResetPasswordForm />

        <Button asChild variant='ghost' className='group w-full'>
          <Link href='/login'>
            <ChevronLeftIcon className='transition-transform duration-200 group-hover:-translate-x-0.5' />
            <p>{tc('backToLogin')}</p>
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default ResetPassword
