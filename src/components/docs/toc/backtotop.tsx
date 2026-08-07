'use client'

import type { ReactElement } from 'react'
import { useEffect, useRef } from 'react'
import { ArrowUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

function scrollToTop() {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export function DocsBackToTop(): ReactElement {
  const ref = useRef<HTMLButtonElement>(null)
  const t = useTranslations('Docs')

  useEffect(() => {
    function toggleVisible() {
      const { scrollTop } = document.documentElement

      if (ref.current) {
        ref.current.classList.toggle('opacity-0', scrollTop < 300)
      }
    }

    window.addEventListener('scroll', toggleVisible)

    return () => {
      window.removeEventListener('scroll', toggleVisible)
    }
  }, [])

  return (
    <button
      aria-label={t('scrollToTop')}
      className='text-foreground mt-2 ml-2 flex cursor-pointer items-center self-start text-sm opacity-0 transition'
      onClick={scrollToTop}
      ref={ref}
      title={t('scrollToTop')}
      type='button'
    >
      <ArrowUp className='mr-1 inline-block h-4 w-4 align-middle' />
      <span>{t('scrollToTop')}</span>
    </button>
  )
}
