'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react'
import Script from 'next/script'
import { toast } from 'sonner'

import { useRouter } from '@/i18n/routing'

import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { PrimaryFlowButton } from '@/components/ui/flow-button'
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

const ForgotPasswordForm = () => {
  const router = useRouter()
  const siteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()
  const { turnstileScriptLoaded, onTurnstileScriptLoad } = useTurnstileScriptLoaded(siteKey)
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<TurnstileWidgetId | null>(null)

  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [codeCooldown, setCodeCooldown] = useState(0)

  const otpId = useId()

  useEffect(() => {
    if (codeCooldown <= 0) {
      return
    }
    const t = window.setInterval(() => {
      setCodeCooldown(s => (s > 0 ? s - 1 : 0))
    }, 1000)

    return () => clearInterval(t)
  }, [codeCooldown])

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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (codeCooldown > 0) {
      return
    }
    const trimmed = (email || '').trim().toLowerCase()
    if (!trimmed) {
      toast.error('请输入邮箱')

      return
    }
    const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!re.test(trimmed)) {
      toast.error('邮箱格式错误')

      return
    }

    const cf = getCfToken()
    if (siteKey && !cf) {
      return
    }

    setSending(true)
    try {
      const res = await authApi.passwordResetEmailSendCode({
        email: trimmed,
        ...(cf ? { cf_turnstile_token: cf } : {}),
      })
      if (res.code === 0) {
        setEmail(trimmed)
        setStep(2)
        setCode('')
        setCodeCooldown(60)
      } else if (siteKey) {
        resetTurnstile()
      }
    } finally {
      setSending(false)
    }
  }

  const handleResendCode = async () => {
    if (codeCooldown > 0) {
      return
    }
    const cf = getCfToken()
    if (siteKey && !cf) {
      return
    }
    setSending(true)
    try {
      const res = await authApi.passwordResetEmailSendCode({
        email: email.trim().toLowerCase(),
        ...(cf ? { cf_turnstile_token: cf } : {}),
      })
      if (res.code === 0) {
        setCode('')
        setCodeCooldown(60)
      } else if (siteKey) {
        resetTurnstile()
      }
    } finally {
      setSending(false)
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedCode = code.trim()
    if (trimmedCode.length !== 6) {
      toast.error('请输入 6 位验证码')

      return
    }
    if (newPassword.length < 6) {
      toast.error('新密码长度不能少于 6 位')

      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次密码输入不一致')

      return
    }

    setSubmitting(true)
    try {
      const res = await authApi.passwordResetEmailConfirm({
        email: email.trim().toLowerCase(),
        code: trimmedCode,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      if (res.code === 0) {
        router.push('/login')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const turnstileBlocking = Boolean(siteKey) && !turnstileScriptLoaded

  return (
    <div className='space-y-4'>
      {siteKey ? <Script src={TURNSTILE_SCRIPT} strategy='afterInteractive' onLoad={onTurnstileScriptLoad} /> : null}

      {siteKey ? (
        <div className='flex min-h-[65px] justify-start'>
          <div ref={turnstileContainerRef} />
        </div>
      ) : null}

      {step === 1 ? (
        <form className='space-y-4' onSubmit={handleSendCode}>
          <div className='space-y-1'>
            <Label className='leading-5' htmlFor='resetEmail'>
              邮箱地址*
            </Label>
            <Input
              type='email'
              id='resetEmail'
              autoComplete='email'
              placeholder='请输入已绑定账号的邮箱'
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={sending}
            />
          </div>

          <PrimaryFlowButton
            className='w-full *:w-full [&>button]:after:-inset-55'
            type='submit'
            disabled={sending || turnstileBlocking || codeCooldown > 0}
          >
            {codeCooldown > 0 ? `${codeCooldown}s后重发` : sending ? '发送中...' : '发送验证码'}
          </PrimaryFlowButton>
        </form>
      ) : (
        <form className='space-y-4' onSubmit={handleConfirm}>
          <div className='space-y-1'>
            <Label className='leading-5'>邮箱</Label>
            <Input type='email' value={email} readOnly disabled className='bg-muted/40' />
          </div>

          <div className='space-y-2'>
            <Label htmlFor={otpId}>邮箱验证码（6 位）</Label>
            <InputOTP id={otpId} maxLength={6} value={code} onChange={setCode} disabled={submitting}>
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
          </div>

          <div className='w-full space-y-1'>
            <Label className='leading-5' htmlFor='resetNewPassword'>
              新密码*
            </Label>
            <div className='relative'>
              <Input
                id='resetNewPassword'
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete='new-password'
                placeholder='至少 6 位'
                className='pr-9'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                disabled={submitting}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setIsPasswordVisible(v => !v)}
                className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
                disabled={submitting}
              >
                {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className='sr-only'>{isPasswordVisible ? '隐藏密码' : '显示密码'}</span>
              </Button>
            </div>
          </div>

          <div className='w-full space-y-1'>
            <Label className='leading-5' htmlFor='resetConfirmPassword'>
              确认新密码*
            </Label>
            <div className='relative'>
              <Input
                id='resetConfirmPassword'
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                autoComplete='new-password'
                placeholder='请再次输入新密码'
                className='pr-9'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={submitting}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setIsConfirmPasswordVisible(v => !v)}
                className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
                disabled={submitting}
              >
                {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className='sr-only'>{isConfirmPasswordVisible ? '隐藏密码' : '显示密码'}</span>
              </Button>
            </div>
          </div>

          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button
              type='button'
              variant='outline'
              className='sm:flex-1'
              onClick={() => void handleResendCode()}
              disabled={sending || turnstileBlocking || codeCooldown > 0}
            >
              {sending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {codeCooldown > 0 ? `${codeCooldown}s后重发` : '重发验证码'}
            </Button>
            <PrimaryFlowButton
              className='sm:flex-1 *:w-full [&>button]:after:-inset-55'
              type='submit'
              disabled={submitting || code.trim().length !== 6 || turnstileBlocking}
            >
              {submitting ? '提交中...' : '重置密码'}
            </PrimaryFlowButton>
          </div>

          <Button type='button' variant='ghost' className='w-full' onClick={() => setStep(1)} disabled={submitting}>
            返回修改邮箱
          </Button>
        </form>
      )}
    </div>
  )
}

export default ForgotPasswordForm
