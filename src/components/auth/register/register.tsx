'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'

import { Separator } from '@/components/ui/separator'

import Logo from '@/components/logo'
import GoogleLoginButton from '@/components/auth/google-login-button'
import RegisterForm from '@/components/auth/register/register-form'
import { getPersistedInviteCode, isValidInviteCode, persistInviteCode } from '@/lib/invite-code'

const googleClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim()

const Register = () => {
  const t = useTranslations('Auth.register')
  const tc = useTranslations('Auth.common')
  const [inviteCode, setInviteCode] = useState('')

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('invite_code')?.trim() ?? ''
    if (fromUrl && isValidInviteCode(fromUrl)) {
      persistInviteCode(fromUrl)
      setInviteCode(fromUrl)
      return
    }
    const persisted = getPersistedInviteCode()
    if (persisted) setInviteCode(persisted)
  }, [])

  return (
    <div className='flex flex-col gap-6'>
      <Link href='/'>
        <Logo />
      </Link>

      <div>
        <h1 className='mb-2 text-2xl font-semibold'>{t('title')}</h1>
        <p className='text-muted-foreground'>{tc('startFree')}</p>
      </div>

      {googleClientId ? (
        <>
          <GoogleLoginButton inviteCode={inviteCode} />
          <div className='flex items-center gap-4'>
            <Separator className='flex-1' />
            <p className='text-muted-foreground text-sm'>{tc('or')}</p>
            <Separator className='flex-1' />
          </div>
        </>
      ) : null}

      <RegisterForm />

      <div className='space-y-4'>
        <p className='text-muted-foreground text-center'>
          {t('hasAccount')}{' '}
          <Link href='/login' className='text-foreground hover:underline'>
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
