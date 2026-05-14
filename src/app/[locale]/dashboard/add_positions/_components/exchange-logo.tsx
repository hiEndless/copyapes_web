'use client'

import * as React from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

type ExchangeLogoProps = {
  src: string
  alt: string
  size?: number
  className?: string
}

export function ExchangeLogo({ src, alt, size = 40, className }: ExchangeLogoProps) {
  const [failed, setFailed] = React.useState(false)

  if (failed) {
    return (
      <div
        className={cn(
          'bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-xl border text-xs font-semibold',
          className
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {alt.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-background relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className='object-contain p-1.5'
        onError={() => setFailed(true)}
        unoptimized
      />
    </div>
  )
}
