import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import AboutSection from '@/components/blocks/about/about-section'
import { buildSocialMetadata } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'About' })
  const tm = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    ...buildSocialMetadata({
      locale,
      path: '/about',
      title: t('metadata.title'),
      description: t('metadata.description'),
      siteName: tm('siteName')
    })
  }
}

const AboutPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params

  return <AboutSection locale={locale} />
}

export default AboutPage
