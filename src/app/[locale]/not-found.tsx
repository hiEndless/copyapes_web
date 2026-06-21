import type { Metadata } from 'next'

import ErrorPage04 from '@/components/shadcn-studio/blocks/error-page-04/error-page-04'
import { NO_INDEX_ROBOTS } from '@/lib/seo'

export const metadata: Metadata = {
  title: '404',
  robots: NO_INDEX_ROBOTS
}

export default function NotFound() {
  return <ErrorPage04 />
}
