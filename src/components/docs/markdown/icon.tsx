import type { CSSProperties } from 'react'
import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

const iconMap = {
  star: Star
} as const

type DocsIconProps = {
  icon?: keyof typeof iconMap | string
  color?: string
  className?: string
  size?: number
}

/** Mintlify `<Icon />` compatibility shim for migrated docs. */
export function DocsIcon({ icon = 'star', color, className, size = 16 }: DocsIconProps) {
  const Comp = iconMap[icon as keyof typeof iconMap] ?? Star
  const style: CSSProperties | undefined = color ? { color } : undefined

  return <Comp aria-hidden className={cn('mr-1 inline-block align-text-bottom', className)} size={size} style={style} />
}
