import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/routing'
import { buildSocialMetadata } from '@/lib/seo'

const SECTION_KEYS = ['service', 'account', 'risk', 'compliance', 'privacy', 'changes', 'contact'] as const

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'TermsOfService' })
  const tm = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    ...buildSocialMetadata({
      locale,
      path: '/terms',
      title: t('metadata.title'),
      description: t('metadata.description'),
      siteName: tm('siteName')
    })
  }
}

const TermsPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'TermsOfService' })
  const tf = await getTranslations({ locale, namespace: 'Footer' })

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8'>
      <div className='space-y-3'>
        <h1 className='text-3xl font-semibold tracking-tight'>{t('title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('lastUpdated')}</p>
        <p className='text-muted-foreground leading-7'>{t('intro')}</p>
      </div>

      <div className='mt-10 space-y-8'>
        {SECTION_KEYS.map(key => {
          const items = t.raw(`sections.${key}.items`) as string[] | undefined

          return (
            <section key={key} className='space-y-3'>
              <h2 className='text-lg font-semibold'>{t(`sections.${key}.title`)}</h2>
              <p className='text-muted-foreground leading-7'>{t(`sections.${key}.body`)}</p>
              {Array.isArray(items) && items.length > 0 ? (
                <ul className='text-muted-foreground list-disc space-y-2 pl-5 leading-7'>
                  {items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {key === 'privacy' ? (
                <p>
                  <Link href='/privacy' className='text-primary hover:underline'>
                    {tf('privacy')}
                  </Link>
                </p>
              ) : null}
            </section>
          )
        })}
      </div>

      <p className='text-muted-foreground mt-10'>
        <a
          href='https://docs.lichaoyuan.com/copyapes/protocol'
          className='text-primary hover:underline'
          rel='noopener noreferrer'
          target='_blank'
        >
          {t('fullProtocol')}
        </a>
      </p>
    </div>
  )
}

export default TermsPage
