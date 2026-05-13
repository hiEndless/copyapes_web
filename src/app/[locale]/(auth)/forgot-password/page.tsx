import type { Metadata } from 'next'

import ForgotPassword from '@/components/auth/forgot-password/forgot-password'

export const metadata: Metadata = {
  title: '忘记密码',
  robots: 'noindex,nofollow',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/forgot-password`
  }
}

const ForgotPasswordPage = () => {
  return <ForgotPassword />
}

export default ForgotPasswordPage
