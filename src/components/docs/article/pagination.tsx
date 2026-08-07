import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Link } from '@/i18n/routing'
import type { DocsPageRoute } from '@/lib/docs/nav'
import { getDocsPreviousNext } from '@/lib/docs/nav'

export function DocsPagination({
  slug,
  routes
}: {
  slug: string
  routes: DocsPageRoute[]
}) {
  const res = getDocsPreviousNext(slug, routes)

  return (
    <div className='flex items-center justify-between py-5 sm:py-7'>
      {res.prev ? (
        <Link
          className='border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap no-underline! shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
          href={res.prev.href}
          rel='prev'
          title={`Previous: ${res.prev.title}`}
        >
          <ChevronLeft className='mr-1 h-4 w-4' />
          <span>{res.prev.title}</span>
        </Link>
      ) : null}
      {res.next ? (
        <Link
          className='border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring ml-auto inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap no-underline! shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
          href={res.next.href}
          rel='next'
          title={`Next: ${res.next.title}`}
        >
          <span>{res.next.title}</span>
          <ChevronRight className='ml-1 h-4 w-4' />
        </Link>
      ) : null}
    </div>
  )
}
