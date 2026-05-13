import { ChevronLeftIcon } from 'lucide-react'

import { Link } from '@/i18n/routing'

import { Button } from '@/components/ui/button'

import Logo from '@/components/logo'
import ResetPasswordForm from '@/components/auth/reset-password/reset-password-form'

const ResetPassword = () => {
  return (
    <div className='flex flex-col gap-6'>
      <Link href='/'>
        <Logo />
      </Link>

      <div>
        <h1 className='mb-2 text-2xl font-semibold'>重置密码</h1>
        <p className='text-muted-foreground'>该入口已合并至忘记密码流程。</p>
      </div>

      <div className='space-y-3'>
        <ResetPasswordForm />

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

export default ResetPassword
