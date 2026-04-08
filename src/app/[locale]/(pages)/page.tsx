import dynamic from 'next/dynamic'

import HeroSection from '@/components/blocks/hero-section-27/hero-section-27'

// import TrustedBrands from '@/components/blocks/trusted-brands/trusted-brands'
// import Features from '@/components/blocks/features/features'

const BentoGrid = dynamic(() => import('@/components/blocks/bento-grid-17/bento-grid-17'), {
  ssr: true,
  loading: () => null
})

const Benefits = dynamic(() => import('@/components/blocks/benefits/benefits'), { ssr: true, loading: () => null })

const Testimonials = dynamic(
  () => import('@/components/blocks/testimonials-component-06/testimonials-component-06'),
  { ssr: true, loading: () => null }
)

const Pricing = dynamic(() => import('@/components/blocks/pricing/pricing'), { ssr: true, loading: () => null })

const FAQ = dynamic(() => import('@/components/blocks/faq/faq'), { ssr: true, loading: () => null })

const Partners = dynamic(() => import('@/components/blocks/partners/partners'), { ssr: true, loading: () => null })

const ContactUs = dynamic(() => import('@/components/blocks/contact-us-page-02/contact-us-page-02'), {
  ssr: true,
  loading: () => null
})

// import { logos } from '@/assets/data/trusted-brands'
import { usePricingPlans } from '@/assets/data/pricing'
import { useTestimonials } from '@/assets/data/testimonials-component-06'
import { useFaqItems } from '@/assets/data/faqs'

import { useBenefits } from '@/assets/data/benefits'
import { avatarMotionData } from '@/assets/data/hero-section'

import SectionSeparator from '@/components/section-separator'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL}#website`,
      name: 'Flow',
      description:
        'Grow your product faster with an all-in-one sales and analytics platform. Track performance, automate follow-ups, and make smarter decisions easily.',
      url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      inLanguage: 'en-US'
    }
  ]
}

const Home = () => {
  const benefits = useBenefits()
  const testimonials = useTestimonials()
  const plans = usePricingPlans()
  const faqItems = useFaqItems()

  return (
    <>
      <HeroSection avatarMotion={avatarMotionData} />

      {/*<SectionSeparator />*/}

      {/*<TrustedBrands brandLogos={logos} />*/}

      <SectionSeparator />

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

      {/*<CTA />*/}

      {/* Add JSON-LD to your page */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
        }}
      />
    </>
  )
}

export default Home
