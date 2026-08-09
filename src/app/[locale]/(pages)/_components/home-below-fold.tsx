'use client'

import dynamic from 'next/dynamic'

import { usePricingPlans } from '@/assets/data/pricing'
import { useTestimonials } from '@/assets/data/testimonials-component-06'
import { useFaqItems } from '@/assets/data/faqs'
import { useBenefits } from '@/assets/data/benefits'
import SectionSeparator from '@/components/section-separator'

const BentoGrid = dynamic(() => import('@/components/blocks/bento-grid-17/bento-grid-17'), {
  ssr: false,
  loading: () => null
})

const Benefits = dynamic(() => import('@/components/blocks/benefits/benefits'), {
  ssr: false,
  loading: () => null
})

const Testimonials = dynamic(() => import('@/components/blocks/testimonials-component-06/testimonials-component-06'), {
  ssr: false,
  loading: () => null
})

const Pricing = dynamic(() => import('@/components/blocks/pricing/pricing'), {
  ssr: false,
  loading: () => null
})

const FAQ = dynamic(() => import('@/components/blocks/faq/faq'), {
  ssr: false,
  loading: () => null
})

const Partners = dynamic(() => import('@/components/blocks/partners/partners'), {
  ssr: false,
  loading: () => null
})

const ContactUs = dynamic(() => import('@/components/blocks/contact-us-page-02/contact-us-page-02'), {
  ssr: false,
  loading: () => null
})

const HomeBelowFold = () => {
  const benefits = useBenefits()
  const testimonials = useTestimonials()
  const plans = usePricingPlans()
  const faqItems = useFaqItems()

  return (
    <>
      <BentoGrid />

      <SectionSeparator />

      <Benefits featuresList={benefits} />

      <SectionSeparator />

      <Testimonials testimonials={testimonials} />

      <SectionSeparator />

      <Pricing plans={plans} />

      <SectionSeparator />

      <FAQ faqItems={faqItems} />

      <Partners />

      <ContactUs />
    </>
  )
}

export default HomeBelowFold
