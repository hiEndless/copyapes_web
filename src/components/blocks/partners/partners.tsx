import { ArrowRightIcon } from 'lucide-react'

const data = [
  {
    name: 'BINANCE',
    href: 'https://www.binance.com/join?ref=COPYAPES',
    img: (
      <img
        alt='BINANCE'
        loading='lazy'
        width='120'
        height='32'
        className='h-8 w-auto object-contain transition-all duration-300'
        src='/exchanges/binance/logo.svg'
      />
    )
  },
  {
    name: 'OKX',
    href: 'https://www.okx.com/join/COPY02',
    img: (
      <>
        <img
          alt='OKX'
          loading='lazy'
          width='120'
          height='32'
          className='h-6 w-auto object-contain dark:hidden'
          src='/exchanges/okx/logo-light.svg'
        />
        <img
          alt='OKX'
          loading='lazy'
          width='120'
          height='32'
          className='hidden h-8 w-auto object-contain dark:block'
          src='/exchanges/okx/logo-dark.png'
        />
      </>
    )
  },
  {
    name: 'GATE',
    href: 'https://www.gate.io/share/COPYAPES',
    img: (
      <>
        <img
          alt='GATE'
          loading='lazy'
          width='120'
          height='32'
          className='h-8 w-auto object-contain dark:hidden'
          src='/exchanges/gate/logo.png'
        />
        <img
          alt='GATE'
          loading='lazy'
          width='120'
          height='32'
          className='hidden h-12 w-auto object-contain dark:block'
          src='/exchanges/gate/logo-dark.png'
        />
      </>
    )
  },
  {
    name: 'BITGET',
    href: 'https://partner.hdmune.cn/bg/japhe6xs',
    img: (
      <img
        alt='BITGET'
        loading='lazy'
        width='120'
        height='32'
        className='h-8 w-auto object-contain transition-all duration-300'
        src='/exchanges/bitget/logo.png'
      />
    )
  }
  // {
  //   name: 'BYBIT',
  //   href: 'https://partner.bybit.com/b/ddddao',
  //   img: (
  //     <>
  //       <img
  //         alt='BYBIT'
  //         loading='lazy'
  //         width='120'
  //         height='32'
  //         className='h-8 w-auto object-contain dark:hidden'
  //         src='/exchanges/bybit/logo-light.svg'
  //       />
  //       <img
  //         alt='BYBIT'
  //         loading='lazy'
  //         width='120'
  //         height='32'
  //         className='hidden h-8 w-auto object-contain dark:block'
  //         src='/exchanges/bybit/logo-dark.svg'
  //       />
  //     </>
  //   )
  // },
  // {
  //   name: 'ASTER',
  //   href: 'https://www.asterdex.com/en/referral/DDDDAO',
  //   img: (
  //     <img
  //       alt='ASTER'
  //       loading='lazy'
  //       width='120'
  //       height='32'
  //       className='h-8 w-auto object-contain invert transition-all duration-300 dark:invert-0'
  //       src='/exchanges/aster/logo.svg'
  //     />
  //   )
  // },
  // {
  //   name: 'HYPERLIQUID',
  //   href: 'https://app.hyperliquid.xyz/join/DDDDAO',
  //   img: (
  //     <>
  //       <img
  //         alt='HYPERLIQUID'
  //         loading='lazy'
  //         width='120'
  //         height='32'
  //         className='h-8 w-auto object-contain dark:hidden'
  //         src='/exchanges/hyperliquid/logo-light.svg'
  //       />
  //       <img
  //         alt='HYPERLIQUID'
  //         loading='lazy'
  //         width='120'
  //         height='32'
  //         className='hidden h-8 w-auto object-contain dark:block'
  //         src='/exchanges/hyperliquid/logo-dark.svg'
  //       />
  //     </>
  //   )
  // },
  // {
  //   name: 'HTX',
  //   href: 'https://www.htx.com.pk/invite/zh-cn/1h?invite_code=ddddao',
  //   img: (
  //     <img
  //       alt='HTX'
  //       loading='lazy'
  //       width='120'
  //       height='32'
  //       className='h-12 w-auto scale-[1.75] object-contain transition-all duration-300 dark:brightness-0 dark:invert'
  //       src='/exchanges/htx/logo.svg'
  //     />
  //   )
  // }
]

const Partners = () => {
  return (
    <section id='company' className='relative flex w-full flex-col items-center justify-center gap-10 px-6 py-10 pt-32'>
      {/*<div>*/}
      {/*  <p className='text-foreground/70 font-medium'>我们的合作伙伴</p>*/}
      {/*</div>*/}
      <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
        <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>我们的合作伙伴</h2>
        <p className='text-muted-foreground text-xl'>使用我们的邀请链接进行注册，可享20%高额交易返佣。</p>
      </div>
      <div className='border-border z-20 grid w-full max-w-7xl grid-cols-2 items-center justify-center overflow-hidden border-y md:grid-cols-4'>
        {data.map((item, i) => (
          <div
            key={i}
            className='group before:bg-border after:bg-border relative flex h-28 w-full items-center justify-center p-4 before:absolute before:top-0 before:-left-1 before:z-10 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-10 after:h-px after:w-screen after:content-[""]'
          >
            <a target='_blank' rel='noopener noreferrer' className='absolute inset-0 z-20' href={item.href}>
              <span className='sr-only'>了解更多</span>
            </a>
            <div className='bg-primary/5 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
            <div className='absolute inset-0 overflow-hidden'>
              <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>
            </div>
            <div className='pointer-events-none relative z-10 flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:-translate-y-2'>
              {item.img}
            </div>
            <div className='pointer-events-none absolute inset-0 flex translate-y-6 items-center justify-center pt-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100'>
              <span className='text-primary flex items-center gap-2 text-sm font-medium'>
                了解更多 <ArrowRightIcon className='h-4 w-4' />
              </span>
            </div>
            <div className='pointer-events-none absolute top-0 right-0 h-8 w-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
              <div className='border-primary/40 absolute top-2 right-2 h-2 w-2 border-t border-r'></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Partners
