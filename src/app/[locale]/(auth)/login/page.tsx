import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import Login from '@/components/auth/login/login'
import { buildAlternates, NO_INDEX_ROBOTS } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AuthMetadata' })

  return {
    title: t('login'),
    robots: NO_INDEX_ROBOTS,
    alternates: buildAlternates('/login', locale)
  }
}

const LoginPage = () => {
  return <Login />
}

export default LoginPage
