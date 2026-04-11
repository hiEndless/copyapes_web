'use client'

import * as React from 'react'

import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked ?? false)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : uncontrolledChecked

  const handleCheckedChange = (nextChecked: boolean) => {
    if (!isControlled) {
      setUncontrolledChecked(nextChecked)
    }

    onCheckedChange?.(nextChecked)
  }

  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleCheckedChange}
      className={cn(
        'peer data-[state=unchecked]:bg-input data-[state=checked]:bg-primary dark:data-[state=unchecked]:bg-input/80 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex shrink-0 items-center overflow-hidden rounded-full border border-transparent shadow-xs transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      style={{
        width: 44,
        height: 24,
        minWidth: 44,
        borderRadius: 9999,
        backgroundColor: isChecked ? 'var(--primary)' : 'var(--input)',
        transition: 'background-color 150ms ease'
      }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className='bg-background dark:data-[state=checked]:bg-primary-foreground pointer-events-none block h-5 w-5 rounded-full shadow-sm ring-0'
        style={{
          transform: `translateX(${isChecked ? 22 : 2}px)`,
          transition: 'transform 150ms ease'
        }}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
