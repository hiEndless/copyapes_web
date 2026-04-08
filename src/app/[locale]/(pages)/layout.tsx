import type { ReactNode } from 'react'

import { useTranslations } from 'next-intl'

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import type { Navigation } from '@/components/layout/header-navigation'

const PagesLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  const t = useTranslations('Navigation')

  const navigationData: Navigation[] = [
    {
      title: t('home'),
      href: '/#home'
    },
    {
      title: t('features'),
      href: '/#features'
    },
    {
      title: t('benefits'),
      href: '/#benefits'
    },
    {
      title: t('testimonials'),
      href: '/#testimonials'
    },
    {
      title: t('pricing'),
      href: '/#pricing'
    },
    {
      title: t('faq'),
      href: '/#faq'
    },
    {
      title: t('contact'),
      href: '/#contact'
    }
  ]

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* Header Section */}
      <Header navigationData={navigationData} />

      {/* Main Content */}
      <main className='flex flex-1 flex-col *:scroll-mt-16'>{children}</main>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

export default PagesLayout
