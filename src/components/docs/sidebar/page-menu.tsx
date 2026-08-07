'use client'

import { DocsSubLink } from '@/components/docs/sidebar/sublink'
import { Separator } from '@/components/ui/separator'
import type { DocsNavItem } from '@/lib/docs/nav'
import { isNavRoute } from '@/lib/docs/nav'
import { usePathname } from '@/i18n/routing'

export function DocsPageMenu({ items, isSheet = false }: { items: DocsNavItem[]; isSheet?: boolean }) {
  const path = usePathname()

  if (!path.startsWith('/docs')) return null

  if (!items.length) {
    return <p className='text-muted-foreground text-sm'>暂无文档。</p>
  }

  return (
    <div className='flex flex-col gap-3.5 pb-6'>
      {items.map((item, index) => {
        if ('spacer' in item) {
          return <Separator className='my-2' key={`spacer-${index}`} />
        }

        if (!isNavRoute(item)) return null

        return (
          <div key={`${item.title}-${item.href}-${index}`}>
            {item.heading ? <div className='mb-4 text-sm font-bold'>{item.heading}</div> : null}
            <DocsSubLink {...item} level={0} isSheet={isSheet} />
          </div>
        )
      })}
    </div>
  )
}
