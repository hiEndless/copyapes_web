'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { useMounted } from '@/components/docs/use-mounted'
import { Button } from '@/components/ui/button'

export function DocsModeToggle() {
  const mounted = useMounted()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) {
    return (
      <Button className='h-9 w-9 cursor-pointer' size='icon' type='button' variant='outline'>
        <Sun className='h-[1.1rem] w-[1.1rem]' />
        <span className='sr-only'>Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button className='h-9 w-9 cursor-pointer' onClick={toggleTheme} size='icon' variant='outline'>
      <Sun className='h-[1.1rem] w-[1.1rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
      <Moon className='absolute h-[1.1rem] w-[1.1rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  )
}
