import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import HeroSection from '@/components/blocks/hero-section-27/hero-section-27'
import HomeBelowFold from './_components/home-below-fold'

import { avatarMotionData } from '@/assets/data/hero-section'
import { getFaqItems } from '@/assets/data/faqs'

import SectionSeparator from '@/components/section-separator'
import { buildHomePageJsonLd, buildSocialMetadata, jsonLdScriptProps } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return buildSocialMetadata({
    locale,
    path: '/',
    title: t('titleDefault'),
    description: t('description'),
    siteName: t('siteName')
  })
}

const HomeJsonLd = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const faqs = await getFaqItems(locale)

  return (
    <script
      {...jsonLdScriptProps(
        buildHomePageJsonLd({
          locale,
          name: t('siteName'),
          description: t('description'),
          faqs,
          dateModified: '2026-07-30'
        })
      )}
    />
  )
}

const Home = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params

  return (
    <>
      <HeroSection avatarMotion={avatarMotionData} />
      <SectionSeparator />
      <HomeBelowFold />
      <HomeJsonLd locale={locale} />
    </>
  )
}

export default Home
