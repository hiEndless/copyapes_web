'use client'

import { useEffect, useRef, useState } from 'react'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Script from 'next/script'
import { toast } from 'sonner'

import { useRouter } from '@/i18n/routing'

import { Link } from '@/i18n/routing'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PrimaryFlowButton } from '@/components/ui/flow-button'
import { authApi } from '@/api/auth'
import {
  TurnstileLoadHint,
  useTurnstileMissingTokenMessage,
} from '@/components/auth/turnstile-load-hint'
import { useTurnstileScriptLoaded } from '@/hooks/use-turnstile-script-loaded'
import { persistAuthSession } from '@/lib/auth-session'
import { buildTurnstileRequestFields } from '@/lib/turnstile-degrade'

type TurnstileWidgetId = string

interface TurnstileRenderOptions {
  sitekey: string
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

interface TurnstileAPI {
  render: (container: HTMLElement | string, options: TurnstileRenderOptions) => TurnstileWidgetId
  reset?: (widgetId: TurnstileWidgetId) => void
  remove?: (widgetId: TurnstileWidgetId) => void
  getResponse?: (widgetId: TurnstileWidgetId) => string | undefined
}

declare global {
  interface Window {
    turnstile?: TurnstileAPI
  }
}

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

const LoginForm = () => {
  const t = useTranslations('Auth.login')
  const tc = useTranslations('Auth.common')
  const turnstileMissingTokenMessage = useTurnstileMissingTokenMessage()
  const siteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()

  const [isVisible, setIsVisible] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [turnstileWidgetError, setTurnstileWidgetError] = useState(false)
  const {
    turnstileScriptLoaded,
    turnstileLoadTimedOut,
    turnstileBlocking,
    onTurnstileScriptLoad,
    onTurnstileScriptError,
  } = useTurnstileScriptLoaded(siteKey)

  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<TurnstileWidgetId | null>(null)

  const router = useRouter()

  useEffect(() => {
    if (!siteKey) {
      return
    }
    if (!turnstileScriptLoaded || !turnstileContainerRef.current) {
      return
    }
    const el = turnstileContainerRef.current
    const ts = window.turnstile
    if (!ts?.render) {
      return
    }
    setTurnstileWidgetError(false)
    const id = ts.render(el, {
      sitekey: siteKey,
      'error-callback': () => setTurnstileWidgetError(true),
      'expired-callback': () => setTurnstileWidgetError(false),
    })
    turnstileWidgetIdRef.current = id
    return () => {
      const wid = turnstileWidgetIdRef.current
      if (wid && window.turnstile?.remove) {
        window.turnstile.remove(wid)
      }
      turnstileWidgetIdRef.current = null
    }
  }, [siteKey, turnstileScriptLoaded])

  const resetTurnstile = () => {
    if (!siteKey) {
      return
    }
    const wid = turnstileWidgetIdRef.current
    if (wid && window.turnstile?.reset) {
      window.turnstile.reset(wid)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      toast.error(t('needCredentials'))

      return
    }

    let turnstileFields: { cf_turnstile_token?: string; turnstile_degrade?: boolean } = {}
    if (siteKey) {
      const wid = turnstileWidgetIdRef.current
      const raw = wid && window.turnstile?.getResponse ? window.turnstile.getResponse(wid) : ''
      turnstileFields = buildTurnstileRequestFields({
        siteKey,
        token: raw,
        timedOut: turnstileLoadTimedOut,
        widgetError: turnstileWidgetError,
      })
      if (!turnstileFields.cf_turnstile_token && !turnstileFields.turnstile_degrade) {
        toast.error(turnstileMissingTokenMessage(turnstileLoadTimedOut || turnstileWidgetError))

        return
      }
    }

    try {
      setIsLoading(true)
      const res = await authApi.login({
        username,
        password,
        ...turnstileFields,
      })

      if (res.code === 0 && res.data) {
        toast.success(t('success'))
        persistAuthSession(res.data)
        router.push('/dashboard')
      } else if (siteKey) {
        resetTurnstile()
      }
    } catch {
      if (siteKey) {
        resetTurnstile()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const showTurnstileHint = Boolean(siteKey) && (turnstileLoadTimedOut || turnstileWidgetError)
  const turnstileHintReason = turnstileWidgetError && !turnstileLoadTimedOut ? 'widget' : 'script'

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      {siteKey ? (
        <Script
          src={TURNSTILE_SCRIPT}
          strategy='afterInteractive'
          onLoad={onTurnstileScriptLoad}
          onError={onTurnstileScriptError}
        />
      ) : null}
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='username'>
          {t('usernameLabel')}
        </Label>
        <Input
          type='text'
          id='username'
          placeholder={t('usernamePlaceholder')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className='w-full space-y-1'>
        <Label className='leading-5' htmlFor='password'>
          {tc('password')}
        </Label>
        <div className='relative'>
          <Input
            id='password'
            type={isVisible ? 'text' : 'password'}
            placeholder='••••••••••••••••'
            className='pr-9'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setIsVisible(prevState => !prevState)}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
            disabled={isLoading}
          >
            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className='sr-only'>{isVisible ? tc('hidePassword') : tc('showPassword')}</span>
          </Button>
        </div>
      </div>

      {siteKey ? (
        <div className='space-y-2'>
          <div className='flex min-h-[65px] justify-start'>
            <div ref={turnstileContainerRef} />
          </div>
          <TurnstileLoadHint visible={showTurnstileHint} reason={turnstileHintReason} />
        </div>
      ) : null}

      <div className='flex items-center justify-between gap-y-2'>
        <div className='flex items-center gap-3'>
          <Checkbox id='rememberMe' className='size-6' disabled={isLoading} />
          <Label htmlFor='rememberMe'>{t('rememberMe')}</Label>
        </div>

        <Link href='/forgot-password' className='hover:underline'>
          {t('forgotPassword')}
        </Link>
      </div>

      <PrimaryFlowButton
        className='w-full *:w-full [&>button]:after:-inset-55'
        type='submit'
        disabled={isLoading || turnstileBlocking}
      >
        {isLoading ? t('submitting') : t('submit')}
      </PrimaryFlowButton>
    </form>
  )
}

export default LoginForm
