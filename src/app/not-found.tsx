import { routing } from '@/i18n/routing'

export default function NotFound() {
  return (
    <html lang={routing.defaultLocale}>
      <body>
        <h1>Not found</h1>
      </body>
    </html>
  )
}
