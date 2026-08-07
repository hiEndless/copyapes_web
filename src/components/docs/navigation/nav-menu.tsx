'use client'

import { ArrowUpRight } from 'lucide-react'

import { DocsAnchor } from '@/components/docs/anchor'
import { SheetClose } from '@/components/ui/sheet'
import { docsNavigations } from '@/lib/docs/navigation'

export function DocsNavMenu({ isSheet = false }: { isSheet?: boolean }) {
  return (
    <>
      {docsNavigations.map(item => {
        const Comp = (
          <DocsAnchor
            absolute
            activeClassName='text-primary font-bold'
            className='flex items-center gap-1 text-sm'
            href={item.href}
            key={item.title + item.href}
          >
            {item.title}
            {'external' in item && item.external ? (
              <ArrowUpRight className='h-3 w-3 align-super' strokeWidth={3} />
            ) : null}
          </DocsAnchor>
        )

        return isSheet ? (
          <SheetClose asChild key={item.title + item.href}>
            {Comp}
          </SheetClose>
        ) : (
          Comp
        )
      })}
    </>
  )
}
