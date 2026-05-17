import type { ReactNode } from 'react'

import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Geist, Geist_Mono } from 'next/font/google'
import type { Metadata } from 'next'

import { routing } from '@/i18n/routing'
import AnalyticsScripts from '@/components/analytics-scripts'
import { buildOgImage, getSiteUrl, localeToLanguageTag, SITE_ICONS } from '@/lib/seo'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

import { cn } from '@/lib/utils'

import '../globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: {
      template: t('titleTemplate'),
      default: t('titleDefault')
    },
    description: t('description'),
    robots: 'index,follow',
    keywords: t.raw('keywords'),
    icons: SITE_ICONS,
    metadataBase: new URL(getSiteUrl()),
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
      : {}),
    openGraph: {
      title: {
        template: t('titleTemplate'),
        default: t('titleDefault')
      },
      description: t('description'),
      type: 'website',
      siteName: t('siteName'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      images: [buildOgImage(locale, t('titleDefault'))]
    },
    twitter: {
      card: 'summary_large_image',
      title: {
        template: t('titleTemplate'),
        default: t('titleDefault')
      },
      description: t('description'),
      images: [buildOgImage(locale, t('titleDefault'))]
    }
  }
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

const RootLayout = async ({
                            children,
                            params
                          }: Readonly<{
  children: ReactNode
  params: Promise<{ locale: string }>
}>) => {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html
      lang={localeToLanguageTag(locale)}
      className={cn(geistSans.variable, geistMono.variable, 'flex min-h-full w-full scroll-smooth antialiased')}
      suppressHydrationWarning
    >
    <body className='flex min-h-full w-full flex-auto flex-col'>
    <AnalyticsScripts />
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider attribute='class' defaultTheme='dark' enableSystem={false} disableTransitionOnChange>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position='bottom-right' />
      </ThemeProvider>
    </NextIntlClientProvider>
    </body>
    </html>
  )
}

export default RootLayout
