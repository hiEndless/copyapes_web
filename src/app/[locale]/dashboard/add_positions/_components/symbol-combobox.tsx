'use client'

import * as React from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type SymbolComboboxProps = {
  symbols: string[]
  value: string
  onChange: (symbol: string) => void
  disabled?: boolean
  placeholder?: string
}

export function SymbolCombobox({
  symbols,
  value,
  onChange,
  disabled,
  placeholder = '选择或搜索交易对',
}: SymbolComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className='h-9 w-full justify-between rounded-lg border-border/80 text-[13px] font-normal shadow-sm'
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value || placeholder}
          </span>
          <ChevronsUpDownIcon className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border-border/80 p-0 text-[13px] shadow-lg'
        align='start'
      >
        <Command>
          <CommandInput placeholder='搜索交易对...' />
          <CommandList>
            <CommandEmpty>无匹配交易对</CommandEmpty>
            <CommandGroup>
              {symbols.map(sym => (
                <CommandItem
                  key={sym}
                  value={sym}
                  onSelect={() => {
                    onChange(sym)
                    setOpen(false)
                  }}
                >
                  <CheckIcon className={cn('mr-2 size-4', value === sym ? 'opacity-100' : 'opacity-0')} />
                  {sym}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
