import Image from 'next/image'
import NextLink from 'next/link'

import { docsBrand } from '@/lib/docs/navigation'
import { Link } from '@/i18n/routing'

export function DocsFooter() {
  return (
    <footer className='text-foreground flex h-16 w-full flex-wrap items-center justify-center gap-4 border-t px-2 py-3 text-sm sm:justify-between sm:gap-0 sm:px-4 sm:py-0 lg:px-8'>
      <p className='items-center'>
        &copy; {new Date().getFullYear()}{' '}
        <Link aria-label={docsBrand.name} className='font-semibold' href='/' title={docsBrand.name}>
          {docsBrand.name}
        </Link>
        .
      </p>
      <div className='hidden items-center md:block'>
        <NextLink
          aria-label={docsBrand.name}
          className='font-semibold'
          href={docsBrand.link}
          title={docsBrand.name}
        >
          <Image
            alt={`${docsBrand.name} logo`}
            height={30}
            priority={false}
            src={docsBrand.siteicon}
            title={`${docsBrand.name} logo`}
            width={30}
          />
        </NextLink>
      </div>
    </footer>
  )
}
