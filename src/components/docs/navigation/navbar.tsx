'use client'

import { DocsLocaleSwitcher } from '@/components/docs/navigation/locale-switcher'
import { DocsLogo } from '@/components/docs/navigation/logo'
import { DocsNavMenu } from '@/components/docs/navigation/nav-menu'
import { DocsModeToggle } from '@/components/docs/navigation/theme-toggle'
import { DocsSearch } from '@/components/docs/search'
import { DocsSheetLeft } from '@/components/docs/sidebar'
import type { DocsNavItem } from '@/lib/docs/nav'
import type { DocsSearchDocument } from '@/lib/docs/search'

export function DocsNavbar({
  navItems,
  searchDocuments
}: {
  navItems: DocsNavItem[]
  searchDocuments: DocsSearchDocument[]
}) {
  return (
    <nav className='bg-opacity-5 sticky top-0 z-50 mx-auto flex h-16 w-full items-center justify-between border-b p-1 px-2 backdrop-blur-xl backdrop-filter sm:p-3 md:gap-2 md:px-4'>
      <div className='flex items-center gap-5'>
        <DocsSheetLeft items={navItems} searchDocuments={searchDocuments} />
        <DocsLogo />
        <div className='text-muted-foreground hidden items-center gap-5 text-sm font-medium md:flex'>
          <DocsNavMenu />
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <div className='hidden min-w-48 sm:block md:min-w-64'>
          <DocsSearch documents={searchDocuments} navItems={navItems} />
        </div>
        <div className='flex gap-2 sm:ml-0'>
          <DocsLocaleSwitcher />
          <DocsModeToggle />
        </div>
      </div>
    </nav>
  )
}
