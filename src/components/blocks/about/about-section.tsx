import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/routing'

type AboutSectionProps = {
  locale: string
  compact?: boolean
}

const AboutSection = async ({ locale, compact = false }: AboutSectionProps) => {
  const t = await getTranslations({ locale, namespace: 'About' })

  const paragraphs = ['p1', 'p2', 'p3', 'p4'] as const
  const points = ['point1', 'point2', 'point3', 'point4'] as const

  return (
    <section id='about' className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8'>
        <div className='space-y-3 text-center sm:text-left'>
          <p className='text-primary text-sm font-medium uppercase'>{t('badge')}</p>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>{t('title')}</h2>
          <p className='text-muted-foreground text-xl'>{t('subtitle')}</p>
        </div>

        <div className='text-muted-foreground space-y-4 leading-7'>
          {paragraphs.map(key => (
            <p key={key}>{t(key)}</p>
          ))}
        </div>

        {!compact ? (
          <div className='border-border bg-muted/30 space-y-3 rounded-xl border p-4 sm:p-5'>
            <h3 className='text-foreground text-lg font-semibold'>{t('trustTitle')}</h3>
            <ul className='text-muted-foreground list-disc space-y-2 pl-5 leading-7'>
              {(['trust1', 'trust2', 'trust3', 'trust4'] as const).map(key => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
            <p className='text-muted-foreground text-sm leading-6'>{t('disclosure')}</p>
          </div>
        ) : null}

        {!compact ? (
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>{t('pointsTitle')}</h3>
            <ul className='text-muted-foreground list-disc space-y-2 pl-5 leading-7'>
              {points.map(key => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className='text-muted-foreground'>
            <Link href='/about' className='text-primary hover:underline'>
              {t('readMore')}
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}

export default AboutSection
