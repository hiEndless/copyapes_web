import type { Metadata } from 'next'

import { routing } from '@/i18n/routing'
import { NO_INDEX_ROBOTS } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: NO_INDEX_ROBOTS
}

export default function NotFound() {
  return (
    <html lang={routing.defaultLocale}>
      <body>
        <h1>Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </body>
    </html>
  )
}
