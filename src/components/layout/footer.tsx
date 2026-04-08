'use client'

import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'

import { Separator } from '@/components/ui/separator'

import Logo from '@/components/logo'
import SectionSeparator from '@/components/section-separator'
import HoverText from '@/components/blocks/footer/hover-text'

const Footer = () => {
  const t = useTranslations('Footer')
  const tn = useTranslations('Navigation')

  return (
    <footer>
      <SectionSeparator />
      <div className='mx-auto grid max-w-7xl grid-cols-6 gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:pt-16 md:pt-24 lg:px-8'>
        <div className='col-span-full flex flex-col items-start gap-4 lg:col-span-2'>
          <Link href='/#home'>
            <Logo />
          </Link>
          <p className='text-muted-foreground'>{t('desc')}</p>
          <Separator className='w-35!' />
          {/*<div className='flex items-center gap-4'>*/}
          {/*  <Link href='#' aria-label='Github Link'>*/}
          {/*    <GithubIcon className='text-muted-foreground hover:text-foreground size-5' />*/}
          {/*  </Link>*/}
          {/*  <Link href='#' aria-label='Instagram Link'>*/}
          {/*    <InstagramIcon className='text-muted-foreground hover:text-foreground size-5' />*/}
          {/*  </Link>*/}
          {/*  <Link href='#' aria-label='Twitter Link'>*/}
          {/*    <TwitterIcon className='text-muted-foreground hover:text-foreground size-5' />*/}
          {/*  </Link>*/}
          {/*  <Link href='#' aria-label='Youtube Link'>*/}
          {/*    <YoutubeIcon className='text-muted-foreground hover:text-foreground size-5' />*/}
          {/*  </Link>*/}
          {/*</div>*/}
          <div className='flex justify-start text-sm'>
            <p className='text-muted-foreground text-left text-balance'>
              {`©${new Date().getFullYear()}`} {t('copyright')}
            </p>
          </div>
        </div>
        <div className='col-span-full grid grid-cols-2 gap-6 sm:grid-cols-4 lg:col-span-4 lg:gap-8'>
          <div className='flex flex-col gap-5'>
            <div className='text-lg font-medium'>{t('product')}</div>
            <ul className='text-muted-foreground space-y-3'>
              <li>
                <Link href='/#testimonials' className='hover:text-foreground transition-colors duration-300'>
                  {tn('testimonials')}
                </Link>
              </li>
              <li>
                <Link href='/#features' className='hover:text-foreground transition-colors duration-300'>
                  {tn('features')}
                </Link>
              </li>
              <li>
                <Link href='/#benefits' className='hover:text-foreground transition-colors duration-300'>
                  {tn('benefits')}
                </Link>
              </li>
              <li>
                <Link href='/pricing' className='hover:text-foreground transition-colors duration-300'>
                  {tn('pricing')}
                </Link>
              </li>
              {/* <li>
                <Link href='/blog' className='hover:text-foreground transition-colors duration-300'>
                  Blog
                </Link>
              </li> */}
            </ul>
          </div>
          <div className='flex flex-col gap-5'>
            <div className='text-lg font-medium'>{t('help')}</div>
            <ul className='text-muted-foreground space-y-3'>
              <li>
                <Link href='#contact' className='hover:text-foreground transition-colors duration-300'>
                  {tn('contact')}
                </Link>
              </li>
              <li>
                <Link
                  href='https://docs.lichaoyuan.com/copyapes/protocol'
                  className='hover:text-foreground transition-colors duration-300'
                >
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link
                  href='https://docs.lichaoyuan.com/copyapes/step'
                  className='hover:text-foreground transition-colors duration-300'
                >
                  {t('tutorial')}
                </Link>
              </li>
            </ul>
          </div>

          <div className='col-span-full flex flex-col gap-5 sm:col-span-2'>
            <div>
              {/* <p className='mb-3 text-lg font-medium'>徽章区</p> */}
              <div className='flex flex-wrap gap-4'>
                <img src='/images/brand-logos/bestofjs-logo-bw.webp' alt='Best of JS' className='h-5 dark:invert' />
                <img
                  src='/images/brand-logos/product-hunt-logo-bw.webp'
                  alt='Product Hunt'
                  className='h-5 dark:invert'
                />
                <img src='/images/brand-logos/reddit-logo-bw.webp' alt='Reddit' className='h-5 dark:invert' />
                <img src='/images/brand-logos/medium-logo-bw.webp' alt='Medium' className='h-5 dark:invert' />
                <img
                  src='/images/brand-logos/ycombinator-logo-bw.webp'
                  alt='Y Combinator'
                  className='h-5 dark:invert'
                />
                <img src='/images/brand-logos/launchtory-logo-bw.webp' alt='Launchtory' className='h-5 dark:invert' />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*<Separator />*/}

      <div className=''>
        <HoverText text='CopyApes' />
      </div>
    </footer>
  )
}

export default Footer
