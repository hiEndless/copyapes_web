'use client'

import { useEffect, useState } from 'react'

import { Link } from '@/i18n/routing'

import { Separator } from '@/components/ui/separator'

import Logo from '@/components/logo'
import GoogleLoginButton from '@/components/auth/google-login-button'
import RegisterForm from '@/components/auth/register/register-form'
import { getPersistedInviteCode, isValidInviteCode, persistInviteCode } from '@/lib/invite-code'

const googleClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim()

const Register = () => {
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
        <h1 className='mb-2 text-2xl font-semibold'>注册</h1>
        <p className='text-muted-foreground'>开始您的免费体验</p>
      </div>

      {googleClientId ? (
        <>
          <GoogleLoginButton inviteCode={inviteCode} />
          <div className='flex items-center gap-4'>
            <Separator className='flex-1' />
            <p className='text-muted-foreground text-sm'>或</p>
            <Separator className='flex-1' />
          </div>
        </>
      ) : null}

      <RegisterForm />

      <div className='space-y-4'>
        <p className='text-muted-foreground text-center'>
          已有账号？{' '}
          <Link href='/login' className='text-foreground hover:underline'>
            登录
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
