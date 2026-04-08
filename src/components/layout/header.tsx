'use client'

import { useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'

import Logo from '@/components/logo'

import { PrimaryFlowButton, SecondaryFlowButton } from '@/components/ui/flow-button'
import { ModeToggle } from '@/components/layout/mode-toggle'
import { LocaleSwitcher } from '@/components/layout/locale-switcher'

import { HeaderNavigation, HeaderNavigationSmallScreen, type Navigation } from '@/components/layout/header-navigation'

import { cn } from '@/lib/utils'

type HeaderProps = {
  navigationData: Navigation[]
  className?: string
}

const Header = ({ navigationData, className }: HeaderProps) => {
  const t = useTranslations('Header')
  const [isScrolled, setIsScrolled] = useState(false)

  const scrollRaf = useRef<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRaf.current != null) return
      scrollRaf.current = requestAnimationFrame(() => {
        scrollRaf.current = null
        const next = window.scrollY > 0

        setIsScrolled(prev => (prev === next ? prev : next))
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollRaf.current != null) cancelAnimationFrame(scrollRaf.current)
    }
  }, [])

  return (
    <header
      className={cn(
        'bg-background sticky top-0 z-50 h-16 w-full transition-all duration-300',
        {
          'bg-card/75 backdrop-blur-sm': isScrolled
        },
        className
      )}
    >
      <div className='flex h-full items-center justify-between gap-4 border-b px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <Link href='/#home'>
          <Logo />
        </Link>

        {/* Navigation */}
        <HeaderNavigation
          navigationData={navigationData}
          navigationClassName='[&_[data-slot="navigation-menu-list"]]:gap-1'
        />

        {/* Actions */}
        <div className='flex gap-4 sm:gap-6'>
          <LocaleSwitcher />
          <ModeToggle />

          <SecondaryFlowButton size='default' className='max-sm:hidden' asChild>
            <Link href='/login'>{t('login')}</Link>
          </SecondaryFlowButton>

          <PrimaryFlowButton size='default' className='max-sm:hidden' asChild>
            <Link href='/register'>{t('register')}</Link>
          </PrimaryFlowButton>

          <HeaderNavigationSmallScreen navigationData={navigationData} t={t} />
        </div>
      </div>
    </header>
  )
}

export default Header
