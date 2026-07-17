'use client'

import { useEffect, useRef, useState } from 'react'
import { SendIcon, Loader2 } from 'lucide-react'
import Script from 'next/script'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { settingsApi } from '@/api/settings'
import {
  TurnstileLoadHint,
  turnstileMissingTokenMessage,
} from '@/components/auth/turnstile-load-hint'
import { useTurnstileScriptLoaded } from '@/hooks/use-turnstile-script-loaded'
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

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

const ContactForm = () => {
  const t = useTranslations('ContactForm')
  const siteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()

  const [loading, setLoading] = useState(false)
  const [turnstileWidgetError, setTurnstileWidgetError] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  })
  const {
    turnstileScriptLoaded,
    turnstileLoadTimedOut,
    turnstileBlocking,
    onTurnstileScriptLoad,
    onTurnstileScriptError,
  } = useTurnstileScriptLoaded(siteKey)
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<TurnstileWidgetId | null>(null)

  useEffect(() => {
    if (!siteKey) return
    if (!turnstileScriptLoaded || !turnstileContainerRef.current) return
    const ts = (window as Window & { turnstile?: TurnstileAPI }).turnstile
    if (!ts?.render) return
    setTurnstileWidgetError(false)
    const id = ts.render(turnstileContainerRef.current, {
      sitekey: siteKey,
      'error-callback': () => setTurnstileWidgetError(true),
      'expired-callback': () => setTurnstileWidgetError(false),
    })
    turnstileWidgetIdRef.current = id
    return () => {
      const wid = turnstileWidgetIdRef.current
      const api = (window as Window & { turnstile?: TurnstileAPI }).turnstile
      if (wid && api?.remove) {
        api.remove(wid)
      }
      turnstileWidgetIdRef.current = null
    }
  }, [siteKey, turnstileScriptLoaded])

  const resetTurnstile = () => {
    if (!siteKey) return
    const wid = turnstileWidgetIdRef.current
    const api = (window as Window & { turnstile?: TurnstileAPI }).turnstile
    if (wid && api?.reset) {
      api.reset(wid)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.contact.trim() || !formData.message.trim()) {
      return
    }

    let turnstileFields: { cf_turnstile_token?: string; turnstile_degrade?: boolean } = {}
    if (siteKey) {
      const wid = turnstileWidgetIdRef.current
      const api = (window as Window & { turnstile?: TurnstileAPI }).turnstile
      const raw = wid && api?.getResponse ? api.getResponse(wid) : ''
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
      setLoading(true)
      const res = await settingsApi.sendMessage({
        full_name: formData.name,
        connect: formData.contact,
        message: formData.message,
        ...turnstileFields,
      })

      if (res.code === 0) {
        toast.success(t('success'))
        setFormData({ name: '', contact: '', message: '' })
      } else if (siteKey) {
        resetTurnstile()
      }
    } catch {
      if (siteKey) {
        resetTurnstile()
      }
      // Error is handled by request interceptor
    } finally {
      setLoading(false)
    }
  }

  const showTurnstileHint = Boolean(siteKey) && (turnstileLoadTimedOut || turnstileWidgetError)
  const turnstileHintReason = turnstileWidgetError && !turnstileLoadTimedOut ? 'widget' : 'script'

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      {siteKey ? (
        <Script
          src={TURNSTILE_SCRIPT}
          strategy='afterInteractive'
          onLoad={onTurnstileScriptLoad}
          onError={onTurnstileScriptError}
        />
      ) : null}
      <div className='flex w-full flex-wrap gap-6'>
        {/* Name Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='name'>{t('name')}</Label>
          <Input
            type='text'
            id='name'
            className='h-10'
            placeholder={t('namePlaceholder')}
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        {/* Email Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='contact'>{t('contact')}</Label>
          <Input
            type='text'
            id='contact'
            className='h-10'
            placeholder={t('contactPlaceholder')}
            value={formData.contact}
            onChange={e => setFormData(prev => ({ ...prev, contact: e.target.value }))}
            required
          />
        </div>
      </div>

      {/* Message Input */}
      <div className='space-y-2'>
        <Label htmlFor='message'>{t('message')}</Label>
        <Textarea
          id='message'
          className='h-48 resize-none'
          placeholder={t('messagePlaceholder')}
          value={formData.message}
          onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
          required
        />
      </div>

      {siteKey ? (
        <div className='space-y-2'>
          <div className='flex min-h-[65px] justify-start'>
            <div ref={turnstileContainerRef} />
          </div>
          <TurnstileLoadHint visible={showTurnstileHint} reason={turnstileHintReason} />
        </div>
      ) : null}

      {/* Submit Button */}
      <Button type='submit' size='lg' className='rounded-lg text-base has-[>svg]:px-6' disabled={loading || turnstileBlocking}>
        {loading ? t('sending') : t('submit')}
        {loading ? <Loader2 className='animate-spin' /> : <SendIcon />}
      </Button>
    </form>
  )
}

export default ContactForm
