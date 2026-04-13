'use client'

import React, { useEffect, useState, type ComponentType } from 'react'

import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ActivityIcon,
  BellIcon,
  BellRingIcon,
  BookMarkedIcon,
  ChevronRightIcon,
  CircleOffIcon,
  CopyIcon,
  DollarSignIcon,
  FacebookIcon,
  FolderIcon,
  InstagramIcon,
  LanguagesIcon,
  LayoutGridIcon,
  LayoutListIcon,
  LinkedinIcon,
  LockKeyholeIcon,
  MailIcon,
  MailOpenIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  MoonStarIcon,
  MousePointerClickIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  SunIcon,
  TicketCheckIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  TwitterIcon,
  UserIcon,
  Share2,
  Cookie,
  LandPlot,
  Flame,
  UserStar,
  ShieldUser,
  Unplug,
  MessageCircleWarning,
  Bug,
  ListChecks
} from 'lucide-react'

import NextTopLoader from 'nextjs-toploader'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'

// import SearchDialog from '@/components/shadcn-studio/blocks/dashboard/dialog-search'
import LanguageDropdown from '@/components/shadcn-studio/blocks/dashboard/dropdown-language'
import ActivityDialog from '@/components/shadcn-studio/blocks/dashboard/dialog-activity'
import NotificationDropdown from '@/components/shadcn-studio/blocks/dashboard/dropdown-notification'
import ProfileDropdown from '@/components/shadcn-studio/blocks/dashboard/dropdown-profile'
import SupportDialog from '@/components/shadcn-studio/blocks/dashboard/dialog-support'

import Logo from '@/components/logo'

type MenuSubItem = {
  label: string
  href: string
  badge?: string
}

type MenuItem = {
  icon: ComponentType
  label: string
} & (
  | {
      href: string
      badge?: string
      items?: never
    }
  | { href?: never; badge?: never; items: MenuSubItem[] }
)

const menuItems: MenuItem[] = [
  {
    icon: LayoutGridIcon,
    label: '首页',
    href: '/dashboard'
  },
  {
    icon: DollarSignIcon,
    label: '订阅服务',
    href: '/dashboard/pricing'
  },
  {
    icon: Share2,
    label: '邀请好友',
    href: '/dashboard/invite'
  }
]

const adminItems: MenuItem[] = [
  {
    icon: ShieldUser,
    label: '系统后台',
    href: '/dashboard/admin'
  },
  {
    icon: UserStar,
    label: '代理商后台',
    items: [
      { label: '代理设置', href: '/dashboard/partner' },
      { label: '返佣设置', href: '/dashboard/partner/rebate' },
      { label: '兑换码创建', href: '/dashboard/partner/redeem_codes' },
      { label: '推广用户列表', href: '/dashboard/partner/invite_list' },
      { label: 'VIP 客户列表', href: '/dashboard/partner/vip_list' },
      { label: '收益流水', href: '/dashboard/partner/revenue' },
      { label: '提现流水', href: '/dashboard/partner/withdrawal' }
    ]
  }
]

const copyItems: MenuItem[] = [
  {
    icon: LayoutListIcon,
    label: '跟单任务列表',
    href: '/dashboard/task_list'
  },
  {
    icon: CopyIcon,
    label: '创建跟单',
    items: [
      { label: '交易所自选', href: '/dashboard/add_task/exchange_task' },
      { label: '币coin 自选', href: '/dashboard/add_task/bicoin_task' },
      { label: 'HyperLiquid 自选', href: '/dashboard/add_task/hyper_task' },
      { label: 'API 跟单', href: '/dashboard/add_task/api_task' },
      { label: 'Cookie 跟单', href: '/dashboard/add_task/cookie_task' }
    ]
  },
  {
    icon: Flame,
    label: '热门带单 KOL 推荐',
    href: '/dashboard/add_task/hot'
  },
  {
    icon: Flame,
    label: 'HyperLiquid KOL 推荐',
    href: '/dashboard/hyper_discover'
  }
]

const toolsItems: MenuItem[] = [
  {
    icon: Cookie,
    label: 'Cookie 获取',
    href: '/dashboard/cookie'
  },
  {
    icon: LandPlot,
    label: '跟单抢位',
    href: '/dashboard/grab',
    badge: '4天必中'
  },
  {
    icon: ListChecks,
    label: '持仓管理',
    href: '/dashboard/positions'
  }
]

const settingsItems: MenuItem[] = [
  {
    icon: Unplug,
    label: 'API 管理',
    href: '/dashboard/api'
  },
  {
    icon: SettingsIcon,
    label: '账户设置',
    href: '/dashboard/account'
  },
  {
    icon: MessageCircleWarning,
    label: '消息通知',
    href: '/dashboard/notifications'
  }
]

