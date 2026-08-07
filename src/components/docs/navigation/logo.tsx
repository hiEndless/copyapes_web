'use client'

import { useTranslations } from 'next-intl'

import Logo from '@/components/logo'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'

export function DocsLogo({ className }: { className?: string }) {
  const t = useTranslations('Docs')
  const brandTitle = t('brandTitle')

  return (
    <Link
      aria-label={brandTitle}
      className={cn(className ?? 'hidden md:flex')}
      href='/docs'
      title={brandTitle}
    >
      <Logo />
    </Link>
  )
}
