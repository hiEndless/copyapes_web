'use client'

import Link from 'next/link'

import { Separator } from '@/components/ui/separator'

import Logo from '@/components/logo'
import SectionSeparator from '@/components/section-separator'
import HoverText from '@/components/blocks/footer/hover-text'

const Footer = () => {
  return (
    <footer>
      <SectionSeparator />
      <div className='mx-auto grid max-w-7xl grid-cols-6 gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:pt-16 md:pt-24 lg:px-8'>
        <div className='col-span-full flex flex-col items-start gap-4 lg:col-span-2'>
          <Link href='/#home'>
            <Logo />
          </Link>
          <p className='text-muted-foreground'>
            自由组合不同交易所的顶级带单员，平衡收益和风险，打造专属您个人的跟单策略，让全球顶级交易员为你打工。
          </p>
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
              {`©${new Date().getFullYear()}`} Made with ❤️ by CopyApes.
            </p>
          </div>
        </div>
        <div className='col-span-full grid grid-cols-2 gap-6 sm:grid-cols-4 lg:col-span-4 lg:gap-8'>
          <div className='flex flex-col gap-5'>
            <div className='text-lg font-medium'>产品</div>
            <ul className='text-muted-foreground space-y-3'>
              <li>
                <Link href='/#testimonials' className='hover:text-foreground transition-colors duration-300'>
                  用户评价
                </Link>
              </li>
              <li>
                <Link href='/#features' className='hover:text-foreground transition-colors duration-300'>
                  产品功能
                </Link>
              </li>
              <li>
                <Link href='/#benefits' className='hover:text-foreground transition-colors duration-300'>
                  产品优势
                </Link>
              </li>
              <li>
                <Link href='/pricing' className='hover:text-foreground transition-colors duration-300'>
                  产品价格
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
            <div className='text-lg font-medium'>帮助</div>
            <ul className='text-muted-foreground space-y-3'>
              <li>
                <Link href='#contact' className='hover:text-foreground transition-colors duration-300'>
                  联系我们
                </Link>
              </li>
              <li>
                <Link
                  href='https://docs.lichaoyuan.com/copyapes/protocol'
                  className='hover:text-foreground transition-colors duration-300'
                >
                  用户协议
                </Link>
              </li>
              <li>
                <Link
                  href='https://docs.lichaoyuan.com/copyapes/step'
                  className='hover:text-foreground transition-colors duration-300'
                >
                  使用教程
                </Link>
              </li>
            </ul>
          </div>

          <div className='col-span-full flex flex-col gap-5 sm:col-span-2'>
            <div>
              {/* <p className='mb-3 text-lg font-medium'>徽章区</p> */}
              <div className='flex flex-wrap gap-4'>
                <img src='/images/brand-logos/bestofjs-logo-bw.webp' alt='bestofjs' className='h-5 dark:invert' />
                <img
                  src='/images/brand-logos/product-hunt-logo-bw.webp'
                  alt='producthunt'
                  className='h-5 dark:invert'
                />
                <img src='/images/brand-logos/reddit-logo-bw.webp' alt='reddit' className='h-5 dark:invert' />
                <img src='/images/brand-logos/medium-logo-bw.webp' alt='medium' className='h-5 dark:invert' />
                <img src='/images/brand-logos/ycombinator-logo-bw.webp' alt='ycombinator' className='h-5 dark:invert' />
                <img src='/images/brand-logos/launchtory-logo-bw.webp' alt='launchtory' className='h-5 dark:invert' />
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
