import { Marquee } from '@/components/ui/marquee'

import TestimonialCard from '@/components/blocks/testimonials-component-06/testimonial-card'
import type { TestimonialItem } from '@/assets/data/testimonials-component-06'
import { useTranslations } from 'next-intl'
import { MotionPreset } from '@/components/ui/motion-preset'

type TestimonialsComponentProps = {
  testimonials: TestimonialItem[]
}

const TestimonialsComponent = ({ testimonials }: TestimonialsComponentProps) => {
  const t = useTranslations('Testimonials')

  return (
    <section id='testimonials' className='space-y-12 py-8 sm:space-y-16 sm:py-16 lg:space-y-24 lg:py-24'>
      {/* Section Header */}
      <MotionPreset
        className='mx-auto max-w-7xl space-y-4 px-4 text-center sm:px-6 lg:px-8'
        fade
        slide={{ direction: 'down', offset: 50 }}
        blur
        transition={{ duration: 0.5 }}
      >
        <p className='text-primary text-sm font-medium uppercase'>{t('badge')}</p>

        <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>{t('title')}</h2>

        <p className='text-muted-foreground text-xl'>{t('subtitle')}</p>
      </MotionPreset>

      {/* Testimonials Marquee */}
      <div className='relative'>
        <div className='from-background pointer-events-none absolute inset-y-0 left-0 z-1 w-35 bg-gradient-to-r to-transparent max-sm:hidden' />
        <div className='from-background pointer-events-none absolute inset-y-0 right-0 z-1 w-35 bg-gradient-to-l to-transparent max-sm:hidden' />

        <div className='w-full overflow-hidden'>
          <Marquee pauseOnHover duration={20} gap={1.5}>
            {testimonials.slice(0, 4).map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
        </div>

        <div className='w-full overflow-hidden'>
          <Marquee pauseOnHover duration={20} gap={1.5} reverse>
            {testimonials.slice(4, 8).map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsComponent
