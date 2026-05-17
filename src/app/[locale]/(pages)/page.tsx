import dynamic from 'next/dynamic'

import { getTranslations } from 'next-intl/server'

import HeroSection from '@/components/blocks/hero-section-27/hero-section-27'
// import CTA from '@/components/blocks/cta/cta'
// import TrustedBrands from '@/components/blocks/trusted-brands/trusted-brands'
// import Features from '@/components/blocks/features/features'

const BentoGrid = dynamic(() => import('@/components/blocks/bento-grid-17/bento-grid-17'), {
  ssr: true,
  loading: () => null
})

const Benefits = dynamic(() => import('@/components/blocks/benefits/benefits'), { ssr: true, loading: () => null })

const Testimonials = dynamic(() => import('@/components/blocks/testimonials-component-06/testimonials-component-06'), {
  ssr: true,
  loading: () => null
})

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
import { buildWebsiteJsonLd, jsonLdScriptProps } from '@/lib/seo'

const HomeJsonLd = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return (
    <script
      {...jsonLdScriptProps(
        buildWebsiteJsonLd({
          locale,
          name: t('siteName'),
          description: t('description')
        })
      )}
    />
  )
}

const HomeContent = () => {
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
    </>
  )
}

const Home = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params

  return (
    <>
      <HomeContent />
      <HomeJsonLd locale={locale} />
    </>
  )
}

export default Home
