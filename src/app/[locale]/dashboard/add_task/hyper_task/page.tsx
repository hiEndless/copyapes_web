'use client'

import * as React from 'react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CopyTaskConfigSheet } from '../_components/copy-task-config-sheet'

const featureActions = [
  {
    title: '前往交易所',
    href: 'https://app.hyperliquid.xyz'
  },
  {
    title: '查询数据',
    href: 'https://www.coinglass.com/zh/hyperliquid'
  }
]

export default function HyperliquidTaskPage() {
  const [walletAddress, setWalletAddress] = React.useState('')
  const [isConfigOpen, setIsConfigOpen] = React.useState(false)

  return (
    <div className='flex h-full items-start justify-center overflow-y-auto p-4 lg:p-8'>
      <div className='flex w-full max-w-2xl flex-col gap-6 pb-20'>
        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.6} transition={{ duration: 0.5 }}>
          <Card
            className={`overflow-hidden rounded-3xl border-none bg-blue-600 bg-[url('https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/download/image-09.png')] bg-cover bg-center p-0 pt-6 shadow-lg sm:pt-8`}
          >
            <CardContent className='flex gap-6 px-6 max-sm:flex-col max-sm:gap-2 max-sm:text-center sm:px-10'>
              <div className='space-y-3 pb-2 sm:flex-1 sm:pb-8'>
                <img
                  src='/exchanges/hyperliquid/logo-dark.svg'
                  alt='Hyperliquid logo'
                  className='h-8 w-auto max-sm:mx-auto'
                />
                <p className='mb-3 text-sm text-white/70'>
                  新一代的去中心化交易所，主打链上永续合约。有很多巨鲸、内幕哥、超大单在HyperLiquid上进行交易，只要你能找到这些账户的钱包地址，你就可以跟着巨鲸、内幕哥、超大单进行交易。
                </p>
                <div className='flex items-center gap-3 max-sm:flex-wrap max-sm:justify-center'>
                  {featureActions.map(action => (
                    <a
                      key={action.title}
                      href={action.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex h-8 min-w-24 items-center justify-center rounded-md bg-white px-3 text-xs font-medium text-black/90 sm:h-9 sm:min-w-28 sm:text-sm'
                    >
                      {action.title}
                    </a>
                  ))}
                </div>
              </div>
              <div className='flex items-center justify-center max-sm:h-40 max-sm:overflow-hidden sm:my-auto sm:min-w-56'>
                <img
                  src='/exchanges/hyperliquid/web-hlq.jpg'
                  alt='Hyperliquid Interface'
                  className='w-64 rounded-md max-sm:-translate-y-1 sm:w-56'
                />
              </div>
            </CardContent>
          </Card>
        </MotionPreset>

        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.8} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>创建 Hyperliquid 跟单任务</CardTitle>
              <CardDescription>只需输入目标交易员的钱包地址即可开始跟单</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* 1. 钱包地址 */}
              <div className='space-y-3'>
                <Label className='flex items-center gap-1'>
                  <span className='text-destructive'>*</span>
                  目标交易员钱包地址
                </Label>
                <div className='flex flex-col items-end gap-3 sm:flex-row'>
                  <div className='flex w-full flex-col gap-3 sm:flex-1 sm:flex-row'>
                    <div className='flex-1 space-y-1'>
                      <Input
                        placeholder='例如: 0x1234567890abcdef...'
                        value={walletAddress}
                        onChange={e => setWalletAddress(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex justify-end'>
              <Button disabled={!walletAddress.trim()} onClick={() => setIsConfigOpen(true)}>
                创建跟单
              </Button>
            </CardFooter>
          </Card>
        </MotionPreset>
      </div>

      <CopyTaskConfigSheet
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        traderId={walletAddress}
        traderName={walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)}
        platform='hyperliquid'
        roleType='1'
      />
    </div>
  )
}
