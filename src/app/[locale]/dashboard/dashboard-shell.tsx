'use client'

import React, { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'

import { useTheme } from 'next-themes'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ActivityIcon,
  ChevronRightIcon,
  CopyIcon,
  Crown,
  LanguagesIcon,
  LayoutGridIcon,
  LayoutListIcon,
  MoonStarIcon,
  SettingsIcon,
  SunIcon,
  Gift,
  Cookie,
  LandPlot,
  Flame,
  UserStar,
  ShieldUser,
  Unplug,
  MessageCircleWarning,
  ListChecks,
  ListCheck,
  Boxes
} from 'lucide-react'

import NextTopLoader, { useTopLoader } from 'nextjs-toploader'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import ProfileDropdown from '@/components/shadcn-studio/blocks/dashboard/dropdown-profile'
import SupportDialog from '@/components/shadcn-studio/blocks/dashboard/dialog-support'
import Alert10 from '@/components/shadcn-studio/alert/alert-10'

import Logo from '@/components/logo'
import { settingsApi } from '@/api/settings'
import { isChineseLocale } from '@/i18n/locales'
import { TOUR_ANCHORS, tourAnchor, type TourAnchor } from '@/features/tour/anchors'
import { TourProvider } from '@/features/tour/tour-provider'
import TourHelpMenu from '@/features/tour/components/tour-help-menu'

type MenuSubItem = {
  id: string
  label: string
  href: string
  badge?: string
}

type MenuItem = {
  id: string
  icon: ComponentType
  label: string
  /** 引导锚点，供新手指引与功能点介绍定位 */
  anchor?: TourAnchor
} & (
  | {
      href: string
      badge?: string
      items?: never
    }
  | { href?: never; badge?: never; items: MenuSubItem[] }
)

type MenuSubItemConfig = {
  id: string
  labelKey: string
  href: string
  badgeKey?: string
}

type MenuItemConfig = {
  id: string
  icon: ComponentType
  labelKey: string
  anchor?: TourAnchor
} & (
  | {
      href: string
      badgeKey?: string
      items?: never
    }
  | { href?: never; badgeKey?: never; items: MenuSubItemConfig[] }
)

const menuItemConfigs: MenuItemConfig[] = [
  {
    id: 'home',
    icon: LayoutGridIcon,
    labelKey: 'nav.home',
    href: '/dashboard',
    anchor: TOUR_ANCHORS.navHome
  },
  {
    id: 'pricing',
    icon: Crown,
    labelKey: 'nav.pricing',
    href: '/dashboard/pricing',
    anchor: TOUR_ANCHORS.navPricing
  },
  {
    id: 'invite',
    icon: Gift,
    labelKey: 'nav.invite',
    href: '/dashboard/invite',
    anchor: TOUR_ANCHORS.navInvite
  }
]

const adminItemConfigs: MenuItemConfig[] = [
  {
    id: 'admin',
    icon: ShieldUser,
    labelKey: 'nav.admin',
    href: '/dashboard/admin'
  },
  {
    id: 'partner',
    icon: UserStar,
    labelKey: 'nav.partner',
    items: [
      { id: 'partnerSettings', labelKey: 'nav.partnerSettings', href: '/dashboard/partner/settings' },
      { id: 'partnerUsers', labelKey: 'nav.partnerUsers', href: '/dashboard/partner/user_list' },
      { id: 'partnerRevenue', labelKey: 'nav.partnerRevenue', href: '/dashboard/partner/revenue' }
    ]
  }
]

const copyItemConfigs: MenuItemConfig[] = [
  {
    id: 'taskList',
    icon: LayoutListIcon,
    labelKey: 'nav.taskList',
    href: '/dashboard/task_list',
    anchor: TOUR_ANCHORS.navTaskList
  },
  {
    id: 'createTask',
    icon: CopyIcon,
    labelKey: 'nav.createTask',
    anchor: TOUR_ANCHORS.navCreateTask,
    items: [
      { id: 'exchangeTask', labelKey: 'nav.exchangeTask', href: '/dashboard/add_task/exchange_task' },
      { id: 'bicoinTask', labelKey: 'nav.bicoinTask', href: '/dashboard/add_task/bicoin_task' },
      { id: 'hyperTask', labelKey: 'nav.hyperTask', href: '/dashboard/add_task/hyper_task' },
      { id: 'apiTask', labelKey: 'nav.apiTask', href: '/dashboard/add_task/api_task' },
      { id: 'cookieTask', labelKey: 'nav.cookieTask', href: '/dashboard/add_task/cookie_task' }
    ]
  },
  {
    id: 'hotKol',
    icon: Flame,
    labelKey: 'nav.hotKol',
    href: '/dashboard/add_task/hot',
    anchor: TOUR_ANCHORS.navHotKol
  },
  {
    id: 'hyperKol',
    icon: Flame,
    labelKey: 'nav.hyperKol',
    href: '/dashboard/hyper_discover'
  }
]

const toolsItemConfigs: MenuItemConfig[] = [
  {
    id: 'cookie',
    icon: Cookie,
    labelKey: 'nav.cookie',
    href: '/dashboard/cookie',
    anchor: TOUR_ANCHORS.navCookie
  },
  {
    id: 'grab',
    icon: LandPlot,
    labelKey: 'nav.grab',
    href: '/dashboard/grab',
    badgeKey: 'badges.grabHit',
    anchor: TOUR_ANCHORS.navGrab
  }
]

const studioToolsItemConfigs: MenuItemConfig[] = [
  {
    id: 'studioTasks',
    icon: Boxes,
    labelKey: 'nav.studioTasks',
    href: '/dashboard/studio_tasks'
  },
  {
    id: 'positions',
    icon: ListChecks,
    labelKey: 'nav.positions',
    href: '/dashboard/positions'
  },
  {
    id: 'addPositions',
    icon: ListCheck,
    labelKey: 'nav.addPositions',
    href: '/dashboard/add_positions'
  }
]

const settingsItemConfigs: MenuItemConfig[] = [
  {
    id: 'api',
    icon: Unplug,
    labelKey: 'nav.api',
    href: '/dashboard/api',
    anchor: TOUR_ANCHORS.navApi
  },
  {
    id: 'account',
    icon: SettingsIcon,
    labelKey: 'nav.account',
    href: '/dashboard/account'
  },
  {
    id: 'notifications',
    icon: MessageCircleWarning,
    labelKey: 'nav.notifications',
    href: '/dashboard/notifications',
    anchor: TOUR_ANCHORS.navNotifications
  }
]

function localizeMenuItems(
  configs: MenuItemConfig[],
  t: (key: string) => string
): MenuItem[] {
  return configs.map(config => {
    const label = t(config.labelKey)
    if (config.items) {
      return {
        id: config.id,
        icon: config.icon,
        label,
        anchor: config.anchor,
        items: config.items.map(sub => ({
          id: sub.id,
          label: t(sub.labelKey),
          href: sub.href,
          ...(sub.badgeKey ? { badge: t(sub.badgeKey) } : {})
        }))
      }
    }

    return {
      id: config.id,
      icon: config.icon,
      label,
      href: config.href,
      anchor: config.anchor,
      ...(config.badgeKey ? { badge: t(config.badgeKey) } : {})
    }
  })
}

const SidebarGroupedMenuItems = ({ data, groupLabel }: { data: MenuItem[]; groupLabel?: string }) => {
  const pathname = usePathname()
  const topLoader = useTopLoader()

  if (!data || data.length === 0) return null

  const pathnameWithoutLocale = pathname.replace(/^\/[^\/]+/, '') || '/'

  const startNavigationLoader = (href: string) => {
    if (pathnameWithoutLocale === href) return

    topLoader.start()
    topLoader.setProgress(0.08)
  }

  return (
    <SidebarGroup>
      {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {data.map(item => {
            const isActiveItem =
              !item.items &&
              (pathnameWithoutLocale === item.href ||
                (item.href !== '/dashboard' && pathnameWithoutLocale.startsWith(`${item.href}/`)))

            const isSubMenuActive = item.items?.some(
              subItem =>
                pathnameWithoutLocale === subItem.href ||
                (subItem.href !== '/dashboard' && pathnameWithoutLocale.startsWith(`${subItem.href}/`))
            )

            const anchorProps = item.anchor ? tourAnchor(item.anchor) : undefined

            return item.items ? (
              <Collapsible className='group/collapsible' key={item.id} defaultOpen={isSubMenuActive}>
                <SidebarMenuItem {...anchorProps}>
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
                        <SidebarMenuSubItem key={subItem.id}>
                          <SidebarMenuSubButton
                            className='justify-between'
                            isActive={
                              pathnameWithoutLocale === subItem.href ||
                              (subItem.href !== '/dashboard' && pathnameWithoutLocale.startsWith(`${subItem.href}/`))
                            }
                            asChild
                          >
                            <Link href={subItem.href} onClick={() => startNavigationLoader(subItem.href)}>
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
              <SidebarMenuItem key={item.id} {...anchorProps}>
                <SidebarMenuButton tooltip={item.label} isActive={isActiveItem} asChild>
                  <Link href={item.href} onClick={() => startNavigationLoader(item.href)}>
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
  const t = useTranslations('DashboardShell')
  const locale = useLocale()
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const topLoader = useTopLoader()
  const topLoaderRef = useRef(topLoader)
  const pendingInitialLoadsRef = useRef(0)
  const completedInitialLoadsRef = useRef(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isPartner, setIsPartner] = useState(false)

  topLoaderRef.current = topLoader

  const menuItems = useMemo(() => localizeMenuItems(menuItemConfigs, t), [t])
  const adminItems = useMemo(() => localizeMenuItems(adminItemConfigs, t), [t])
  const copyItems = useMemo(() => localizeMenuItems(copyItemConfigs, t), [t])
  const toolsItems = useMemo(() => localizeMenuItems(toolsItemConfigs, t), [t])
  const studioToolsItems = useMemo(() => localizeMenuItems(studioToolsItemConfigs, t), [t])
  const settingsItems = useMemo(() => localizeMenuItems(settingsItemConfigs, t), [t])

  useEffect(() => {
    setMounted(true)

    try {
      const userInfoStr = localStorage.getItem('userInfo')

      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr)

        setIsAdmin(userInfo.is_admin === true)
        setIsPartner(userInfo.is_partner === true)
      }
    } catch (e) {
      console.error('Failed to parse userInfo', e)
    }

    const initialLoaders = 3

    const startInitialLoad = () => {
      if (pendingInitialLoadsRef.current === 0) {
        completedInitialLoadsRef.current = 0
        topLoaderRef.current.start()
        topLoaderRef.current.setProgress(0.08)
      }

      pendingInitialLoadsRef.current += 1
    }

    const finishInitialLoad = () => {
      pendingInitialLoadsRef.current = Math.max(0, pendingInitialLoadsRef.current - 1)
      completedInitialLoadsRef.current = Math.min(initialLoaders, completedInitialLoadsRef.current + 1)

      if (pendingInitialLoadsRef.current === 0 && completedInitialLoadsRef.current >= initialLoaders) {
        topLoaderRef.current.setProgress(0.95)
        topLoaderRef.current.done()

        return
      }

      topLoaderRef.current.setProgress(
        Math.min(0.9, 0.08 + (completedInitialLoadsRef.current / initialLoaders) * 0.82)
      )
    }

    const runInitialLoaderTask = async (task: () => Promise<void>) => {
      startInitialLoad()

      try {
        await task()
      } finally {
        finishInitialLoad()
      }
    }

    // Load entitlement profile on app shell mount
    const fetchEntitlementProfile = async () => {
      try {
        const profile = await settingsApi.getEntitlementProfile()

        if (profile) {
          localStorage.setItem('entitlementProfile', JSON.stringify(profile))
          window.dispatchEvent(new Event('entitlementProfileUpdated'))
        }
      } catch (err) {
        console.error('Failed to fetch entitlement profile on mount:', err)
      }
    }

    const fetchNotice = async () => {
      try {
        const noticeData = await settingsApi.getNoticeInfo()

        if (noticeData) {
          localStorage.setItem('noticeInfo', JSON.stringify(noticeData))
          window.dispatchEvent(new Event('noticeInfoUpdated'))
        }
      } catch (err) {
        console.error('Failed to fetch notice info on mount:', err)
      }
    }

    const fetchConnectInfo = async () => {
      try {
        const connectData = await settingsApi.getConnectInfo()

        if (connectData) {
          localStorage.setItem('connectInfo', JSON.stringify(connectData))
          window.dispatchEvent(new Event('connectInfoUpdated'))
        }
      } catch (err) {
        console.error('Failed to fetch connect info on mount:', err)
      }
    }

    const frameId = window.requestAnimationFrame(() => {
      void runInitialLoaderTask(fetchEntitlementProfile)
      void runInitialLoaderTask(fetchNotice)
      void runInitialLoaderTask(fetchConnectInfo)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      pendingInitialLoadsRef.current = 0
      completedInitialLoadsRef.current = 0
      topLoaderRef.current.done()
    }
  }, [])

  const filteredAdminItems = adminItems.filter(item => {
    if (item.id === 'admin' && !isAdmin) return false
    if (item.id === 'partner' && !isPartner) return false

    return true
  })

  return (
    <TourProvider>
      <NextTopLoader color='var(--primary)' height={4} shadow='0 0 12px var(--primary), 0 0 6px var(--primary)' showSpinner={false} />
      {!mounted ? null : (
        <div className='flex min-h-dvh w-full'>
          <SidebarProvider>
            <Sidebar collapsible='icon' className='z-[11]'>
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size='lg' className='gap-2.5 !bg-transparent [&>svg]:size-8' asChild>
                      <a href='/'>
                        <Logo className='[&_span]:text-base' />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroupedMenuItems data={menuItems} />
                <SidebarGroupedMenuItems data={filteredAdminItems} groupLabel={t('groups.system')} />
                <SidebarGroupedMenuItems data={copyItems} groupLabel={t('groups.copy')} />
                <SidebarGroupedMenuItems data={studioToolsItems} groupLabel={t('groups.studio')} />
                <SidebarGroupedMenuItems data={toolsItems} groupLabel={t('groups.tools')} />
                <SidebarGroupedMenuItems data={settingsItems} groupLabel={t('groups.settings')} />
              </SidebarContent>
              <SidebarFooter className='group-data-[collapsible=icon]:hidden'>
                <Link
                  href='https://chromewebstore.google.com/detail/copyapes-assistant/affmjifigldmicnbgpghddaneomejmfo'
                  className='block overflow-hidden rounded-lg transition-opacity hover:opacity-90'
                  target='_blank'
                >
                  <img
                    src={isChineseLocale(locale) ? '/images/copyapes-chrome-zh.png' : '/images/copyapes-chrome-en.png'}
                    alt={t('extensionAlt')}
                    className='w-full'
                  />
                </Link>
              </SidebarFooter>
            </Sidebar>
            <div className='flex flex-1 flex-col'>
              <div className='bg-background sticky top-0 z-10 pb-1'>
                <header className='before:bg-background/60 relative before:absolute before:inset-0 before:mask-[linear-gradient(var(--card),var(--card)_18%,transparent_100%)] before:backdrop-blur-md'>
                <div className='bg-card relative z-51 mx-auto mt-3 flex w-[calc(100%-2rem)] max-w-[calc(1280px-3rem)] items-center justify-between rounded-xl border px-6 py-2 sm:w-[calc(100%-3rem)]'>
                  <div className='flex items-center gap-1.5 sm:gap-4'>
                    <SidebarTrigger className='[&_svg]:!size-5' {...tourAnchor(TOUR_ANCHORS.sidebarToggle)} />
                    <Separator orientation='vertical' className='hidden !h-4 sm:block' />
              </div>
              <div className='flex items-center gap-1.5'>
                <TourHelpMenu />
                <LanguageDropdown
                  trigger={
                    <Button variant='ghost' size='icon' {...tourAnchor(TOUR_ANCHORS.headerLanguage)}>
                      <LanguagesIcon />
                    </Button>
                  }
                />
                <Button variant='ghost' size='icon' title={t('serviceStatus')} asChild>
                  <a
                    href='https://watchdog.lichaoyuan.com/status'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <ActivityIcon />
                    <span className='sr-only'>{t('serviceStatus')}</span>
                  </a>
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='relative'
                  onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
                  {...tourAnchor(TOUR_ANCHORS.headerTheme)}
                >
                  <MoonStarIcon className='scale-100 dark:scale-0' />
                  <SunIcon className='absolute scale-0 dark:scale-100' />
                  <span className='sr-only'>Toggle theme</span>
                </Button>
                {/* <ActivityDialog
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
                /> */}
                <ProfileDropdown
                  trigger={
                    <Button variant='ghost' size='icon' className='size-9.5' {...tourAnchor(TOUR_ANCHORS.headerProfile)}>
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

              <div className='mx-auto mt-2 w-[calc(100%-2rem)] max-w-[calc(1280px-3rem)] sm:w-[calc(100%-3rem)]'>
                <Alert10 />
              </div>
              </div>

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
      )}
    </TourProvider>
  )
}

export default DashboardShell
