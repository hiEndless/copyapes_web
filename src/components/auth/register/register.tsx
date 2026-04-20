import { Link } from '@/i18n/routing'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import Logo from '@/components/logo'
import RegisterForm from '@/components/auth/register/register-form'

const Register = () => {
  return (
    <div className='flex flex-col gap-6'>
      <Link href='/'>
        <Logo />
      </Link>

      <div>
        <h1 className='mb-2 text-2xl font-semibold'>注册</h1>
        <p className='text-muted-foreground'>开始您的免费体验</p>
      </div>

      {/* Form */}
      <RegisterForm />

      <div className='space-y-4'>
        <p className='text-muted-foreground text-center'>
          已有账号？{' '}
          <Link href='/login' className='text-foreground hover:underline'>
            登录
          </Link>
        </p>

        {/* <div className='flex items-center gap-4'>
          <Separator className='flex-1' />
          <p>or</p>
          <Separator className='flex-1' />
        </div>

        <Button variant='ghost' className='w-full' asChild>
          <Link href='#'>Sign up with google</Link>
        </Button> */}
      </div>
    </div>
  )
}

export default Register
