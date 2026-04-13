'use client'

import { useState } from 'react'

import { EyeIcon, BanIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from 'lucide-react'
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

import { useRouter } from '@/i18n/routing'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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

export type TaskItem = {
  id: number
  uniqueName: string
  trader_platform: number // 1: OKX, 2: Binance, 3: 币coin ...
  api_name: string
  create_datetime: string
  status: number // 1: 进行中, 其他: 已结束 (根据实际情况调整)
}

const PLATFORM_MAP: Record<number, { name: string; logo: string }> = {
  1: { name: 'OKX', logo: '/exchanges/okx.png' },
  2: { name: 'Binance', logo: '/exchanges/binance.png' },
  3: { name: '币coin', logo: '/exchanges/bicoin.png' },
  4: { name: '热门', logo: '/exchanges/okx.png' } // 示例数据中 trader_platform 是 4
}

const columns: ColumnDef<TaskItem>[] = [
  {
    header: '跟单对象',
    accessorKey: 'uniqueName',
    cell: ({ row }) => {
      const platformInfo = PLATFORM_MAP[row.original.trader_platform] || {
        name: '未知',
        logo: '/exchanges/default.png'
      }

      return (
        <div className='flex items-center gap-2'>
          <div className='bg-muted/50 flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-1.5'>
            <img src={platformInfo.logo} alt={platformInfo.name} className='h-full w-full object-contain' />
          </div>
          <div className='flex flex-col'>
            <span className='font-medium'>{row.getValue('uniqueName')}</span>
            <span className='text-muted-foreground text-xs'>任务ID: {row.original.id}</span>
          </div>
        </div>
      )
    },
    size: 250
  },
  {
    header: 'API 名称',
    accessorKey: 'api_name',
    cell: ({ row }) => <span className='text-muted-foreground'>{row.getValue('api_name')}</span>
  },
  {
    header: '创建时间',
    accessorKey: 'create_datetime',
    cell: ({ row }) => {
      const dateStr = row.getValue('create_datetime') as string

      // 简单格式化时间：替换 T 为空格
      const formattedDate = dateStr ? dateStr.replace('T', ' ') : '-'

      return <span className='text-muted-foreground'>{formattedDate}</span>
    }
  },
  {
    header: '任务状态',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.getValue('status') as number
      const isRunning = status === 1

      return (
        <Badge
          className={cn(
            'rounded-sm border-none focus-visible:outline-none',
            isRunning
              ? 'bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {isRunning ? '进行中' : '已结束'}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    header: () => '操作',
    cell: function Cell({ row }) {
      const router = useRouter()
      const isRunning = row.original.status === 1

      const handleTerminateTask = async () => {
        try {
          console.log('发起终止跟单请求，任务 ID:', row.original.id)
          alert('已发起终止跟单请求')

          // TODO: 更新状态或者重新拉取数据
        } catch (error) {
          console.error('终止请求失败:', error)
          alert('终止请求失败，请重试')
        }
      }

      return (
        <div className='flex items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size={'icon'}
                aria-label='查看详情'
                onClick={() => router.push(`/dashboard/task_list/task_detail/${row.original.id}`)}
              >
                <EyeIcon className='size-4.5 text-blue-600' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>查看详情</p>
            </TooltipContent>
          </Tooltip>
          {isRunning && (
            <AlertDialog>
              <Tooltip>
                <AlertDialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button variant='ghost' size={'icon'} aria-label='终止跟单'>
                      <BanIcon className='text-destructive size-4.5' />
                    </Button>
                  </TooltipTrigger>
                </AlertDialogTrigger>
                <TooltipContent>
                  <p>终止跟单</p>
                </TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认终止跟单？</AlertDialogTitle>
                  <AlertDialogDescription>终止任务不会进行平仓，当前如有持仓，后续请自行平仓。</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleTerminateTask} className='bg-red-500 text-white hover:bg-red-600'>
                    确认终止
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )
    },
    enableHiding: false
  }
]

const TaskDatatable = ({ data }: { data: TaskItem[] }) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

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
              <TableRow key={headerGroup.id} className='h-14 border-t'>
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
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  暂无任务数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col md:max-lg:flex-col'>
        <p className='text-muted-foreground text-sm whitespace-nowrap' aria-live='polite'>
          显示{' '}
          <span>
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} 到{' '}
            {Math.min(
              Math.max(
                table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                  table.getState().pagination.pageSize,
                0
              ),
              table.getRowCount()
            )}
          </span>{' '}
          条，共 <span>{table.getRowCount().toString()}</span> 条数据
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
                  上一页
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
                  下一页
                  <ChevronRightIcon aria-hidden='true' />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

export default TaskDatatable
