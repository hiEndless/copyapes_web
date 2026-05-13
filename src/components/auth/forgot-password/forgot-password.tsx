import { ChevronLeftIcon } from 'lucide-react'

import { Link } from '@/i18n/routing'

import { Button } from '@/components/ui/button'

import Logo from '@/components/logo'
import ForgotPasswordForm from '@/components/auth/forgot-password/forgot-password-form'

const ForgotPassword = () => {
  return (
    <div className='flex flex-col gap-6'>
      <Link href='/'>
        <Logo />
      </Link>

      <div>
        <h1 className='mb-2 text-2xl font-semibold'>忘记密码</h1>
        <p className='text-muted-foreground'>向已绑定邮箱获取验证码，验证通过后设置新密码。</p>
      </div>

      <div className='space-y-3'>
        <ForgotPasswordForm />

        <Button asChild variant='ghost' className='group w-full'>
          <Link href='/login'>
            <ChevronLeftIcon className='transition-transform duration-200 group-hover:-translate-x-0.5' />
            <p>返回登录</p>
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default ForgotPassword