const SidebarGroupedMenuItems = ({ data, groupLabel }: { data: MenuItem[]; groupLabel?: string }) => {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {data.map(item => {
            // Remove locale prefix (e.g. /en, /zh) from pathname for matching
            const pathnameWithoutLocale = pathname.replace(/^\/[^\/]+/, '') || '/'

            const isActiveItem =
              !item.items &&
              (pathnameWithoutLocale === item.href ||
                (item.href !== '/dashboard' && pathnameWithoutLocale.startsWith(`${item.href}/`)))

            const isSubMenuActive = item.items?.some(
              subItem =>
                pathnameWithoutLocale === subItem.href ||
                (subItem.href !== '/dashboard' && pathnameWithoutLocale.startsWith(`${subItem.href}/`))
            )

            return item.items ? (
              <Collapsible className='group/collapsible' key={item.label} defaultOpen={isSubMenuActive}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.label} isActive={isSubMenuActive}>
                      <item.icon />
                      <span>{item.label}</span>
                      <ChevronRightIcon className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map(subItem => (
                        <SidebarMenuSubItem key={subItem.label}>
                          <SidebarMenuSubButton
                            className='justify-between'
                            isActive={
                              pathnameWithoutLocale === subItem.href ||
                              (subItem.href !== '/dashboard' && pathnameWithoutLocale.startsWith(`${subItem.href}/`))
                            }
                            asChild
                          >
                            <Link href={subItem.href}>
                              {subItem.label}
                              {subItem.badge && (
                                <span className='bg-primary/10 flex h-5 min-w-5 items-center justify-center rounded-full text-xs'>
                                  {subItem.badge}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton tooltip={item.label} isActive={isActiveItem} asChild>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
                {item.badge && <SidebarMenuBadge className='bg-primary/10 rounded-full'>{item.badge}</SidebarMenuBadge>}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className='flex min-h-dvh w-full'>
      <NextTopLoader color='hsl(var(--primary))' showSpinner={false} />
      <SidebarProvider>
        <Sidebar collapsible='icon'>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size='lg' className='gap-2.5 !bg-transparent [&>svg]:size-8' asChild>
                  <a href='/'>
                    <Logo />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroupedMenuItems data={menuItems} />
            <SidebarGroupedMenuItems data={adminItems} groupLabel='系统服务' />
            <SidebarGroupedMenuItems data={copyItems} groupLabel='跟单服务' />
            <SidebarGroupedMenuItems data={toolsItems} groupLabel='工具服务' />
            <SidebarGroupedMenuItems data={settingsItems} groupLabel='系统设置' />
          </SidebarContent>
        </Sidebar>
        <div className='flex flex-1 flex-col'>
          <header className='before:bg-background/60 sticky top-0 z-50 before:absolute before:inset-0 before:mask-[linear-gradient(var(--card),var(--card)_18%,transparent_100%)] before:backdrop-blur-md'>
            <div className='bg-card relative z-51 mx-auto mt-3 flex w-[calc(100%-2rem)] max-w-[calc(1280px-3rem)] items-center justify-between rounded-xl border px-6 py-2 sm:w-[calc(100%-3rem)]'>
              <div className='flex items-center gap-1.5 sm:gap-4'>
                <SidebarTrigger className='[&_svg]:!size-5' />
                <Separator orientation='vertical' className='hidden !h-4 sm:block' />
                {/* <SearchDialog
                  trigger={
                    <>
                      <Button variant='ghost' className='hidden !bg-transparent px-1 py-0 font-normal sm:block'>
                        <div className='text-muted-foreground hidden items-center gap-1.5 text-sm sm:flex'>
                          <SearchIcon />
                          <span>Type to search...</span>
                        </div>
                      </Button>
                      <Button variant='ghost' size='icon' className='sm:hidden'>
                        <SearchIcon />
                        <span className='sr-only'>Search</span>
                      </Button>
                    </>
                  }
                /> */}
              </div>
              <div className='flex items-center gap-1.5'>
                <LanguageDropdown
                  trigger={
                    <Button variant='ghost' size='icon'>
                      <LanguagesIcon />
                    </Button>
                  }
                />
                <Button
                  variant='ghost'
                  size='icon'
                  className='relative'
                  onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
                >
                  <MoonStarIcon className='scale-100 dark:scale-0' />
                  <SunIcon className='absolute scale-0 dark:scale-100' />
                  <span className='sr-only'>Toggle theme</span>
                </Button>
                <ActivityDialog
                  trigger={
                    <Button variant='ghost' size='icon'>
                      <ActivityIcon />
                    </Button>
                  }
                />
                <ActivityDialog
                  trigger={
                    <Button variant='ghost' size='icon'>
                      <Bug />
                    </Button>
                  }
                />
                <NotificationDropdown
                  trigger={
                    <Button variant='ghost' size='icon' className='relative'>
                      <BellIcon />
                      <span className='bg-destructive absolute top-2 right-2.5 size-2 rounded-full' />
                    </Button>
                  }
                />
                <ProfileDropdown
                  trigger={
                    <Button variant='ghost' size='icon' className='size-9.5'>
                      <Avatar className='size-9.5 rounded-md'>
                        <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
              </div>
            </div>
          </header>

          <main className='mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6'>{children}</main>

          <footer>
            <div className='text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-between gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6'>
              <p className='text-sm text-balance max-sm:text-center'>
                {`©${new Date().getFullYear()}`} Made with ❤️ by CopyApes.
              </p>
            </div>
          </footer>

          <SupportDialog />
        </div>
      </SidebarProvider>
    </div>
  )
}

export default DashboardShell
