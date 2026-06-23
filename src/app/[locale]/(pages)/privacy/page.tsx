import type { Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import { buildAlternates } from '@/lib/seo'

const SECTION_KEYS = ['scope', 'collect', 'use', 'share', 'storage', 'rights', 'contact', 'changes'] as const

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PrivacyPolicy' })

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    alternates: buildAlternates('/privacy', locale)
  }
}

const PrivacyPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PrivacyPolicy' })

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8'>
      <div className='space-y-3'>
        <h1 className='text-3xl font-semibold tracking-tight'>{t('title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('lastUpdated')}</p>
        <p className='text-muted-foreground leading-7'>{t('intro')}</p>
      </div>

      <div className='mt-10 space-y-8'>
        {SECTION_KEYS.map((key) => {
          const items = t.raw(`${key}.items`) as string[] | undefined

          return (
            <section key={key} className='space-y-3'>
              <h2 className='text-lg font-semibold'>{t(`${key}.title`)}</h2>
              <p className='text-muted-foreground leading-7'>{t(`${key}.body`)}</p>
              {Array.isArray(items) && items.length > 0 ? (
                <ul className='text-muted-foreground list-disc space-y-2 pl-5 leading-7'>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default PrivacyPage
