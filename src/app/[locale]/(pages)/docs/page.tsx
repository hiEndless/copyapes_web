import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/routing'
import { listContent } from '@/lib/content'
import { buildAlternates } from '@/lib/seo'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  return {
    title: 'Docs',
    description: 'CopyApeS tutorials and product guides',
    alternates: buildAlternates('/docs', locale)
  }
}

const DocsIndexPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const tFooter = await getTranslations({ locale, namespace: 'Footer' })
  const tutorials = await listContent('tutorials', locale)

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8'>
      <div className='space-y-3'>
        <h1 className='text-3xl font-semibold tracking-tight'>{tFooter('tutorial')}</h1>
        <p className='text-muted-foreground leading-7'>CopyApeS product tutorials and guides.</p>
      </div>

      <ul className='mt-10 space-y-4'>
        {tutorials.map(item => (
          <li key={item.slug} className='border-b pb-4'>
            <Link href={`/docs/${item.slug}`} className='text-primary text-lg font-medium hover:underline'>
              {item.title}
            </Link>
            {item.description ? <p className='text-muted-foreground mt-1 text-sm'>{item.description}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DocsIndexPage
