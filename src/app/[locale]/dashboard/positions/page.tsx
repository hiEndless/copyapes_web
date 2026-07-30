'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, LockIcon, RefreshCw } from 'lucide-react';

import { getApiList } from '@/api/apiadd';
import { orderApi } from '@/api/order';
import { positionsApi, type Position } from '@/api/positions';
import type { EntitlementProfileResponse } from '@/api/settings';
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

  // Avoid scientific notation for tiny values
  const strValue = value.toFixed(8);
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

  if (absVal >= 1e6) {
    return absVal.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  if (absVal < 1 && absVal > 0) {
    return parseFloat(absVal.toFixed(8)).toString();
  }

  return absVal.toString();
};

const getDirectionInfo = (
  p: Position,
  labels: { long: string; short: string },
) => {
  const posSide = (p.side || '').trim().toLowerCase();
  if (posSide === 'long') return { label: labels.long, className: 'text-green-600' };
  if (posSide === 'short') return { label: labels.short, className: 'text-red-600' };

  if (p.position_size === null || p.position_size === undefined || p.position_size === 0) {
    return { label: '-', className: '' };
  }
  return p.position_size > 0
    ? { label: labels.long, className: 'text-green-600' }
    : { label: labels.short, className: 'text-red-600' };
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
  is_readonly: boolean;
};

const isTradingApi = (api: { is_readonly?: boolean | number | string | null }) =>
  api.is_readonly === false;

