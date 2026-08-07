'use client'

import Logo from '@/components/logo'

import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'

export function DocsLogo({ className }: { className?: string }) {
  return (
    <Link
      aria-label='CopyApes Docs'
      className={cn(className ?? 'hidden md:flex')}
      href='/docs'
      title='CopyApes Docs'
    >
      <Logo />
    </Link>
  )
}
