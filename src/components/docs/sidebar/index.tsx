'use client'

import { AlignLeft } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { DocsLogo } from '@/components/docs/navigation/logo'
import { DocsNavMenu } from '@/components/docs/navigation/nav-menu'
import { DocsSearch } from '@/components/docs/search'
import { DocsPageMenu } from '@/components/docs/sidebar/page-menu'
import { useMounted } from '@/components/docs/use-mounted'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import type { DocsNavItem } from '@/lib/docs/nav'
import type { DocsSearchDocument } from '@/lib/docs/search'

export function DocsSidebar({ items }: { items: DocsNavItem[] }) {
  const t = useTranslations('Docs')

  return (
    <aside
      aria-label={t('pageNavigation')}
      className='sticky top-26 hidden h-[calc(100vh-8rem)] min-w-57.5 flex-1 flex-col overflow-y-auto md:flex'
    >
      <ScrollArea>
        <DocsPageMenu items={items} />
      </ScrollArea>
    </aside>
  )
}

export function DocsSheetLeft({
  items,
  searchDocuments = []
}: {
  items: DocsNavItem[]
  searchDocuments?: DocsSearchDocument[]
}) {
  const mounted = useMounted()
  const [open, setOpen] = useState(false)
  const t = useTranslations('Docs')

  if (!mounted) {
    return (
      <Button
        aria-label={t('menu')}
        className='flex cursor-pointer md:hidden'
        size='icon'
        type='button'
        variant='ghost'
      >
        <AlignLeft className='size-6' />
      </Button>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          aria-label={t('menu')}
          className='flex cursor-pointer md:hidden'
          size='icon'
          variant='ghost'
        >
          <AlignLeft className='size-6' />
        </Button>
      </SheetTrigger>
      <SheetContent className='flex h-full flex-col gap-0 px-0' side='left'>
        <SheetTitle className='sr-only'>{t('menu')}</SheetTitle>
        <SheetHeader>
          <SheetClose asChild>
            <div className='px-2'>
              <DocsLogo className='flex' />
            </div>
          </SheetClose>
        </SheetHeader>
        <SheetDescription className='sr-only'>{t('pageNavigation')}</SheetDescription>
        {open ? (
          <ScrollArea className='flex h-full flex-col overflow-y-auto'>
            <div className='mx-0 mt-3 flex flex-col gap-2.5 px-5'>
              <div className='sm:hidden'>
                <DocsSearch documents={searchDocuments} navItems={items} />
              </div>
              <DocsNavMenu isSheet />
              <Separator className='my-2' />
              <DocsPageMenu items={items} isSheet />
            </div>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
