'use client'

import { useState, useMemo } from 'react'

import {
  Trash2Icon,
  SquarePen,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  RefreshCw
} from 'lucide-react'
import type { ColumnDef, ColumnFiltersState, PaginationState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { deleteApi, refreshApiBalance } from '@/api/apiadd'
import { settingsApi } from '@/api/settings'

import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'

import { ApiEditLabelDialog } from './api-edit-label-dialog'

export type ApiItem = {
  id: number
  platform: string
  api_name: string
  uid: string | null
  usdt: number | null
  created_at: string
  create_datetime?: string
  is_readonly: boolean
  flag?: number
  status: number // 1 for ok, else error
  role_type?: number | any
  exchange?: string
}

const PLATFORM_MAP: Record<string, { name: string; logo: string }> = {
  okx: { name: 'OKX', logo: '/exchanges/okx.png' },
  binance: { name: 'Binance', logo: '/exchanges/binance.png' },
  gate: { name: 'Gate', logo: '/exchanges/gate.png' },
  bitget: { name: 'Bitget', logo: '/exchanges/bitget.png' },
  weex: { name: 'WEEX', logo: '/exchanges/weex.png' },
  htx: { name: 'HTX', logo: '/exchanges/htx.svg' }
}

type Translator = ReturnType<typeof useTranslations>

const getColumns = (
  t: Translator,
  onEditLabel: (item: ApiItem) => void,
  onRefresh?: () => void
): ColumnDef<ApiItem>[] => [
  {
    header: t('table.columns.label'),
    accessorKey: 'api_name',
    cell: ({ row }) => {
      const platformKey = row.original.platform?.toLowerCase() || ''

      const platformInfo = PLATFORM_MAP[platformKey] || {
        name: platformKey.toUpperCase() || t('common.unknown'),
        logo: '/exchanges/default.png'
      }

      return (
        <div className='flex items-center gap-2'>
          <div className='bg-muted/50 flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-1.5'>
            {platformInfo.logo ? (
              <img
                src={platformInfo.logo}
                alt={platformInfo.name}
                className='h-full w-full object-contain'
                onError={e => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : null}
          </div>
          <span className='font-medium'>{row.getValue('api_name') || '-'}</span>
          <Button
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:text-foreground h-6 w-6'
            onClick={() => onEditLabel(row.original)}
            aria-label={t('table.editLabelAria')}
          >
            <SquarePen className='h-2 w-2' />
          </Button>
        </div>
      )
    }
  },
  {
    header: t('table.columns.uid'),
    accessorKey: 'uid',
    cell: ({ row }) => <span className='font-mono text-xs'>{row.getValue('uid') || '-'}</span>
  },
  {
    header: t('table.columns.balance'),
    accessorKey: 'usdt',
    cell: ({ row }) => {
      const val = row.getValue('usdt')

      return <span className='text-xs tabular-nums'>{typeof val === 'number' ? val.toFixed(4) : '-'}</span>
    }
  },
  {
    header: t('table.columns.createdAt'),
    accessorKey: 'create_datetime',
    cell: ({ row }) => {
      const dateStr = row.getValue('create_datetime') as string
      const formattedDate = dateStr ? dateStr.replace('T', ' ') : '-'

      return <span className='text-muted-foreground text-xs'>{formattedDate}</span>
    }
  },
  {
    header: t('table.columns.permission'),
    accessorKey: 'is_readonly',
    cell: ({ row }) => {
      const isReadOnly = row.getValue('is_readonly') as boolean

      return (
        <span
          className={cn('text-xs font-medium', isReadOnly ? 'text-green-600 dark:text-green-400' : 'text-foreground')}
        >
          {isReadOnly ? t('table.permission.readOnly') : t('table.permission.trade')}
        </span>
      )
    }
  },
  {
    id: 'actions',
    header: () => t('table.columns.actions'),
    cell: function Cell({ row }) {
      const [balanceBusy, setBalanceBusy] = useState(false)

      const handleRefreshBalance = async () => {
        setBalanceBusy(true)
        try {
          const res = await refreshApiBalance(row.original.id)

          if (res.code === 0) {
            toast.success(t('table.toasts.balanceUpdated'))
            onRefresh?.()
          } else {
            toast.error(res.error || t('table.toasts.balanceUpdateFailed'))
          }
        } catch (error) {
          console.error('更新余额失败:', error)
          toast.error(t('table.toasts.balanceUpdateRetry'))
        } finally {
          setBalanceBusy(false)
        }
      }

      const handleDelete = async () => {
        try {
          const res = await deleteApi(row.original.id)

          if (res.code === 0) {
            toast.success(t('table.toasts.deleteSuccess'))
            onRefresh?.()
            
            // 刷新全局权益信息，同步剩余 API 额度
            try {
              const profile = await settingsApi.getEntitlementProfile()

              if (profile) {
                localStorage.setItem('entitlementProfile', JSON.stringify(profile))
                window.dispatchEvent(new Event('entitlementProfileUpdated'))
              }
            } catch (err) {
              console.error('Failed to fetch entitlement profile after deleting API:', err)
            }
          } else {
            toast.error(res.error || t('table.toasts.deleteFailed'))
          }
        } catch (error) {
          console.error('删除失败:', error)
          toast.error(t('table.toasts.deleteRetry'))
        }
      }

      return (
        <div className='flex items-center gap-1'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label={t('table.actions.refreshBalanceAria')}
                  disabled={balanceBusy}
                  onClick={handleRefreshBalance}
                >
                  <RefreshCw className={`size-4 ${balanceBusy ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('table.actions.refreshBalance')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <AlertDialog>
            <TooltipProvider>
              <Tooltip>
                <AlertDialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button variant='ghost' size='icon' aria-label={t('table.actions.deleteAria')}>
                      <Trash2Icon className='text-destructive size-4.5' />
                    </Button>
                  </TooltipTrigger>
                </AlertDialogTrigger>
                <TooltipContent>
                  <p>{t('table.actions.delete')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('table.deleteDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('table.deleteDialog.description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className='bg-red-500 text-white hover:bg-red-600'>
                  {t('table.deleteDialog.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    },
    enableHiding: false
  }
]

const ApiDatatable = ({ data, onRefresh }: { data: ApiItem[]; onRefresh?: () => void }) => {
  const t = useTranslations('DashboardApi')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [editLabelOpen, setEditLabelOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ApiItem | null>(null)

  const handleEditLabel = (item: ApiItem) => {
    setEditingItem(item)
    setEditLabelOpen(true)
  }

  const columns = useMemo(() => getColumns(t, handleEditLabel, onRefresh), [t, onRefresh])

  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination
  })

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 3
  })

  return (
    <div className='w-full'>
      <div className='border-b'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className='bg-muted/30 h-14 border-t'>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className='text-muted-foreground first:pl-4 last:px-4'
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              'flex h-full cursor-pointer items-center justify-between gap-2 select-none'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUpIcon className='shrink-0 opacity-60' size={16} aria-hidden='true' />,
                            desc: <ChevronDownIcon className='shrink-0 opacity-60' size={16} aria-hidden='true' />
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='hover:bg-transparent'>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className='h-14 first:w-12.5 first:pl-4 last:w-29 last:px-4'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='text-muted-foreground h-32 text-center'>
                  {t('table.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col md:max-lg:flex-col'>
        <p className='text-muted-foreground text-sm whitespace-nowrap' aria-live='polite'>
          {t('table.pagination.summary', {
            from: table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1,
            to: Math.min(
              Math.max(
                table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                  table.getState().pagination.pageSize,
                0
              ),
              table.getRowCount()
            ),
            total: table.getRowCount()
          })}
        </p>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  className='disabled:pointer-events-none disabled:opacity-50'
                  variant={'ghost'}
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label='Go to previous page'
                >
                  <ChevronLeftIcon aria-hidden='true' />
                  {t('table.pagination.previous')}
                </Button>
              </PaginationItem>

              {showLeftEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {pages.map(page => {
                const isActive = page === table.getState().pagination.pageIndex + 1

                return (
                  <PaginationItem key={page}>
                    <Button
                      size='icon'
                      className={`${!isActive && 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'}`}
                      onClick={() => table.setPageIndex(page - 1)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                )
              })}

              {showRightEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <Button
                  className='disabled:pointer-events-none disabled:opacity-50'
                  variant={'ghost'}
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label='Go to next page'
                >
                  {t('table.pagination.next')}
                  <ChevronRightIcon aria-hidden='true' />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <ApiEditLabelDialog
        open={editLabelOpen}
        onOpenChange={setEditLabelOpen}
        item={editingItem}
        onSuccess={() => {
          onRefresh?.()
        }}
      />
    </div>
  )
}

export default ApiDatatable
