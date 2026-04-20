import type { ReactNode } from 'react'

import {
  UserIcon,
  SettingsIcon,
  CreditCardIcon,
  UsersIcon,
  SquarePenIcon,
  CirclePlusIcon,
  LogOutIcon
} from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from '@/i18n/routing'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

const ProfileDropdown = ({ trigger, defaultOpen, align = 'end' }: Props) => {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    document.cookie = 'token=; path=/; max-age=0;'
    toast.success('已退出登录')
    router.push('/login')
  }

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className='w-64' align={align || 'end'}>
        <DropdownMenuLabel className='flex items-center gap-3 px-3 py-2 font-normal'>
          <div className='relative'>
            <Avatar className='size-8'>
              <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' alt='John Doe' />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
          </div>
          <div className='flex flex-1 flex-col items-start'>
            <span className='text-foreground text-sm font-semibold'>John Doe</span>
            <span className='text-muted-foreground text-xs'>john.doe@example.com</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='px-3 py-2 text-sm'>
            <UserIcon className='text-foreground mr-2 size-4' />
            <span>My account</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-3 py-2 text-sm'>
            <SettingsIcon className='text-foreground mr-2 size-4' />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-3 py-2 text-sm'>
            <CreditCardIcon className='text-foreground mr-2 size-4' />
            <span>Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='px-3 py-2 text-sm'>
            <UsersIcon className='text-foreground mr-2 size-4' />
            <span>Manage team</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-3 py-2 text-sm'>
            <SquarePenIcon className='text-foreground mr-2 size-4' />
            <span>Customization</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='px-3 py-2 text-sm'>
            <CirclePlusIcon className='text-foreground mr-2 size-4' />
            <span>Add team account</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant='destructive' className='px-3 py-2 text-sm' onClick={handleLogout}>
          <LogOutIcon className='mr-2 size-4' />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
