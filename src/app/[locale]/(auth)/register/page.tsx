import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import Register from '@/components/auth/register/register'
import { buildAlternates, NO_INDEX_ROBOTS } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AuthMetadata' })

  return {
    title: t('register'),
    robots: NO_INDEX_ROBOTS,
    alternates: buildAlternates('/register', locale)
  }
}

const RegisterPage = () => {
  return <Register />
}

export default RegisterPage
