'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { DocsAnchor } from '@/components/docs/anchor'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { SheetClose } from '@/components/ui/sheet'
import type { DocsNavItem } from '@/lib/docs/nav'
import { isNavRoute } from '@/lib/docs/nav'
import { usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type DocsSubLinkProps = Extract<DocsNavItem, { title: string; href: string }> & {
  level: number
  isSheet: boolean
}

export function DocsSubLink(props: DocsSubLinkProps) {
  const path = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    if (props.href && path !== props.href && path.includes(props.href)) {
      Promise.resolve().then(() => setIsOpen(true))
    }
  }, [path, props.href])

  const { title, href, items, noLink, level, isSheet } = props

  const Comp = (
    <DocsAnchor activeClassName='text-primary text-sm font-semibold' href={href}>
      {title}
    </DocsAnchor>
  )

  const titleOrLink = !noLink ? (
    isSheet ? (
      <SheetClose asChild>{Comp}</SheetClose>
    ) : (
      Comp
    )
  ) : (
    <h2 className='text-primary font-bold sm:text-sm'>{title}</h2>
  )

  if (!items) {
    return <div className='flex flex-col text-sm'>{titleOrLink}</div>
  }

  return (
    <div className='flex w-full flex-col gap-1'>
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <div className='mr-3 flex items-center gap-2 text-sm'>
          {titleOrLink}
          <CollapsibleTrigger asChild>
            <Button className='ml-auto h-6 w-6' size='icon' variant='link'>
              {!isOpen ? (
                <ChevronRight className='h-[0.9rem] w-[0.9rem]' />
              ) : (
                <ChevronDown className='h-[0.9rem] w-[0.9rem]' />
              )}
              <span className='sr-only'>Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className='docs-collapsible-content'>
          <div
            className={cn(
              'mt-2.5 flex flex-col items-start gap-3 border-l pl-4 text-sm',
              level > 0 && 'ml-1 border-l pl-4'
            )}
          >
            {items.filter(isNavRoute).map(innerLink => (
              <DocsSubLink
                key={innerLink.href}
                {...innerLink}
                level={level + 1}
                isSheet={isSheet}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
