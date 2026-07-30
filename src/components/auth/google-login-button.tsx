'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import Script from 'next/script'
import { toast } from 'sonner'

import { localeToGoogleSignInLocale } from '@/i18n/locales'
import { useRouter } from '@/i18n/routing'

import { authApi } from '@/api/auth'
import { persistAuthSession } from '@/lib/auth-session'
import { getPersistedInviteCode } from '@/lib/invite-code'

const GIS_SCRIPT = 'https://accounts.google.com/gsi/client'

interface GoogleCredentialResponse {
  credential?: string
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
  }) => void
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: string
      size?: string
      text?: string
      shape?: string
      width?: number
      locale?: string
    }
  ) => void
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId
      }
    }
  }
}

type GoogleLoginButtonProps = {
  inviteCode?: string
  className?: string
}

const GoogleLoginButton = ({ inviteCode, className }: GoogleLoginButtonProps) => {
  const t = useTranslations('Auth.google')
  const locale = useLocale()
  const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim()
  const [scriptReady, setScriptReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const initializedRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptReady(true)
    }
  }, [])

  const resolveInviteCode = useCallback(() => {
    const fromProp = (inviteCode || '').trim()
    if (fromProp) return fromProp
    return getPersistedInviteCode() || ''
  }, [inviteCode])

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      const idToken = (response.credential || '').trim()
      if (!idToken) {
        toast.error(t('fail'))
        return
      }

      try {
        setIsLoading(true)
        const res = await authApi.googleLogin({
          id_token: idToken,
          invite_code: resolveInviteCode(),
        })
        if (res.code === 0 && res.data) {
          toast.success(res.data.created ? t('registerSuccess') : t('loginSuccess'))
          persistAuthSession(res.data)
          router.push('/dashboard')
        }
      } catch {
        // toast handled globally
      } finally {
        setIsLoading(false)
      }
    },
    [resolveInviteCode, router, t]
  )

  useEffect(() => {
    if (!clientId || !scriptReady || !buttonRef.current || initializedRef.current) return
    const idApi = window.google?.accounts?.id
    if (!idApi?.initialize || !idApi.renderButton) return

    idApi.initialize({
      client_id: clientId,
      callback: handleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    const width = Math.min(400, Math.max(240, buttonRef.current.clientWidth || 320))
    buttonRef.current.innerHTML = ''
    idApi.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width,
      locale: localeToGoogleSignInLocale(locale),
    })
    initializedRef.current = true
  }, [clientId, scriptReady, handleCredential, locale])

  if (!clientId) {
    return null
  }

  return (
    <>
      <Script
        src={GIS_SCRIPT}
        strategy='afterInteractive'
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
        onError={() => toast.error(t('scriptFail'))}
      />
      <div className={className || 'w-full'}>
        <div ref={buttonRef} className='flex min-h-10 w-full justify-center' />
        {isLoading ? (
          <p className='text-muted-foreground mt-2 text-center text-sm'>{t('loading')}</p>
        ) : null}
      </div>
    </>
  )
}

export default GoogleLoginButton
