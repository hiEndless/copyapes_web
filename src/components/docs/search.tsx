'use client'

import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { FileText, Search as SearchIcon } from 'lucide-react'

import { DocsAnchor } from '@/components/docs/anchor'
import { useMounted } from '@/components/docs/use-mounted'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { DocsNavItem } from '@/lib/docs/nav'
import { isNavRoute } from '@/lib/docs/nav'
import {
  advanceSearch,
  debounce,
  highlight,
  type DocsSearchDocument,
  type DocsSearchResult
} from '@/lib/docs/search'
import { cn } from '@/lib/utils'

function SearchTriggerShell() {
  return (
    <div className='relative max-w-md flex-1'>
      <SearchIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400' />
      <Input
        className='bg-background h-9 w-full rounded-md border pr-4 pl-10 text-sm shadow md:w-full'
        placeholder='Search'
        readOnly
        type='search'
      />
    </div>
  )
}

export function DocsSearch({
  documents,
  navItems
}: {
  documents: DocsSearchDocument[]
  navItems: DocsNavItem[]
}) {
  const mounted = useMounted()
  const [searchedInput, setSearchedInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<DocsSearchResult[]>([])

  const debounceSearch = useMemo(
    () =>
      debounce((input: string) => {
        setIsLoading(true)
        setResults(advanceSearch(input.trim(), documents))
        setIsLoading(false)
      }, 300),
    [documents]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (mounted) setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mounted])

  useEffect(() => {
    if (searchedInput.length < 3) {
      Promise.resolve().then(() => setResults([]))

      return
    }

    debounceSearch(searchedInput)
  }, [searchedInput, debounceSearch])

  function renderDocuments(items: DocsNavItem[]): ReactNode[] {
    if (!Array.isArray(items) || items.length === 0) {
      return []
    }

    return items.flatMap(doc => {
      if (!isNavRoute(doc)) return []

      const href = doc.href || ''
      const children = (doc.items || []).filter(isNavRoute).filter(item => !item.noLink)

      return [
        !doc.noLink && doc.href ? (
          <DialogClose asChild key={href}>
            <DocsAnchor
              className={cn(
                'flex w-full items-center gap-2.5 rounded-sm px-3 text-[15px] transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              )}
              href={href}
            >
              <div className='flex h-full w-fit items-center gap-1.5 py-3 whitespace-nowrap'>
                <FileText className='h-[1.1rem] w-[1.1rem]' /> {doc.title}
              </div>
            </DocsAnchor>
          </DialogClose>
        ) : null,
        ...renderDocuments(children)
      ]
    })
  }

  if (!mounted) {
    return <SearchTriggerShell />
  }

  return (
    <Dialog
      onOpenChange={open => {
        setIsOpen(open)

        if (!open) {
          setTimeout(() => setSearchedInput(''), 200)
        }
      }}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <div className='relative max-w-md flex-1 cursor-pointer'>
          <SearchIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400' />
          <Input
            className='bg-background h-9 w-full rounded-md border pr-4 pl-10 text-sm shadow md:w-full'
            placeholder='Search'
            readOnly
            type='search'
          />
        </div>
      </DialogTrigger>

      <DialogContent className='top-[45%] max-w-xs p-0 sm:top-[38%] sm:max-w-lg'>
        <DialogTitle className='sr-only'>Search</DialogTitle>
        <DialogHeader>
          <input
            autoFocus
            className='h-14 border-b bg-transparent px-4 text-[15px] outline-none'
            onChange={e => setSearchedInput(e.target.value)}
            placeholder='Search...'
            value={searchedInput}
          />
        </DialogHeader>

        {searchedInput.length > 0 && searchedInput.length < 3 ? (
          <p className='text-warning mx-auto mt-2 text-sm'>Please enter at least 3 characters.</p>
        ) : null}

        {isLoading ? (
          <p className='text-muted-foreground mx-auto mt-2 text-sm'>Searching...</p>
        ) : (
          results.length === 0 &&
          searchedInput.length >= 3 && (
            <p className='text-muted-foreground mx-auto mt-2 text-sm'>
              No results found for <span className='text-primary'>{`"${searchedInput}"`}</span>
            </p>
          )
        )}

        <ScrollArea className='max-h-87.5 w-full overflow-hidden'>
          <div className='flex w-full flex-col items-start px-1 pt-1 pb-4 sm:px-3'>
            {searchedInput
              ? results.map(item => {
                  if (!('href' in item)) return null

                  const href = item.href.startsWith('/docs')
                    ? item.href
                    : `/docs${item.href.startsWith('/') ? item.href : `/${item.href}`}`

                  return (
                    <DialogClose asChild key={href}>
                      <DocsAnchor
                        className={cn(
                          'flex w-full max-w-77.5 flex-col gap-0.5 rounded-sm p-3 text-[15px] transition-all duration-300 hover:bg-neutral-100 sm:max-w-120 dark:hover:bg-neutral-900'
                        )}
                        href={href}
                      >
                        <div className='flex h-full items-center gap-x-2'>
                          <FileText className='h-[1.1rem] w-[1.1rem]' />
                          <span className='truncate'>{item.title}</span>
                        </div>
                        {item.snippet ? (
                          <p
                            className='truncate text-xs text-neutral-500 dark:text-neutral-400'
                            dangerouslySetInnerHTML={{
                              __html: highlight(item.snippet, searchedInput)
                            }}
                          />
                        ) : null}
                      </DocsAnchor>
                    </DialogClose>
                  )
                })
              : renderDocuments(navItems)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
