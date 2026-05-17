import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import ResetPassword from '@/components/auth/reset-password/reset-password'
import { buildAlternates, NO_INDEX_ROBOTS } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AuthMetadata' })

  return {
    title: t('resetPassword'),
    robots: NO_INDEX_ROBOTS,
    alternates: buildAlternates('/reset-password', locale)
  }
}

const ResetPasswordPage = () => {
  return <ResetPassword />
}

export default ResetPasswordPage
