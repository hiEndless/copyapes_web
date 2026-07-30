'use client'

import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'

import { Separator } from '@/components/ui/separator'

import Logo from '@/components/logo'
import GoogleLoginButton from '@/components/auth/google-login-button'
import LoginForm from '@/components/auth/login/login-form'

const googleClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim()

const Login = () => {
  const t = useTranslations('Auth.login')
  const tc = useTranslations('Auth.common')

  return (
    <div className='flex flex-col gap-6'>
      <Link href='/'>
        <Logo />
      </Link>

      <div>
        <h1 className='mb-3 text-2xl font-semibold md:text-3xl lg:text-4xl'>{t('title')}</h1>
        <p className='text-muted-foreground'>{tc('startFree')}</p>
      </div>

      {googleClientId ? (
        <>
          <GoogleLoginButton />
          <div className='flex items-center gap-4'>
            <Separator className='flex-1' />
            <p className='text-muted-foreground text-sm'>{tc('or')}</p>
            <Separator className='flex-1' />
          </div>
        </>
      ) : null}

      <div className='space-y-6'>
        <LoginForm />

        <p className='text-muted-foreground text-center'>
          {t('noAccount')}{' '}
          <Link href='/register' className='text-foreground hover:underline'>
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
