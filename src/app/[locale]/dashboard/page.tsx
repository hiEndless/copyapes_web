'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const DashboardPage = () => {
  return (
    <div className='grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-2'>
      {/* 左侧区域 (50%) */}
      <div className='flex flex-col gap-4 lg:col-span-1'>
        {/* 公告栏 Card */}
        <Card className='gap-3 py-4 shadow-none'>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm'>公告栏</CardTitle>
          </CardHeader>
          <CardContent className='px-4'>
            <p className='text-muted-foreground text-xs leading-relaxed'>
              这里是大段文字的公告内容。这里是大段文字的公告内容。这里是大段文字的公告内容。
              这里是大段文字的公告内容。这里是大段文字的公告内容。这里是大段文字的公告内容。
              这里是大段文字的公告内容。这里是大段文字的公告内容。这里是大段文字的公告内容。
            </p>
          </CardContent>
        </Card>

        {/* 注册交易所返佣 Card */}
        <Card className='gap-3 py-4 shadow-none'>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='flex items-center justify-between text-sm'>合作交易所</CardTitle>
            <CardDescription className='text-xs'>
              点击注册享受 <span className='text-primary font-medium'>20%</span> 交易手续费返佣
            </CardDescription>
          </CardHeader>
          <CardContent className='px-4 pt-4'>
            <div className='border-border z-20 grid w-full grid-cols-4 items-center justify-center overflow-hidden'>
              {/* Binance */}
              <div className='group relative flex h-20 w-full items-center justify-center p-2 before:absolute before:top-0 before:-left-1 before:z-10 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-10 after:h-px after:w-screen after:content-[""]'>
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  className='absolute inset-0 z-20'
                  href='https://www.binance.com/join?ref=COPYAPES'
                >
                  <span className='sr-only'>Binance</span>
                </a>
                <div className='bg-primary/5 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                <div className='absolute inset-0 overflow-hidden'>
                  <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>
                </div>
                <div className='pointer-events-none relative z-10 flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105'>
                  <img
                    alt='BINANCE'
                    loading='lazy'
                    width='100'
                    height='28'
                    className='h-6 w-auto object-contain transition-all duration-300'
                    src='/exchanges/binance/logo.svg'
                  />
                </div>
              </div>

              {/* Bitget */}
              <div className='group relative flex h-20 w-full items-center justify-center p-2 before:absolute before:top-0 before:-left-1 before:z-10 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-10 after:h-px after:w-screen after:content-[""]'>
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  className='absolute inset-0 z-20'
                  href='https://partner.hdmune.cn/bg/japhe6xs'
                >
                  <span className='sr-only'>Bitget</span>
                </a>
                <div className='bg-primary/5 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                <div className='absolute inset-0 overflow-hidden'>
                  <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>
                </div>
                <div className='pointer-events-none relative z-10 flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105'>
                  <img
                    alt='BITGET'
                    loading='lazy'
                    width='100'
                    height='28'
                    className='h-6 w-auto object-contain transition-all duration-300'
                    src='/exchanges/bitget/logo.png'
                  />
                </div>
              </div>

              {/* OKX */}
              <div className='group relative flex h-20 w-full items-center justify-center p-2 before:absolute before:top-0 before:-left-1 before:z-10 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-10 after:h-px after:w-screen after:content-[""]'>
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  className='absolute inset-0 z-20'
                  href='https://www.okx.com/join/COPY02'
                >
                  <span className='sr-only'>OKX</span>
                </a>
                <div className='bg-primary/5 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                <div className='absolute inset-0 overflow-hidden'>
                  <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>
                </div>
                <div className='pointer-events-none relative z-10 flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105'>
                  <img
                    alt='OKX'
                    loading='lazy'
                    width='100'
                    height='28'
                    className='h-5 w-auto object-contain dark:hidden'
                    src='/exchanges/okx/logo-light.svg'
                  />
                  <img
                    alt='OKX'
                    loading='lazy'
                    width='100'
                    height='28'
                    className='hidden h-6 w-auto object-contain dark:block'
                    src='/exchanges/okx/logo-dark.png'
                  />
                </div>
              </div>

              {/* Gate */}
              <div className='group relative flex h-20 w-full items-center justify-center p-2 before:absolute before:top-0 before:-left-1 before:z-10 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-10 after:h-px after:w-screen after:content-[""]'>
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  className='absolute inset-0 z-20'
                  href='https://www.gate.io/share/COPYAPES'
                >
                  <span className='sr-only'>Gate</span>
                </a>
                <div className='bg-primary/5 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                <div className='absolute inset-0 overflow-hidden'>
                  <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>
                </div>
                <div className='pointer-events-none relative z-10 flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105'>
                  <img
                    alt='GATE'
                    loading='lazy'
                    width='100'
                    height='28'
                    className='h-6 w-auto object-contain dark:hidden'
                    src='/exchanges/gate/logo.png'
                  />
                  <img
                    alt='GATE'
                    loading='lazy'
                    width='100'
                    height='28'
                    className='hidden h-8 w-auto object-contain dark:block'
                    src='/exchanges/gate/logo-dark.png'
                  />
                </div>
              </div>
            </div>
            {/*<div className='border-border z-20 grid w-full grid-cols-4 items-center justify-center overflow-hidden'>*/}
            {/*  /!* Weex *!/*/}
            {/*  <div className='group relative flex h-20 w-full items-center justify-center p-2 before:absolute before:top-0 before:-left-1 before:z-10 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-10 after:h-px after:w-screen after:content-[""]'>*/}
            {/*    <a*/}
            {/*      target='_blank'*/}
            {/*      rel='noopener noreferrer'*/}
            {/*      className='absolute inset-0 z-20'*/}
            {/*      href='https://www.binance.com/join?ref=COPYAPES'*/}
            {/*    >*/}
            {/*      <span className='sr-only'>Binance</span>*/}
            {/*    </a>*/}
            {/*    <div className='bg-primary/5 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>*/}
            {/*    <div className='absolute inset-0 overflow-hidden'>*/}
            {/*      <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>*/}
            {/*    </div>*/}
            {/*    <div className='pointer-events-none relative z-10 flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105'>*/}
            {/*      <img*/}
            {/*        alt='BINANCE'*/}
            {/*        loading='lazy'*/}
            {/*        width='100'*/}
            {/*        height='28'*/}
            {/*        className='h-6 w-auto object-contain transition-all duration-300'*/}
            {/*        src='/exchanges/binance/logo.svg'*/}
            {/*      />*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </CardContent>
        </Card>

        {/* 兑换码核销 Card */}
        <Card className='gap-3 py-4 shadow-none'>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm'>兑换码核销</CardTitle>
            <CardDescription className='text-xs'>请输入您的兑换码进行核销</CardDescription>
          </CardHeader>
          <CardContent className='flex gap-3 px-4'>
            <Input placeholder='请输入兑换码' className='h-8 flex-1 text-xs' />
            <Button size='sm' className='h-8 text-xs'>
              核销确认
            </Button>
          </CardContent>
        </Card>

        {/* 免责声明 Card */}
        <Card className='gap-3 py-4 shadow-none'>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm'>免责申明</CardTitle>
          </CardHeader>
          <CardContent className='px-4'>
            <p className='text-muted-foreground text-xs leading-relaxed'>
              跟单猿（以下称为&quot;本软件&quot;）为第三方辅助工具，不能完全替代手动交易和人工盯盘。本软件不是交易所，不做任何数字货币承兑，不触碰任何用户的资产，无法对用户的账户进行转账操作。使用本软件，需要提供交易所
              API，使用跟单功能，默认授权本软件可以通过 API
              对您的交易所账户进行合约交易，采用的交易参数为您设置的任务参数。本软件会尽力保证服务的正常使用，因外部不可抗力因素，如网络攻击、交易所接口发生变更等，导致本软件无法提供正常服务，或因用户的交易参数设置导致无法进行交易，本软件不承担任何责任。使用本软件提供的跟单服务，默认知晓以上信息。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 右侧区域 (50%) */}
      <div className='flex flex-col gap-4 lg:col-span-1'>
        {/* 赞助商广告 */}
        <Card className='gap-3 py-4 shadow-none'>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm'>赞助商广告</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-3 gap-2 px-4'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='bg-muted flex aspect-video w-full items-center justify-center rounded-md border border-dashed'
              >
                <span className='text-muted-foreground text-center text-xs leading-tight'>
                  Logo
                  <br />
                  {i}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 其他产品 */}
        <Card className='gap-3 py-4 shadow-none'>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm'>其他产品</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-3 gap-2 px-4'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='bg-muted flex aspect-video w-full items-center justify-center rounded-md border border-dashed'
              >
                <span className='text-muted-foreground text-center text-xs leading-tight'>
                  产品
                  <br />
                  {i}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
