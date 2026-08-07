import { Fragment } from 'react'
import { House } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Link } from '@/i18n/routing'

function toTitleCase(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function DocsBreadcrumb({ paths }: { paths: string[] }) {
  return (
    <Breadcrumb className='pb-5'>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link aria-label='Documentation Home' href='/docs' title='Documentation Home'>
              <House className='h-4' />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {paths.length > 2 ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  aria-label={toTitleCase(paths[0])}
                  href={`/docs/${paths[0]}`}
                  title={toTitleCase(paths[0])}
                >
                  {toTitleCase(paths[0])}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis className='h-1' />
            </BreadcrumbItem>

            {paths.slice(-1).map(path => (
              <Fragment key={path}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{toTitleCase(path)}</BreadcrumbPage>
                </BreadcrumbItem>
              </Fragment>
            ))}
          </>
        ) : (
          paths.map((path, index) => {
            const href = `/docs/${paths.slice(0, index + 1).join('/')}`

            return (
              <Fragment key={path}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index < paths.length - 1 ? (
                    <BreadcrumbLink asChild>
                      <Link aria-label={toTitleCase(path)} href={href} title={toTitleCase(path)}>
                        {toTitleCase(path)}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{toTitleCase(path)}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
