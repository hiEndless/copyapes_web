'use client'

import { Link } from '@/i18n/routing'

import { Button } from '@/components/ui/button'

const ResetPasswordForm = () => {
  return (
    <div className='space-y-4'>
      <p className='text-muted-foreground text-sm'>请前往「忘记密码」页面，通过邮箱验证码完成重置。</p>
      <Button asChild className='w-full'>
        <Link href='/forgot-password'>前往忘记密码</Link>
      </Button>
    </div>
  )
}

export default ResetPasswordForm
