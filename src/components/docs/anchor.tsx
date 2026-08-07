'use client'

import type { ComponentProps } from 'react'

import { Link, usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type DocsAnchorProps = ComponentProps<typeof Link> & {
  absolute?: boolean
  activeClassName?: string
  disabled?: boolean
}

export function DocsAnchor({
  absolute,
  className = '',
  activeClassName = '',
  disabled,
  children,
  ...props
}: DocsAnchorProps) {
  const path = usePathname()
  const href = props.href.toString()

  let isMatch = absolute ? href.split('/')[1] === path.split('/')[1] : path === href

  if (href.includes('http')) isMatch = false

  if (disabled) return <div className={cn(className, 'cursor-not-allowed')}>{children}</div>

  return (
    <Link className={cn(className, isMatch && activeClassName)} {...props}>
      {children}
    </Link>
  )
}