export default function PositionsPage() {
  const t = useTranslations('DashboardPositions');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<{ items: ApiItemData[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStudioVip, setIsStudioVip] = useState(false);

  const [closePositionOpen, setClosePositionOpen] = useState(false);
  const [closingPosition, setClosingPosition] = useState(false);
  const [closeTarget, setCloseTarget] = useState<{
    apiId: number;
    apiName: string;
    symbol: string;
    marginMode: string;
    side: string;
    quantity?: number;
  } | null>(null);

  const directionLabels = { long: t('page.long'), short: t('page.short') };

  useEffect(() => {
    const syncEntitlementProfile = () => {
      try {
        const stored = localStorage.getItem('entitlementProfile');

        if (!stored) {
          setIsStudioVip(false);

          return;
        }

        const profile = JSON.parse(stored) as EntitlementProfileResponse;

        setIsStudioVip(Boolean(profile?.is_studio_vip));
      } catch (error) {
        console.error('Failed to parse entitlement profile:', error);
        setIsStudioVip(false);
      }
    };

    syncEntitlementProfile();
    window.addEventListener('entitlementProfileUpdated', syncEntitlementProfile);

    return () => {
      window.removeEventListener('entitlementProfileUpdated', syncEntitlementProfile);
    };
  }, []);

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
        throw new Error(apiRes.error || t('toast.loadApiFailed'));
      }
      if (posRes.code !== 0) {
        throw new Error(posRes.error || t('toast.loadPosFailed'));
      }

      const apis = Array.isArray(apiRes.data) ? apiRes.data : [];
      const tradingApis = apis.filter(isTradingApi);
      const tradingApiIds = new Set(tradingApis.map((api: { id: number }) => api.id));
      const positions = (posRes.data?.positions || []).filter((p) => tradingApiIds.has(p.api_id));
      const errors = (posRes.data?.errors || []).filter((e) => tradingApiIds.has(e.api_id));

      const merged: ApiItemData[] = tradingApis.map((api: any) => {
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
          is_readonly: false,
        };
      });

      setData({ items: merged });
      if (isRefresh) {
        toast.success(t('toast.refreshOk'));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('toast.loadPosRetry');
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
      const res = await orderApi.closeSymbol({
        api_id: closeTarget.apiId,
        symbol: closeTarget.symbol,
        pos_side: closeTarget.side,
        mgn_mode: closeTarget.marginMode,
        quantity: closeTarget.quantity,
      });

      if (res.code !== 0) {
        throw new Error(res.error || t('toast.closeFailed'));
      }

      toast.success(
        t('toast.closeSubmitted', {
          api: closeTarget.apiName,
          symbol: closeTarget.symbol,
        }),
      );
      setClosePositionOpen(false);
      fetchPositions(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('toast.closeRetry');
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
            <h2 className='text-2xl font-bold tracking-tight'>{t('page.title')}</h2>
            <p className='text-muted-foreground text-sm'>{t('page.subtitle')}</p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => fetchPositions(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('page.refresh')}
          </Button>
        </div>
      </div>

      <div className='relative'>
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
                {t('page.empty')}
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
                        {t('page.balance', {
                          amount: apiItem.balance.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }),
                        })}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!apiItem.ok ? (
                    <div className='rounded-lg border border-dashed bg-red-50/50 p-6 text-center text-sm text-red-500'>
                      {t('page.fetchError', { error: apiItem.error ?? '' })}
                    </div>
                  ) : apiItem.positions.length === 0 ? (
                    <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
                      {t('page.flat')}
                    </div>
                  ) : (
                    <>
                      <div className='space-y-2 md:hidden'>
                        {apiItem.positions.map((item, idx) => {
                          const direction = getDirectionInfo(item, directionLabels);

                          return (
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
                                    className='h-4 border-transparent bg-blue-50 px-2 text-[11px] leading-4 text-blue-700 hover:bg-blue-50/90'
                                  >
                                    {getLeverBadgeText(item.leverage)}
                                  </Badge>
                                ) : null}

                                <span className='text-muted-foreground'>{t('fields.side')}</span>
                                <span className={`font-medium ${direction.className}`}>
                                  {direction.label}
                                </span>

                                <span className='text-muted-foreground'>{t('fields.size')}</span>
                                <span className='tabular-nums'>{formatAbsPos(item.position_size)}</span>

                                <span className='text-muted-foreground'>{t('fields.entry')}</span>
                                <span className='tabular-nums'>{formatPrice(item.avg_entry_price)}</span>

                                <span className='text-muted-foreground'>{t('fields.mark')}</span>
                                <span className='tabular-nums'>{formatPrice(item.mark_price)}</span>

                                <span className='text-muted-foreground'>{t('fields.pnl')}</span>
                                <span className={`tabular-nums ${getUplClass(item.pnl)}`}>
                                  {formatUpl(item.pnl)}
                                </span>

                                <span className='text-muted-foreground'>{t('fields.pnlRate')}</span>
                                <span className={`tabular-nums ${getUplClass(item.pnl_ratio)}`}>
                                  {formatUplRatioPercent(item.pnl_ratio)}
                                </span>

                                <span className='text-muted-foreground'>{t('fields.time')}</span>
                                <span className='tabular-nums text-muted-foreground'>
                                  {formatOpenTimeShort(item.opened_at)}
                                </span>

                                {apiItem.is_readonly === false ? (
                                  <div className='mt-2 w-full'>
                                    <Button
                                      variant='default'
                                      size='sm'
                                      className='h-8 w-full text-xs shadow-none'
                                      onClick={() => {
                                        setCloseTarget({
                                          apiId: apiItem.api_id,
                                          apiName: apiItem.api_name,
                                          symbol: item.symbol,
                                          marginMode: item.margin_mode ?? 'cross',
                                          side: item.side,
                                          quantity: item.position_size
                                            ? Math.abs(item.position_size)
                                            : undefined,
                                        });
                                        setClosePositionOpen(true);
                                      }}
                                    >
                                      {t('fields.closeAll')}
                                    </Button>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className='hidden md:block'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('fields.symbol')}</TableHead>
                              <TableHead>{t('fields.side')}</TableHead>
                              <TableHead>{t('fields.size')}</TableHead>
                              <TableHead>{t('fields.entry')}</TableHead>
                              <TableHead>{t('fields.markPrice')}</TableHead>
                              <TableHead>{t('fields.pnl')}</TableHead>
                              <TableHead>{t('fields.pnlRate')}</TableHead>
                              <TableHead>{t('fields.openTime')}</TableHead>
                              <TableHead className='text-right'>{t('fields.actions')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {apiItem.positions.map((item, idx) => {
                              const direction = getDirectionInfo(item, directionLabels);

                              return (
                                <TableRow
                                  key={`${item.symbol ?? ''}-${item.side ?? ''}-${item.position_size ?? ''}-${idx}`}
                                >
                                  <TableCell>
                                    <div className='flex items-center gap-2'>
                                      <span>{item.symbol ?? '-'}</span>
                                      {getLeverBadgeText(item.leverage) ? (
                                        <Badge
                                          variant='secondary'
                                          className='h-5 border-transparent bg-blue-50 px-2 text-[11px] leading-4 text-blue-700 hover:bg-blue-50/90'
                                        >
                                          {getLeverBadgeText(item.leverage)}
                                        </Badge>
                                      ) : null}
                                    </div>
                                  </TableCell>
                                  <TableCell className={direction.className}>
                                    {direction.label}
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
                                    {apiItem.is_readonly === false ? (
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
                                            quantity: item.position_size
                                              ? Math.abs(item.position_size)
                                              : undefined,
                                          });
                                          setClosePositionOpen(true);
                                        }}
                                      >
                                        {t('fields.closeAll')}
                                      </Button>
                                    ) : null}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
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

        {!loading && !isStudioVip && (
          <div className='absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/45 backdrop-blur-sm'>
            <div className='inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-3 py-1 text-xs font-medium text-foreground shadow-sm'>
              <LockIcon className='h-3.5 w-3.5' />
              {t('page.studioVipOnly')}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={closePositionOpen} onOpenChange={setClosePositionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {closeTarget
                ? t('dialog.desc', {
                    api: closeTarget.apiName,
                    symbol: closeTarget.symbol,
                  })
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closingPosition}>{t('dialog.cancel')}</AlertDialogCancel>
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
                  {t('dialog.closing')}
                </>
              ) : (
                t('dialog.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
