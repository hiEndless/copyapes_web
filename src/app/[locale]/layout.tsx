import type { ReactNode } from 'react'

import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Geist, Geist_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import Script from 'next/script'

import { routing } from '@/i18n/routing'
import { buildAlternates, buildOgImage, getCanonicalUrl, getSiteUrl } from '@/lib/seo'
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
    metadataBase: new URL(getSiteUrl()),
    openGraph: {
      title: {
        template: t('titleTemplate'),
        default: t('titleDefault')
      },
      description: t('description'),
      type: 'website',
      siteName: t('siteName'),
      url: getCanonicalUrl('/', locale),
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
    },
    alternates: buildAlternates('/', locale)
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
    <head>
      <Script id='LA_COLLECT' src='https://sdk.51.la/js-sdk-pro.min.js' strategy='afterInteractive' />
      <Script
        id='LA_INIT'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: 'LA.init({id:"3ID9Aw1hNsoyCcId",ck:"3ID9Aw1hNsoyCcId"})'
        }}
      />
      <Script
        id='gtm-script'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T656N8D8');`
        }}
      />
    </head>
    <body className='flex min-h-full w-full flex-auto flex-col'>
    {/* Google Tag Manager (noscript) */}
    <noscript dangerouslySetInnerHTML={{
          __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T656N8D8"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`
    }} />
    {/* End Google Tag Manager (noscript) */}
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
