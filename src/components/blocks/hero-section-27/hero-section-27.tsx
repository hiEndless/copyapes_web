import * as motion from 'motion/react-client'

import { ArrowRightIcon } from 'lucide-react'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { BounceButton } from '@/components/ui/bounce-button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Marquee } from '@/components/ui/marquee'
import { Magnetic } from '@/components/ui/magnet-effect'
import { StarsBackground } from '@/components/ui/background-stars'

import { cn } from '@/lib/utils'

type AvatarProps = {
  src: string
  fallback: string
  name: string
  duration: number
  className?: string
  sizeClass: string
}

const HeroSection = ({ avatarMotion }: { avatarMotion: AvatarProps[] }) => {
  const t = useTranslations('Hero')

  return (
    <section id='home' className='relative flex-1 overflow-hidden pt-32 pb-8'>
      <StarsBackground className='absolute inset-0 flex items-center justify-center' />
      <div className='relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:gap-16 sm:px-6 lg:gap-24 lg:px-8'>
        {/* Hero Content */}
        <div className='flex max-w-3xl flex-col items-center gap-4 text-center'>
          <MotionPreset fade transition={{ duration: 0.5 }}>
            <Badge className='px-2.5 py-1 shadow-none' variant='outline'>
              <span className='relative flex size-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75 dark:bg-green-400'></span>
                <span className='relative inline-flex size-2 rounded-full bg-green-600 dark:bg-green-400'></span>
              </span>
              {t('badge')}
            </Badge>
          </MotionPreset>

          <MotionPreset
            component='h1'
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.3}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='text-2xl font-semibold sm:text-3xl lg:text-5xl lg:font-bold'
          >
            {t('title')}
          </MotionPreset>

          <MotionPreset
            component='p'
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.6}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='text-muted-foreground max-w-2xl text-xl'
          >
            {t('description')}
          </MotionPreset>

          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={0.9}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='flex flex-wrap items-center gap-4'
          >
            <BounceButton className='z-10 h-10 gap-3 rounded-lg text-base has-[>svg]:px-6'>
              <a href='#' className='flex items-center gap-2'>
                {t('startCopying')} <ArrowRightIcon />
              </a>
            </BounceButton>
            <Button size='lg' asChild className='bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-base'>
              <a href='#'>{t('freeRegister')}</a>
            </Button>
          </MotionPreset>

          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={1}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='bg-background mt-12 flex items-center rounded-full border p-1.5 shadow-sm'
          >
            {' '}
            <div className='flex -space-x-2'>
              <Avatar className='ring-background size-10.5 ring-2'>
                <AvatarImage src='/face/face-4.png' alt='Olivia Sparks' />
                <AvatarFallback>OS</AvatarFallback>
              </Avatar>
              <Avatar className='ring-background size-10.5 ring-2'>
                <AvatarImage src='/face/face-2.png' alt='Howard Lloyd' />
                <AvatarFallback>HL</AvatarFallback>
              </Avatar>
              <Avatar className='ring-background size-10.5 ring-2'>
                <AvatarImage src='/face/face-3.png' alt='Hallie Richards' />
                <AvatarFallback>HR</AvatarFallback>
              </Avatar>
              <Avatar className='ring-background size-10.5 ring-2'>
                <AvatarImage src='/face/face-5.png' alt='Jenny Wilson' />
                <AvatarFallback>JW</AvatarFallback>
              </Avatar>
              <Avatar className='ring-background size-10.5 ring-2'>
                <AvatarImage src='/face/face-6.png' alt='Jenny Wilson' />
                <AvatarFallback>JW</AvatarFallback>
              </Avatar>
              <Avatar className='ring-background size-10.5 ring-2'>
                <AvatarImage src='/face/face-7.png' alt='Jenny Wilson' />
                <AvatarFallback>JW</AvatarFallback>
              </Avatar>
            </div>
            <p className='text-muted-foreground px-2 text-xs'>
              {t('usedBy')} <span className='text-primary'>+23k</span> {t('people')}
            </p>
          </MotionPreset>
        </div>
        <div className='relative w-full max-w-5xl'>
          <div className='from-background pointer-events-none absolute inset-y-0 left-0 z-1 w-15 bg-gradient-to-r via-85% to-transparent' />
          <div className='from-background pointer-events-none absolute inset-y-0 right-0 z-1 w-15 bg-gradient-to-l via-85% to-transparent' />
          <MotionPreset fade slide={{ direction: 'down', offset: 50 }} delay={1.1} transition={{ duration: 0.5 }}>
            <Marquee pauseOnHover duration={20} reverse gap={4} className='*:items-center'>
              <img
                src='/exchanges/binance/logo.svg'
                alt='Binance'
                className='h-8 w-auto shrink-0 object-contain opacity-50 grayscale transition-opacity duration-300 hover:opacity-80 dark:invert'
              />
              <img
                src='/exchanges/bitget/logo.png'
                alt='Bitget'
                className='h-8 w-auto shrink-0 object-contain opacity-50 grayscale transition-opacity duration-300 hover:opacity-80 dark:invert'
              />
              <img
                src='/exchanges/gate/logo.png'
                alt='Gate.io'
                className='h-8 w-auto shrink-0 object-contain opacity-50 grayscale transition-opacity duration-300 hover:opacity-80 dark:invert'
              />
              <img
                src='/exchanges/hyperliquid/logo-light.svg'
                alt='Hyperliquid'
                className='h-8 w-auto shrink-0 object-contain opacity-50 grayscale transition-opacity duration-300 hover:opacity-80 dark:invert'
              />
              <img
                src='/exchanges/okx/logo-light.svg'
                alt='OKX'
                className='h-6 w-auto shrink-0 object-contain opacity-50 grayscale transition-opacity duration-300 hover:opacity-80 dark:invert'
              />
              <img
                src='/exchanges/weex/logoweex_black.svg'
                alt='Aster'
                className='h-8 w-auto shrink-0 object-contain opacity-50 grayscale transition-opacity duration-300 hover:opacity-80 dark:invert'
              />
            </Marquee>
          </MotionPreset>
        </div>

        {/* Left Avatars */}
        <MotionPreset fade delay={1.4}>
          {avatarMotion.map((item, index) => (
            <motion.div
              key={index}
              className={cn('max-lg:hidden', item.className)}
              initial={{ scale: 1.2 }}
              animate={{ scale: [1.2, 1.0, 1.2] }}
              transition={{
                duration: 3,
                delay: item.duration,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Magnetic strength={0.5} range={120}>
                <Avatar className={cn('ring-background ring-2', item.sizeClass)}>
                  <AvatarImage src={item.src} alt={item.name} />
                  <AvatarFallback>{item.fallback}</AvatarFallback>
                </Avatar>
              </Magnetic>
            </motion.div>
          ))}
        </MotionPreset>
      </div>
    </section>
  )
}

export default HeroSection
