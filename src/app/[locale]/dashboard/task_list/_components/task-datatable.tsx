'use client'

import { useState } from 'react'

import {
  EyeIcon,
  BanIcon,
  CopyIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Flame,
  Unplug
} from 'lucide-react'
import type { ColumnDef, ColumnFiltersState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { toast } from 'sonner'

import { useRouter } from '@/i18n/routing'
import { stopTask } from '@/api/task'

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
import { CopyTaskConfigSheet } from '../../add_task/_components/copy-task-config-sheet'

import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'

export type TaskItem = {
  id: number
  uniqueName: string
  label?: string
  trader_platform: number // 1: OKX, 2: Binance, 3: 币coin ...
  api_name: string
  create_datetime: string
  status: number // 1: 进行中, 2: 已结束
  posSide_set?: number
  lever_set?: number
  role_type?: number
  follow_type?: number
  flag?: string | number
  pnl?: string | number
}

const PLATFORM_MAP: Record<number, { name: string; logo: string | React.ReactNode }> = {
  1: { name: 'OKX', logo: '/exchanges/okx.png' },
  2: { name: 'Binance', logo: '/exchanges/binance.png' },
  3: { name: '币coin', logo: '/exchanges/bicoin.png' },
  4: { name: '热门', logo: <Flame className='text-orange-500 h-full w-full' /> },
  5: { name: 'Binance API', logo: <Unplug className='text-blue-500 h-full w-full p-0.5' /> },
  6: { name: 'OKX API', logo: <Unplug className='text-blue-500 h-full w-full p-0.5' /> },
  7: { name: 'Binance Cookie', logo: '/exchanges/binance.png' },
  8: { name: 'OKX Cookie', logo: '/exchanges/okx.png' },
  9: { name: 'NOF1 / AI模型', logo: '/exchanges/default.png' }, // TODO: 更新 logo
  10: { name: 'Hyperliquid', logo: '/exchanges/hlq_logo.png' }
}

const getRoleTypeLabel = (platform: number, roleType?: number | string) => {
  if (!roleType) return null
  const rt = String(roleType)

  if (platform === 1 || platform === 8) {
    // OKX 系列
    if (rt === '1') return '合约带单'
    if (rt === '2') return '个人概况'
  } else if (platform === 2 || platform === 5 || platform === 7) {
    // Binance 系列
    if (rt === '1') return '公开带单'
    if (rt === '2') return '隐藏带单'
    if (rt === '3') return '聪明钱'
  } else if (platform === 3) {
    // 币coin
    if (rt === '1') return '操作记录'
    if (rt === '2') return '合约仓位'
  }

  return null
}

const getColumns = (onRefresh?: () => void): ColumnDef<TaskItem>[] => [
  {
    header: '跟单对象',
    accessorKey: 'uniqueName',
    cell: ({ row }) => {
      const platformInfo = PLATFORM_MAP[row.original.trader_platform] || {
        name: '未知',
        logo: '/exchanges/default.png'
      }

      const roleTypeLabel = getRoleTypeLabel(row.original.trader_platform, row.original.role_type)

      return (
        <div className='flex items-center gap-2'>
          <div className='bg-muted/50 flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-1.5'>
            {typeof platformInfo.logo === 'string' ? (
              <img src={platformInfo.logo} alt={platformInfo.name} className='h-full w-full object-contain' />
            ) : (
              platformInfo.logo
            )}
          </div>
          <div className='flex flex-col'>
            <span className='font-medium max-w-[200px] break-words whitespace-normal leading-snug'>
              {(row.original.label || '').trim() || (row.getValue('uniqueName') as string)}
            </span>
            <div className='mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground'>
              <span>任务ID: {row.original.id}</span>
              {roleTypeLabel && (
                <span className='bg-primary/10 text-primary rounded-[2px] px-1 py-0.5 scale-90 origin-left'>
                  {roleTypeLabel}
                </span>
              )}
              {row.original.posSide_set === 2 && (
                <span className='bg-red-500 text-white rounded-[2px] px-1 py-0.5 scale-90 origin-left'>反</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    size: 250
  },
  {
    header: 'API 名称',
    accessorKey: 'api_name',
    cell: ({ row }) => {
      const flag = row.original.flag
      const isPrimary = String(flag) === '1'
      const apiName = row.getValue('api_name') as string

      return (
        <Badge
          className={cn(
            'rounded-sm border-none focus-visible:outline-none',
            isPrimary
              ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400'
              : 'bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400'
          )}
        >
          {apiName && apiName.length > 6 ? apiName.slice(0, 6) + '...' : apiName}
        </Badge>
      )
    }
  },
  {
    header: '创建时间',
    accessorKey: 'create_datetime',
    cell: ({ row }) => {
      const dateStr = row.getValue('create_datetime') as string
      let formattedDate = '-'

      if (dateStr) {
        formattedDate = dateStr.replace('T', '  ').substring(2, 20).replace(/-/g, '/')
      }

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
      const [isConfigOpen, setIsConfigOpen] = useState(false)

      const handleTerminateTask = async () => {
        try {
          const res = await stopTask(row.original.id)

          if (res.code === 0) {
            toast.success('终止跟单成功')
            onRefresh?.()
          } else {
            toast.error(res.error || '终止跟单失败')
          }
        } catch (error) {
          console.error('终止请求失败:', error)
          toast.error('终止请求失败，请重试')
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
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('current_task', JSON.stringify(row.original))
                  }

                  router.push(`/dashboard/task_list/task_detail/${row.original.id}` as any)
                }}
              >
                <EyeIcon className='size-4.5 text-blue-600' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>查看详情</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size={'icon'}
                aria-label='复制任务'
                onClick={() => setIsConfigOpen(true)}
              >
                <CopyIcon className='size-4.5 text-orange-500' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>复制任务</p>
            </TooltipContent>
          </Tooltip>

          <CopyTaskConfigSheet
            isOpen={isConfigOpen}
            onClose={() => setIsConfigOpen(false)}
            traderId={row.original.uniqueName}
            traderName={(row.original.label || '').trim() || row.original.uniqueName}
            platform={PLATFORM_MAP[row.original.trader_platform]?.name?.toLowerCase() || 'okx'}
            traderPlatform={row.original.trader_platform}
            roleType={String(row.original.role_type || 1)}
            initialTaskData={row.original}
          />

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

const TaskDatatable = ({
  data,
  loading = false,
  currentPage = 1,
  pageSize = 10,
  total = 0,
  hasNextPage = false,
  onPrevPage,
  onNextPage,
  onJumpPage,
  onRefresh
}: {
  data: TaskItem[]
  loading?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
  hasNextPage?: boolean
  onPrevPage?: () => void
  onNextPage?: () => void
  onJumpPage?: (page: number) => void
  onRefresh?: () => void
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = getColumns(onRefresh)

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableSortingRemoval: false
  })

  const totalPages = Math.max(1, Math.ceil(Math.max(total, 0) / Math.max(pageSize, 1)))

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
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
            {total > 0 ? (currentPage - 1) * pageSize + 1 : 0} 到 {Math.min(currentPage * pageSize, total)}
          </span>{' '}
          条，共 <span>{total.toString()}</span> 条数据
        </p>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  className='disabled:pointer-events-none disabled:opacity-50'
                  variant={'ghost'}
                  onClick={onPrevPage}
                  disabled={loading || currentPage <= 1}
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
                const isActive = page === currentPage

                return (
                  <PaginationItem key={page}>
                    <Button
                      size='icon'
                      className={`${!isActive && 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'}`}
                      onClick={() => onJumpPage?.(page)}
                      disabled={loading || isActive}
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
                  onClick={onNextPage}
                  disabled={loading || (!hasNextPage && currentPage >= totalPages)}
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
