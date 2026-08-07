'use client'

import { ArrowUpRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DocsAnchor } from '@/components/docs/anchor'
import { SheetClose } from '@/components/ui/sheet'
import { docsNavigations } from '@/lib/docs/navigation'

export function DocsNavMenu({ isSheet = false }: { isSheet?: boolean }) {
  const t = useTranslations('Docs')

  return (
    <>
      {docsNavigations.map(item => {
        const title = t(item.titleKey)
        const Comp = (
          <DocsAnchor
            absolute
            activeClassName='text-primary font-bold'
            className='flex items-center gap-1 text-sm'
            href={item.href}
            key={item.titleKey + item.href}
          >
            {title}
            {'external' in item && item.external ? (
              <ArrowUpRight className='h-3 w-3 align-super' strokeWidth={3} />
            ) : null}
          </DocsAnchor>
        )

        return isSheet ? (
          <SheetClose asChild key={item.titleKey + item.href}>
            {Comp}
          </SheetClose>
        ) : (
          Comp
        )
      })}
    </>
  )
}
