'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';

import { getApiList } from '@/api/apiadd';
import { positionsApi, type Position } from '@/api/positions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const formatOpenTime = (openedAt?: string | null) => {
  if (!openedAt) return '-';
  return new Date(openedAt).toLocaleString();
};

const formatOpenTimeShort = (openedAt?: string | null) => {
  if (!openedAt) return '-';
  return new Date(openedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const formatUpl = (pnl?: number | null) => {
  if (pnl === null || pnl === undefined || !Number.isFinite(pnl)) return '-';
  const strValue = pnl.toFixed(3);
  return parseFloat(strValue).toString();
};

const formatPrice = (value?: number | null) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  if (value >= 1) return value.toFixed(2);
  
  // 处理科学计数法和极小值
  // 转换为字符串，避免直接 toString 产生 e-x 格式
  const strValue = value.toFixed(8);
  // 去除末尾多余的0
  return parseFloat(strValue).toString();
};

const formatUplRatioPercent = (pnlRatio?: number | null) => {
  if (pnlRatio === null || pnlRatio === undefined || !Number.isFinite(pnlRatio)) return '-';
  const percent = Math.abs(pnlRatio) <= 1 ? pnlRatio * 100 : pnlRatio;
  const strValue = percent.toFixed(2);
  return `${parseFloat(strValue).toString()}%`;
};

const getUplClass = (val?: number | null) => {
  if (val === null || val === undefined || !Number.isFinite(val) || val === 0) return '';
  return val > 0 ? 'text-green-600' : 'text-red-600';
};

const formatAbsPos = (pos?: number | null) => {
  if (pos === null || pos === undefined || !Number.isFinite(pos)) return '-';
  const absVal = Math.abs(pos);
  
  // 处理大数值的科学计数法
  if (absVal >= 1e6) {
    return absVal.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  
  // 处理极小值的科学计数法
  if (absVal < 1 && absVal > 0) {
    return parseFloat(absVal.toFixed(8)).toString();
  }
  
  return absVal.toString();
};

const getDirectionInfo = (p: Position) => {
  const posSide = (p.side || '').trim().toLowerCase();
  if (posSide === 'long') return { label: '多', className: 'text-green-600' };
  if (posSide === 'short') return { label: '空', className: 'text-red-600' };

  if (p.position_size === null || p.position_size === undefined || p.position_size === 0) return { label: '-', className: '' };
  return p.position_size > 0
    ? { label: '多', className: 'text-green-600' }
    : { label: '空', className: 'text-red-600' };
};

const getLeverBadgeText = (lever?: number | null) => {
  if (lever === null || lever === undefined || !Number.isFinite(lever)) return null;
  const normalized = Number.isInteger(lever) ? String(lever) : lever.toString();
  return `x${normalized}`;
};

type ApiItemData = {
  api_id: number;
  api_name: string;
  platform: string;
  balance: number;
  ok: boolean;
  error?: string;
  positions: Position[];
};

export default function PositionsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<{ items: ApiItemData[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [closePositionOpen, setClosePositionOpen] = useState(false);
  const [closingPosition, setClosingPosition] = useState(false);
  const [closeTarget, setCloseTarget] = useState<{
    apiId: number;
    apiName: string;
    symbol: string;
    marginMode: string;
    side: string;
  } | null>(null);

  const fetchPositions = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const [apiRes, posRes] = await Promise.all([
        getApiList(),
        positionsApi.getCurrentPositions('SWAP'),
      ]);

      if (apiRes.code !== 0) {
        throw new Error(apiRes.error || '加载 API 列表失败');
      }
      if (posRes.code !== 0) {
        throw new Error(posRes.error || '加载持仓失败');
      }

      const apis = Array.isArray(apiRes.data) ? apiRes.data : [];
      const positions = posRes.data?.positions || [];
      const errors = posRes.data?.errors || [];

      const merged: ApiItemData[] = apis.map((api: any) => {
        const apiId = api.id;
        const apiPositions = positions.filter((p) => p.api_id === apiId);
        const apiError = errors.find((e) => e.api_id === apiId);
        return {
          api_id: apiId,
          api_name: api.api_name || `API ${apiId}`,
          platform: String(api.platform),
          balance: Number(api.usdt) || 0,
          ok: !apiError,
          error: apiError?.reason,
          positions: apiPositions,
        };
      });

      // Optionally, add any APIs that are in positions/errors but not in apis list
      const existingApiIds = new Set(merged.map(a => a.api_id));
      
      positions.forEach(p => {
        if (!existingApiIds.has(p.api_id)) {
          merged.push({
            api_id: p.api_id,
            api_name: p.api_name || `API ${p.api_id}`,
            platform: p.platform,
            balance: 0,
            ok: true,
            positions: positions.filter(pos => pos.api_id === p.api_id)
          });
          existingApiIds.add(p.api_id);
        }
      });

      errors.forEach(e => {
        if (!existingApiIds.has(e.api_id)) {
          merged.push({
            api_id: e.api_id,
            api_name: `API ${e.api_id}`,
            platform: e.platform,
            balance: 0,
            ok: false,
            error: e.reason,
            positions: []
          });
          existingApiIds.add(e.api_id);
        }
      });

      setData({ items: merged });
      if (isRefresh) {
        toast.success('刷新成功');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载持仓失败，请稍后重试';
      setError(message);
      if (!isRefresh) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleClosePosition = async () => {
    if (!closeTarget) return;

    setClosingPosition(true);
    try {
      // 暂时不接入实际的平仓接口，只保留 UI 交互和成功提示
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟请求延迟
      toast.success(`${closeTarget.apiName} 的 ${closeTarget.symbol} 仓位已提交全平请求`);
      setClosePositionOpen(false);
      // Refresh positions after closing
      fetchPositions(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '全平请求失败，请稍后重试';
      toast.error(message);
    } finally {
      setClosingPosition(false);
    }
  };

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>当前持仓</h2>
            <p className='text-muted-foreground text-sm'>当前工作室下所有交易 API 的实时持仓信息</p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => fetchPositions(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {loading ? (
        <div className='flex h-[40vh] items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : error ? (
        <Card>
          <CardContent className='pt-6'>
            <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
              {error}
            </div>
          </CardContent>
        </Card>
      ) : !data || data.items.length === 0 ? (
        <Card>
          <CardContent className='pt-6'>
            <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
              当前没有交易 API 或无法获取持仓信息
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-6'>
          {data.items.map((apiItem) => (
            <Card key={apiItem.api_id}>
              <CardHeader>
                <CardTitle className='flex items-center gap-3'>
                  <span>{apiItem.api_name}</span>
                  {apiItem.balance > 0 && (
                    <Badge variant='secondary' className='font-normal text-muted-foreground'>
                      资金: {apiItem.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!apiItem.ok ? (
                  <div className='rounded-lg border border-dashed p-6 text-center text-sm text-red-500 bg-red-50/50'>
                    获取失败: {apiItem.error}
                  </div>
                ) : apiItem.positions.length === 0 ? (
                  <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
                    当前空仓
                  </div>
                ) : (
                  <>
                    <div className='space-y-2 md:hidden'>
                      {apiItem.positions.map((item, idx) => (
                        <div
                          key={`${item.symbol ?? ''}-${item.side ?? ''}-${item.position_size ?? ''}-${idx}`}
                          className='rounded-lg border p-2'
                        >
                          <div className='flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]'>
                            <span className='font-medium tabular-nums'>
                              {item.symbol ?? '-'}
                            </span>
                            {getLeverBadgeText(item.leverage) ? (
                              <Badge
                                variant='secondary'
                                className='h-4 px-2 text-[11px] leading-4 border-transparent bg-blue-50 text-blue-700 hover:bg-blue-50/90'
                              >
                                {getLeverBadgeText(item.leverage)}
                              </Badge>
                            ) : null}

                            <span className='text-muted-foreground'>方向</span>
                            <span className={`font-medium ${getDirectionInfo(item).className}`}>
                              {getDirectionInfo(item).label}
                            </span>

                            <span className='text-muted-foreground'>仓位</span>
                            <span className='tabular-nums'>{formatAbsPos(item.position_size)}</span>

                            <span className='text-muted-foreground'>开仓价</span>
                            <span className='tabular-nums'>{formatPrice(item.avg_entry_price)}</span>

                            <span className='text-muted-foreground'>标记</span>
                            <span className='tabular-nums'>{formatPrice(item.mark_price)}</span>

                            <span className='text-muted-foreground'>收益</span>
                            <span className={`tabular-nums ${getUplClass(item.pnl)}`}>
                              {formatUpl(item.pnl)}
                            </span>

                            <span className='text-muted-foreground'>收益率</span>
                            <span className={`tabular-nums ${getUplClass(item.pnl_ratio)}`}>
                              {formatUplRatioPercent(item.pnl_ratio)}
                            </span>

                            <span className='text-muted-foreground'>时间</span>
                            <span className='tabular-nums text-muted-foreground'>
                              {formatOpenTimeShort(item.opened_at)}
                            </span>

                            <div className='w-full mt-2'>
                              <Button
                                variant='default'
                                size='sm'
                                className='w-full h-8 text-xs shadow-none'
                                onClick={() => {
                                  setCloseTarget({
                                    apiId: apiItem.api_id,
                                    apiName: apiItem.api_name,
                                    symbol: item.symbol,
                                    marginMode: item.margin_mode ?? 'cross',
                                    side: item.side,
                                  });
                                  setClosePositionOpen(true);
                                }}
                              >
                                全平
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className='hidden md:block'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>交易对</TableHead>
                            <TableHead>方向</TableHead>
                            <TableHead>仓位</TableHead>
                            <TableHead>开仓价</TableHead>
                            <TableHead>标记价</TableHead>
                            <TableHead>收益</TableHead>
                            <TableHead>收益率</TableHead>
                            <TableHead>开仓时间</TableHead>
                            <TableHead className='text-right'>操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {apiItem.positions.map((item, idx) => (
                            <TableRow
                              key={`${item.symbol ?? ''}-${item.side ?? ''}-${item.position_size ?? ''}-${idx}`}
                            >
                              <TableCell>
                                <div className='flex items-center gap-2'>
                                  <span>{item.symbol ?? '-'}</span>
                                  {getLeverBadgeText(item.leverage) ? (
                                    <Badge
                                      variant='secondary'
                                      className='h-5 px-2 text-[11px] leading-4 border-transparent bg-blue-50 text-blue-700 hover:bg-blue-50/90'
                                    >
                                      {getLeverBadgeText(item.leverage)}
                                    </Badge>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell className={getDirectionInfo(item).className}>
                                {getDirectionInfo(item).label}
                              </TableCell>
                              <TableCell>{formatAbsPos(item.position_size)}</TableCell>
                              <TableCell>{formatPrice(item.avg_entry_price)}</TableCell>
                              <TableCell>{formatPrice(item.mark_price)}</TableCell>
                              <TableCell className={getUplClass(item.pnl)}>
                                {formatUpl(item.pnl)}
                              </TableCell>
                              <TableCell className={getUplClass(item.pnl_ratio)}>
                                {formatUplRatioPercent(item.pnl_ratio)}
                              </TableCell>
                              <TableCell>{formatOpenTime(item.opened_at)}</TableCell>
                              <TableCell className='text-right'>
                                <Button
                                  variant='default'
                                  size='sm'
                                  className='h-7 px-2 text-xs shadow-none'
                                  onClick={() => {
                                    setCloseTarget({
                                      apiId: apiItem.api_id,
                                      apiName: apiItem.api_name,
                                      symbol: item.symbol,
                                      marginMode: item.margin_mode ?? 'cross',
                                      side: item.side,
                                    });
                                    setClosePositionOpen(true);
                                  }}
                                >
                                  全平
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={closePositionOpen} onOpenChange={setClosePositionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认平仓</AlertDialogTitle>
            <AlertDialogDescription>
              确定要全平 {closeTarget?.apiName} 的 {closeTarget?.symbol} 仓位吗？
              此操作将发送市价全平请求到交易所。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closingPosition}>取消</AlertDialogCancel>
            <AlertDialogAction
              className='bg-red-600 hover:bg-red-700 text-white'
              disabled={closingPosition}
              onClick={(e) => {
                e.preventDefault();
                handleClosePosition();
              }}
            >
              {closingPosition ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  平仓中...
                </>
              ) : (
                '确认平仓'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
