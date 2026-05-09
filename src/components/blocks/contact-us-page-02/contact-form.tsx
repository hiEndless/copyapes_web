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

type TurnstileWidgetId = string

interface TurnstileRenderOptions {
  sitekey: string
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
  const [turnstileScriptLoaded, setTurnstileScriptLoaded] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  })
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<TurnstileWidgetId | null>(null)

  useEffect(() => {
    if (!siteKey) return
    if (!turnstileScriptLoaded || !turnstileContainerRef.current) return
    const ts = (window as Window & { turnstile?: TurnstileAPI }).turnstile
    if (!ts?.render) return
    const id = ts.render(turnstileContainerRef.current, { sitekey: siteKey })
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

    let cfToken: string | undefined
    if (siteKey) {
      const wid = turnstileWidgetIdRef.current
      const api = (window as Window & { turnstile?: TurnstileAPI }).turnstile
      const raw = wid && api?.getResponse ? api.getResponse(wid) : ''
      const trimmed = (raw || '').trim()
      if (!trimmed) {
        toast.error('请完成人机验证')
        return
      }
      cfToken = trimmed
    }

    try {
      setLoading(true)
      const res = await settingsApi.sendMessage({
        full_name: formData.name,
        connect: formData.contact,
        message: formData.message,
        ...(cfToken ? { cf_turnstile_token: cfToken } : {}),
      })

      if (res.code === 0) {
        toast.success(t('success'))
        setFormData({ name: '', contact: '', message: '' })
      } else if (siteKey) {
        resetTurnstile()
      }
    } catch (error) {
      if (siteKey) {
        resetTurnstile()
      }
      // Error is handled by request interceptor
    } finally {
      setLoading(false)
    }
  }

  const turnstileBlocking = Boolean(siteKey) && !turnstileScriptLoaded

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      {siteKey ? (
        <Script src={TURNSTILE_SCRIPT} strategy='afterInteractive' onLoad={() => setTurnstileScriptLoaded(true)} />
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
        <div className='flex min-h-[65px] justify-center'>
          <div ref={turnstileContainerRef} />
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
