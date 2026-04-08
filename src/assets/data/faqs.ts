import type { FAQs } from '@/components/blocks/faq/faq'
import { useTranslations } from 'next-intl'

export const useFaqItems = (): FAQs => {
  const t = useTranslations('FAQData')
  return [
    {
      question: t('1.q'),
      answer: t('1.a')
    },
    {
      question: t('2.q'),
      answer: t('2.a')
    },
    {
      question: t('3.q'),
      answer: t('3.a')
    },
    {
      question: t('4.q'),
      answer: t('4.a')
    },
    {
      question: t('5.q'),
      answer: t('5.a')
    },
    {
      question: t('6.q'),
      answer: t('6.a')
    }
  ]
}
