'use client'

import React, { type ReactNode, useState, useEffect } from 'react'

import { MessageCircle, ExternalLink, Send, Sparkles, Mail } from 'lucide-react'
import { IconBrandWechat, IconBrandTelegram, IconMail, IconMessageChatbot } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function SupportDialog({ trigger }: { trigger?: ReactNode }) {
  const [activeContact, setActiveContact] = useState<'wechat' | 'telegram' | 'email'>('email')
  const [connectData, setConnectData] = useState<{ nickname?: string | null, wx?: string | null, telegram?: string | null } | null>(null)

  useEffect(() => {
    const handleConnectUpdate = () => {
      try {
        const connectStr = localStorage.getItem('connectInfo')

        if (connectStr) {
          const data = JSON.parse(connectStr)

          setConnectData(data)

          if (data.wx) {
            setActiveContact('wechat')
          } else if (data.telegram) {
            setActiveContact('telegram')
          } else {
            setActiveContact('email')
          }
        }
      } catch (e) {
        console.error('Failed to parse connect info', e)
      }
    }

    handleConnectUpdate()

    window.addEventListener('connectInfoUpdated', handleConnectUpdate)

    return () => {
      window.removeEventListener('connectInfoUpdated', handleConnectUpdate)
    }
  }, [])

  const contactInfo: Record<string, { title: string, description: string, action: string, icon: ReactNode }> = {
    wechat: {
      title: '微信客服',
      description: '添加专属微信客服',
      action: `WeChat: ${connectData?.wx || ''}`,
      icon: <MessageCircle className='size-5 text-zinc-900 dark:text-zinc-100' />
    },
    telegram: {
      title: 'Telegram 客服',
      description: "添加 Telegram 客服",
      action: connectData?.telegram?.startsWith('http') ? connectData.telegram : (connectData?.telegram ? `https://t.me/${connectData.telegram.replace('@', '')}` : ''),
      icon: <Send className='size-5 text-zinc-900 dark:text-zinc-100' />
    },
    email: {
      title: '发送邮件',
      description: '工作日 24 小时内回复',
      action: 'support@copyapes.com',
      icon: <Mail className='size-5 text-zinc-900 dark:text-zinc-100' />
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            size='icon'
            className='bg-primary text-primary-foreground hover:bg-primary/90 fixed right-6 bottom-6 z-50 h-12 w-12 rounded-full shadow-lg transition-all hover:shadow-xl'
          >
            <IconMessageChatbot className='!size-7 stroke-[1.5]' />
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        side='top'
        align='end'
        sideOffset={16}
        className='flex h-[600px] w-[380px] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white p-0 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950'
      >
        {/* Dark Gradient Header */}
        <div className='from-primary/90 to-primary text-primary-foreground relative shrink-0 bg-gradient-to-b px-6 pt-6 pb-20'>
          <div className='mb-8 flex items-center justify-between'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm'>
              <Sparkles className='size-4' />
            </div>

            <div className='flex items-center gap-3'>
              <Avatar className='size-8 border border-white/20'>
                <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' />
                <AvatarFallback>SP</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <h2 className='text-2xl font-semibold opacity-90'>
                Hi <span className='animate-wave inline-block'>👋</span>
              </h2>
              <h3 className='text-2xl font-bold'>{connectData?.nickname || '联系客服与帮助'}</h3>
            </div>
            <div className='flex items-center gap-3 pt-2'>
              {connectData?.wx && (
                <button
                  onClick={() => setActiveContact('wechat')}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    activeContact === 'wechat' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title='微信客服'
                >
                  <IconBrandWechat className='size-5' />
                </button>
              )}
              {connectData?.telegram && (
                <button
                  onClick={() => setActiveContact('telegram')}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    activeContact === 'telegram' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title='Telegram 客服'
                >
                  <IconBrandTelegram className='size-5' />
                </button>
              )}
              <button
                onClick={() => setActiveContact('email')}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  activeContact === 'email' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                }`}
                title='发送邮件'
              >
                <IconMail className='size-5' />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className='relative z-10 -mt-14 flex-1 overflow-y-auto bg-transparent px-4 pb-4'>
          {/* Main Action Card */}
          <div className='mb-4 flex shrink-0 cursor-pointer items-center justify-between rounded-2xl border bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900'>
            <div>
              <p className='text-[15px] font-semibold text-zinc-900 dark:text-zinc-100'>
                {contactInfo[activeContact].action}
              </p>
              <p className='text-sm text-zinc-500 dark:text-zinc-400'>{contactInfo[activeContact].description}</p>
            </div>
            {contactInfo[activeContact].icon}
          </div>

          {/* Links List */}
          <div className='shrink-0 overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950'>
            <div className='flex flex-col'>
              {[
                { label: '用户协议', href: 'https://docs.lichaoyuan.com/copyapes/protocol' },
                { label: '简易跟单流程', href: 'https://docs.lichaoyuan.com/copyapes/step' },
                { label: '币coin 跟单介绍', href: 'https://docs.lichaoyuan.com/copyapes/vip/bicoin' },
                { label: 'Cookie 跟单介绍', href: 'https://docs.lichaoyuan.com/copyapes/vip/cookie' },
                { label: 'API 跟单介绍', href: 'https://docs.lichaoyuan.com/copyapes/vip/ws' },
                { label: '如何获取交易所 Cookie', href: 'https://docs.lichaoyuan.com/copyapes/other/add-cookie' },
                { label: '交易所跟单抢位介绍', href: 'https://docs.lichaoyuan.com/copyapes/other/grab' }
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  target='_blank'
                  className='flex items-center justify-between border-b border-zinc-100 px-5 py-3.5 transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800/80 dark:hover:bg-zinc-900'
                >
                  <span className='text-[15px] text-zinc-700 dark:text-zinc-300'>{item.label}</span>
                  <ExternalLink className='size-4 text-zinc-400 dark:text-zinc-500' />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        {/* <div className='grid grid-cols-3 border-t bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900'>
          <button className='flex flex-col items-center justify-center gap-1.5 rounded-xl p-2 text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800'>
            <Home className='size-6 stroke-[2]' />
            <span className='text-xs font-semibold'>Home</span>
          </button>
          <button className='flex flex-col items-center justify-center gap-1.5 rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'>
            <MessageSquare className='size-6 stroke-[1.5]' />
            <span className='text-xs font-medium'>Messages</span>
          </button>
          <button className='flex flex-col items-center justify-center gap-1.5 rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'>
            <HelpCircle className='size-6 stroke-[1.5]' />
            <span className='text-xs font-medium'>Help</span>
          </button>
        </div> */}
      </PopoverContent>
    </Popover>
  )
}
