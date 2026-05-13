'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { Loader2 } from 'lucide-react'
import Script from 'next/script'
import { toast } from 'sonner'

import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { useTurnstileScriptLoaded } from '@/hooks/use-turnstile-script-loaded'

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

type Phase = 'old_send' | 'old_verify' | 'new_input' | 'new_verify'

type Props = {
  boundEmail: string | null | undefined
  onEmailUpdated: (email: string, emailVerified: boolean) => void
}

const readSkipOld = (res: { code: number; data?: unknown }) => {
  const d = res.data as { skip_old?: boolean } | undefined

  return Boolean(d?.skip_old)
}

export function EmailChangeCard({ boundEmail, onEmailUpdated }: Props) {
  const siteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()
  const { turnstileScriptLoaded, onTurnstileScriptLoad } = useTurnstileScriptLoaded(siteKey)
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<TurnstileWidgetId | null>(null)

  const normalizedBound = (boundEmail || '').trim().toLowerCase()
  const hasBound = Boolean(normalizedBound)

  const [phase, setPhase] = useState<Phase>(hasBound ? 'old_send' : 'new_input')

  useEffect(() => {
    setPhase(hasBound ? 'old_send' : 'new_input')
  }, [hasBound])

  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const [oldOtp, setOldOtp] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newOtp, setNewOtp] = useState('')

  const oldOtpId = useId()
  const newOtpId = useId()

  useEffect(() => {
    if (!siteKey) {
      return
    }
    if (!turnstileScriptLoaded || !turnstileContainerRef.current) {
      return
    }
    const ts = (window as Window & { turnstile?: TurnstileAPI }).turnstile
    if (!ts?.render) {
      return
    }
    const el = turnstileContainerRef.current
    const id = ts.render(el, { sitekey: siteKey })
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
    if (!siteKey) {
      return
    }
    const wid = turnstileWidgetIdRef.current
    const api = (window as Window & { turnstile?: TurnstileAPI }).turnstile
    if (wid && api?.reset) {
      api.reset(wid)
    }
  }

  const getCfToken = (): string | undefined => {
    if (!siteKey) {
      return undefined
    }
    const wid = turnstileWidgetIdRef.current
    const api = (window as Window & { turnstile?: TurnstileAPI }).turnstile
    const raw = wid && api?.getResponse ? api.getResponse(wid) : ''
    const trimmed = (raw || '').trim()
    if (!trimmed) {
      toast.error('请先完成人机验证')

      return undefined
    }

    return trimmed
  }

  const sendOldCode = async () => {
    const cf = getCfToken()
    if (siteKey && !cf) {
      return
    }
    setSending(true)
    try {
      const res = await authApi.emailChangeOldSendCode(cf ? { cf_turnstile_token: cf } : {})
      if (readSkipOld(res)) {
        setPhase('new_input')

        return
      }
      if (res.code === 0) {
        setPhase('old_verify')
        setOldOtp('')
      } else if (siteKey) {
        resetTurnstile()
      }
    } finally {
      setSending(false)
    }
  }

  const verifyOld = async () => {
    const code = oldOtp.trim()
    if (code.length !== 6) {
      toast.error('请输入 6 位验证码')

      return
    }
    setVerifying(true)
    try {
      const res = await authApi.emailChangeOldVerify({ code })
      if (readSkipOld(res)) {
        setPhase('new_input')

        return
      }
      if (res.code === 0) {
        setPhase('new_input')
        setNewOtp('')
      }
    } finally {
      setVerifying(false)
    }
  }

  const sendNewCode = async () => {
    const email = newEmail.trim().toLowerCase()
    if (!email) {
      toast.error('请输入新邮箱')

      return
    }
    const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!re.test(email)) {
      toast.error('邮箱格式错误')

      return
    }
    const cf = getCfToken()
    if (siteKey && !cf) {
      return
    }
    setSending(true)
    try {
      const res = await authApi.emailChangeNewSendCode({
        email,
        ...(cf ? { cf_turnstile_token: cf } : {}),
      })
      if (res.code === 0) {
        setPhase('new_verify')
        setNewOtp('')
      } else if (siteKey) {
        resetTurnstile()
      }
    } finally {
      setSending(false)
    }
  }

  const verifyNew = async () => {
    const email = newEmail.trim().toLowerCase()
    const code = newOtp.trim()
    if (code.length !== 6) {
      toast.error('请输入 6 位验证码')

      return
    }
    setVerifying(true)
    try {
      const res = await authApi.emailChangeNewVerify({ email, code })
      if (res.code === 0 && res.data) {
        onEmailUpdated(res.data.email, res.data.email_verified)
        setNewEmail('')
        setOldOtp('')
        setNewOtp('')
        setPhase('old_send')
      }
    } finally {
      setVerifying(false)
    }
  }

  const turnstileBlocking = Boolean(siteKey) && !turnstileScriptLoaded
  const displayCurrent = hasBound ? boundEmail : '未绑定'

  return (
    <Card className='shadow-sm'>
      <CardHeader>
        <CardTitle>修改邮箱</CardTitle>
        <CardDescription>
          当前邮箱：<span className='text-foreground font-medium'>{displayCurrent}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {siteKey ? <Script src={TURNSTILE_SCRIPT} strategy='afterInteractive' onLoad={onTurnstileScriptLoad} /> : null}

        {siteKey ? (
          <div className='flex min-h-[65px] justify-start'>
            <div ref={turnstileContainerRef} />
          </div>
        ) : null}

        {phase === 'old_send' ? (
          <div className='space-y-4'>
            <p className='text-muted-foreground text-sm'>
              为保障账号安全，将向当前绑定邮箱发送验证码，验证通过后再绑定新邮箱。
            </p>
            <Button type='button' onClick={() => void sendOldCode()} disabled={sending || turnstileBlocking} className='w-full'>
              {sending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {sending ? '发送中...' : '发送验证码至当前邮箱'}
            </Button>
          </div>
        ) : null}

        {phase === 'old_verify' ? (
          <div className='space-y-4'>
            <Label htmlFor={oldOtpId}>请输入发送至当前邮箱的 6 位验证码</Label>
            <InputOTP id={oldOtpId} maxLength={6} value={oldOtp} onChange={setOldOtp} disabled={verifying}>
              <InputOTPGroup className='gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border'>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className='gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border'>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Button
                type='button'
                variant='outline'
                className='sm:flex-1'
                onClick={() => void sendOldCode()}
                disabled={sending || turnstileBlocking}
              >
                重发验证码
              </Button>
              <Button type='button' className='sm:flex-1' onClick={() => void verifyOld()} disabled={verifying || oldOtp.trim().length !== 6}>
                {verifying && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                验证原邮箱
              </Button>
            </div>
          </div>
        ) : null}

        {phase === 'new_input' ? (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='newEmailBind'>新邮箱</Label>
              <Input
                id='newEmailBind'
                type='email'
                autoComplete='email'
                placeholder='name@example.com'
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>
            <Button type='button' onClick={() => void sendNewCode()} disabled={sending || turnstileBlocking} className='w-full'>
              {sending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {sending ? '发送中...' : '发送验证码至新邮箱'}
            </Button>
          </div>
        ) : null}

        {phase === 'new_verify' ? (
          <div className='space-y-4'>
            <Label htmlFor={newOtpId}>请输入发送至新邮箱的 6 位验证码</Label>
            <InputOTP id={newOtpId} maxLength={6} value={newOtp} onChange={setNewOtp} disabled={verifying}>
              <InputOTPGroup className='gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border'>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className='gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border'>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Button
                type='button'
                variant='outline'
                className='sm:flex-1'
                onClick={() => void sendNewCode()}
                disabled={sending || turnstileBlocking}
              >
                重发验证码
              </Button>
              <Button type='button' className='sm:flex-1' onClick={() => void verifyNew()} disabled={verifying || newOtp.trim().length !== 6}>
                {verifying && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                完成绑定
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
