import type { ReactNode } from 'react'

import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Geist, Geist_Mono } from 'next/font/google'
import type { Metadata } from 'next'

import { routing } from '@/i18n/routing'
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
    icons: {
      icon: [
        {
          url: '/favicon/favicon.ico',
          sizes: '16x16',
          type: 'image/png'
        },
        {
          url: '/favicon/favicon.ico',
          sizes: '32x32',
          type: 'image/png'
        },
        {
          url: '/favicon/favicon.ico',
          sizes: '48x48',
          type: 'image/x-icon'
        }
      ],
      apple: [
        {
          url: '/favicon/favicon.ico',
          sizes: '180x180',
          type: 'image/png'
        }
      ],
      other: [
        {
          url: '/favicon/favicon.ico',
          rel: 'icon',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          url: '/favicon/favicon.ico',
          rel: 'icon',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== '' ? process.env.NEXT_PUBLIC_APP_URL : 'http://localhost:3000'),
    openGraph: {
      title: {
        template: t('titleTemplate'),
        default: t('titleDefault')
      },
      description: t('description'),
      type: 'website',
      siteName: t('siteName'),
      url: process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== '' ? process.env.NEXT_PUBLIC_APP_URL : 'http://localhost:3000',
      images: [
        {
          url: '/images/og-image.png',
          type: 'image/png',
          width: 1200,
          height: 630,
          alt: t('titleDefault')
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: {
        template: t('titleTemplate'),
        default: t('titleDefault')
      },
      description: t('description')
    },
    alternates: {
      canonical: locale === routing.defaultLocale ? '/' : `/${locale}`
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
      lang={locale}
      className={cn(geistSans.variable, geistMono.variable, 'flex min-h-full w-full scroll-smooth antialiased')}
      suppressHydrationWarning
    >
      <body className='flex min-h-full w-full flex-auto flex-col'>
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
