'use client'

import { useEffect, useRef, useState } from 'react'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import Script from 'next/script'
import { toast } from 'sonner'

import { useRouter } from '@/i18n/routing'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PrimaryFlowButton } from '@/components/ui/flow-button'
import { authApi } from '@/api/auth'

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

const RegisterForm = () => {
  const siteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [turnstileScriptLoaded, setTurnstileScriptLoaded] = useState(false)
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<TurnstileWidgetId | null>(null)

  const router = useRouter()

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

    if (!username || !password || !confirmPassword || !inviteCode) {
      toast.error('请填写完整信息')

      return
    }

    if (password !== confirmPassword) {
      toast.error('两次密码输入不一致')

      return
    }

    if (!agreed) {
      toast.error('请先同意隐私政策及服务条款')

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
      setIsLoading(true)

      const res = await authApi.register({
        username,
        password,
        confirm_password: confirmPassword,
        invite_code: inviteCode,
        ...(cfToken ? { cf_turnstile_token: cfToken } : {}),
      })

      if (res.code === 0) {
        toast.success('注册成功，请登录')
        router.push('/login')
      } else if (siteKey) {
        resetTurnstile()
      }
    } catch {
      if (siteKey) {
        resetTurnstile()
      }
      // toast is handled globally
    } finally {
      setIsLoading(false)
    }
  }

  const turnstileBlocking = Boolean(siteKey) && !turnstileScriptLoaded

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      {siteKey ? (
        <Script src={TURNSTILE_SCRIPT} strategy='afterInteractive' onLoad={() => setTurnstileScriptLoaded(true)} />
      ) : null}
      {/* Email */}
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='email'>
          邮箱*
        </Label>
        <Input
          type='email'
          id='email'
          placeholder='请输入您的邮箱地址'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Password */}
      <div className='w-full space-y-1'>
        <Label className='leading-5' htmlFor='password'>
          密码*
        </Label>
        <div className='relative'>
          <Input
            id='password'
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder='请输入您的密码'
            className='pr-9'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setIsPasswordVisible(prevState => !prevState)}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
            disabled={isLoading}
          >
            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className='sr-only'>{isPasswordVisible ? '隐藏密码' : '显示密码'}</span>
          </Button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className='w-full space-y-1'>
        <Label className='leading-5' htmlFor='confirmPassword'>
          确认密码*
        </Label>
        <div className='relative'>
          <Input
            id='confirmPassword'
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            placeholder='••••••••••••••••'
            className='pr-9'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setIsConfirmPasswordVisible(prevState => !prevState)}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
            disabled={isLoading}
          >
            {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className='sr-only'>{isConfirmPasswordVisible ? '隐藏密码' : '显示密码'}</span>
          </Button>
        </div>
      </div>


      {/* Invite Code */}
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='inviteCode'>
          邀请码*
        </Label>
        <Input
          type='text'
          id='inviteCode'
          placeholder='请输入邀请码'
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Privacy policy */}
      <div className='flex items-center gap-3'>
        <Checkbox
          id='rememberMe'
          className='size-6'
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked as boolean)}
          disabled={isLoading}
        />
        <Label htmlFor='rememberMe'>同意隐私政策 & 服务条款</Label>
      </div>

      {siteKey ? (
        <div className='flex min-h-[65px] justify-center'>
          <div ref={turnstileContainerRef} />
        </div>
      ) : null}

      <PrimaryFlowButton className='w-full *:w-full [&>button]:after:-inset-55' type='submit' disabled={isLoading || turnstileBlocking}>
        {isLoading ? '注册中...' : '注册'}
      </PrimaryFlowButton>
    </form>
  )
}

export default RegisterForm
