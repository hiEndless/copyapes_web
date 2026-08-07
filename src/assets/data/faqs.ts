import type { FAQs } from '@/components/blocks/faq/faq'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

const FAQ_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const

function mapFaqItems(t: (key: string) => string): FAQs {
  return FAQ_KEYS.map(key => ({
    question: t(`${key}.q`),
    answer: t(`${key}.a`)
  }))
}

export const useFaqItems = (): FAQs => {
  const t = useTranslations('FAQData')
  return mapFaqItems(t)
}

export async function getFaqItems(locale: string): Promise<FAQs> {
  const t = await getTranslations({ locale, namespace: 'FAQData' })
  return mapFaqItems(t)
}
