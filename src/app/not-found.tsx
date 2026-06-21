import type { Metadata } from 'next'

import { Geist, Geist_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'

import ErrorPage04 from '@/components/shadcn-studio/blocks/error-page-04/error-page-04'
import { ThemeProvider } from '@/components/theme-provider'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { NO_INDEX_ROBOTS } from '@/lib/seo'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: '404',
  robots: NO_INDEX_ROBOTS
}

export default async function NotFound() {
  const messages = (await import(`../../messages/${routing.defaultLocale}.json`)).default

  return (
    <html
      lang={routing.defaultLocale}
      className={cn(geistSans.variable, geistMono.variable, 'flex min-h-full w-full scroll-smooth antialiased')}
      suppressHydrationWarning
    >
      <body className='flex min-h-full w-full flex-auto flex-col'>
        <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
          <ThemeProvider attribute='class' defaultTheme='dark' enableSystem={false} disableTransitionOnChange>
            <ErrorPage04 />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
