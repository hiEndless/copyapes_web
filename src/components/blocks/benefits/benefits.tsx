'use client'

import { type ReactNode } from 'react'

import { ArrowUpRightIcon } from 'lucide-react'

import { Link } from '@/i18n/routing'

import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { PrimaryFlowButton, SecondaryFlowButton } from '@/components/ui/flow-button'
import { MotionPreset } from '@/components/ui/motion-preset'

export type Features = {
  icon: ReactNode
  title: string
  description: string
}[]

const Benefits = ({ featuresList }: { featuresList: Features }) => {
  const t = useTranslations('Benefits')

  return (
    <section id='benefits' className='py-8 sm:py-16 lg:py-24'>
      {/* Header */}
      <MotionPreset
        fade
        slide={{ direction: 'down', offset: 50 }}
        blur
        transition={{ duration: 0.5 }}
        className='mb-12 space-y-4 text-center max-md:px-4 sm:mb-16 lg:mb-24'
      >
        <p className='text-primary text-sm font-medium uppercase'>{t('badge')}</p>

        <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>{t('title')}</h2>

        <p className='text-muted-foreground mx-auto max-w-3xl text-xl'>
          {t('subtitle')}
        </p>

        <div className='flex flex-wrap items-center justify-center gap-4 text-center'>
          <PrimaryFlowButton size='lg' asChild>
            <Link href='#'>
              {t('button')}
              <ArrowUpRightIcon />
            </Link>
          </PrimaryFlowButton>
        </div>
      </MotionPreset>

      {/* Features Grid */}
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {featuresList.map((feature, index) => (
            <MotionPreset
              key={index}
              fade
              slide={{ direction: 'up', offset: 40 }}
              blur
              delay={0.6 + index * 0.1}
              transition={{ duration: 0.5 }}
            >
              <Card className='hover:border-primary h-full border shadow-none transition-colors duration-300'>
                <CardContent className='flex gap-4'>
                  <Avatar className='size-9 rounded-md'>
                    <AvatarFallback className='bg-card-foreground/10 text-card-foreground rounded-md [&>svg]:size-6'>
                      {feature.icon}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h6 className='mb-1 text-lg font-semibold'>{feature.title}</h6>
                    <p className='text-muted-foreground leading-relaxed'>{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            </MotionPreset>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Benefits
