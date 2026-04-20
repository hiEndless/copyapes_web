import { Link } from '@/i18n/routing'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import Logo from '@/components/logo'
import LoginForm from '@/components/auth/login/login-form'

const Login = () => {
  return (
    <div className='flex flex-col gap-6'>
      <Link href='/'>
        <Logo />
      </Link>

      <div>
        <h1 className='mb-3 text-2xl font-semibold md:text-3xl lg:text-4xl'>欢迎回来 👋</h1>
        <p className='text-muted-foreground'>开始您的免费体验</p>
      </div>

      {/* Quick Login Buttons */}
      {/* <div className='flex flex-wrap gap-3'>
        <Button variant='outline' className='grow' asChild>
          <Link href='#'>Login with Google</Link>
        </Button>
        <Button variant='outline' className='grow' asChild>
          <Link href='#'>Login with Facebook</Link>
        </Button>
      </div>

      <div className='flex items-center gap-4'>
        <Separator className='flex-1' />
        <p>Or</p>
        <Separator className='flex-1' />
      </div> */}

      <div className='space-y-6'>
        {/* Form */}
        <LoginForm />

        <p className='text-muted-foreground text-center'>
          还没有账号？{' '}
          <Link href='/register' className='text-foreground hover:underline'>
            注册
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
