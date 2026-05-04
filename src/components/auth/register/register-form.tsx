'use client'

import { useState } from 'react'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from '@/i18n/routing'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PrimaryFlowButton } from '@/components/ui/flow-button'
import { authApi } from '@/api/auth'

const RegisterForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

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

    try {
      setIsLoading(true)

      const res = await authApi.register({
        username,
        password,
        confirm_password: confirmPassword,
        invite_code: inviteCode
      })

      if (res.code === 0) {
        toast.success('注册成功，请登录')
        router.push('/login')
      }
    } catch {
      // toast is handled globally
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
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

      <PrimaryFlowButton className='w-full *:w-full [&>button]:after:-inset-55' type='submit' disabled={isLoading}>
        {isLoading ? '注册中...' : '注册'}
      </PrimaryFlowButton>
    </form>
  )
}

export default RegisterForm
