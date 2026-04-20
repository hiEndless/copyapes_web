'use client'

import { useState } from 'react'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from '@/i18n/routing'

import { Link } from '@/i18n/routing'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PrimaryFlowButton } from '@/components/ui/flow-button'
import { authApi } from '@/api/auth'

const LoginForm = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      toast.error('请输入用户名和密码')

      return
    }

    try {
      setIsLoading(true)
      const res = await authApi.login({ username, password })

      if (res.code === 0 && res.data) {
        toast.success('登录成功')
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userInfo', JSON.stringify(res.data))
        document.cookie = `token=${res.data.token}; path=/; max-age=1209600;` // 14 days
        router.push('/dashboard') // or '/' depending on where it should go
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
        <Label className='leading-5' htmlFor='username'>
          用户名 / 邮箱地址*
        </Label>
        <Input
          type='text'
          id='username'
          placeholder='请输入您的用户名或邮箱地址'
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
            <span className='sr-only'>{isVisible ? '隐藏密码' : '显示密码'}</span>
          </Button>
        </div>
      </div>

      {/* Remember Me and Forgot Password */}
      <div className='flex items-center justify-between gap-y-2'>
        <div className='flex items-center gap-3'>
          <Checkbox id='rememberMe' className='size-6' disabled={isLoading} />
          <Label htmlFor='rememberMe'>记住我</Label>
        </div>

        <Link href='/forgot-password' className='hover:underline'>
          忘记密码？
        </Link>
      </div>

      <PrimaryFlowButton className='w-full *:w-full [&>button]:after:-inset-55' type='submit' disabled={isLoading}>
        {isLoading ? '登录中...' : '登录'}
      </PrimaryFlowButton>
    </form>
  )
}

export default LoginForm
