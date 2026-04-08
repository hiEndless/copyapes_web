'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { HelpCircleIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { MotionPreset } from '@/components/ui/motion-preset'

export type FAQs = {
  question: string
  answer: string
}[]

const FAQ = ({ faqItems }: { faqItems: FAQs }) => {
  const t = useTranslations('FAQ')

  useEffect(() => {
    const all = document.querySelectorAll('.card')

    const handleMouseMove = (ev: MouseEvent) => {
      all.forEach(e => {
        const blob = e.querySelector('.blob') as HTMLElement
        const fblob = e.querySelector('.fake-blob') as HTMLElement

        if (!blob || !fblob) return

        const rec = fblob.getBoundingClientRect()

        blob.style.opacity = '0.8'

        blob.animate(
          [
            {
              transform: `translate(${ev.clientX - rec.left - 24 - rec.width / 2}px, ${ev.clientY - rec.top - 24 - rec.height / 2}px)`
            }
          ],
          {
            duration: 300,
            fill: 'forwards'
          }
        )
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <section id='faq' className='pt-8 sm:pt-16 lg:pt-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* FAQ Header */}
        <MotionPreset
          fade
          slide={{ direction: 'down', offset: 50 }}
          blur
          transition={{ duration: 0.5 }}
          className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'
        >
          <p className='text-primary text-sm font-medium uppercase'>{t('badge')}</p>

          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>{t('title')}</h2>

          <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
            {t('subtitle')}
          </p>
        </MotionPreset>

        {/* Masonry FAQ Grid */}
        <div className='columns-1 gap-6 sm:columns-2 lg:columns-3'>
          {faqItems.map((item, index) => (
            <MotionPreset
              className='bg-foreground/10 card group relative mb-6 h-full break-inside-avoid overflow-hidden rounded-xl p-px transition-all duration-300 ease-in-out lg:col-span-3'
              fade
              key={index}
              blur
              transition={{ duration: 0.8 }}
              delay={0.6}
            >
              <Card className='group-hover:bg-card/90 h-full border-0 shadow-none transition-all duration-300 ease-in-out'>
                <CardHeader className='flex items-center justify-between gap-4'>
                  <h3 className='group-hover:text-primary font-semibold transition-colors duration-300'>
                    {item.question}
                  </h3>
                  <Avatar className='size-9'>
                    <AvatarFallback className='bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300'>
                      <HelpCircleIcon className='size-4' />
                    </AvatarFallback>
                  </Avatar>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <Separator />
                  <p className='text-muted-foreground text-sm'>{item.answer}</p>
                </CardContent>
              </Card>
              <div className='blob bg-primary absolute top-0 left-0 -z-1 size-62.5 rounded-full opacity-0 blur-2xl transition-all duration-300 ease-in-out' />
              <div className='fake-blob absolute top-0 left-0 -z-1 [display:hidden] size-40 rounded-full' />
            </MotionPreset>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
