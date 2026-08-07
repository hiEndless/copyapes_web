import type { ReactNode } from 'react'

import { DocsSidebar } from '@/components/docs/sidebar'
import type { DocsNavItem } from '@/lib/docs/nav'

export function DocsShell({
  children,
  navItems
}: {
  children: ReactNode
  navItems: DocsNavItem[]
}) {
  return (
    <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='flex items-start gap-10 pt-10 pb-16'>
        <DocsSidebar items={navItems} />
        <div className='min-w-0 flex-1 md:flex-[6]'>{children}</div>
      </div>
    </div>
  )
}
