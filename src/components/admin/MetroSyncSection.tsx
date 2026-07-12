import { useCallback, useEffect, useRef, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { enqueueSnackbar } from 'notistack';

import {
  getStationFareSyncStatus,
  syncAllLine,
  syncAllLineStation,
  syncAllLineStationCumulativeTime,
  syncAllLineTransfer,
  syncAllStation,
  syncAllStationFare,
} from '@/services/metroSync';

import type { ApiResponse } from '@/services/common/interface';
import type { StationFareSyncStatus } from '@/services/metroSync/interface';

type MetroSyncKey =
  | 'line'
  | 'lineTransfer'
  | 'station'
  | 'lineStation'
  | 'lineStationCumulativeTime'
  | 'stationFare';

// 票價項目為背景同步（202 + 輪詢），與其他五項的同步請求模式不同
const STATION_FARE_KEY: MetroSyncKey = 'stationFare';

// 每 30 秒輪詢一次同步狀態
const POLLING_INTERVAL_MS = 30 * 1000;

// 連續輪詢失敗達此次數（≈90 秒）才停止並提示，容忍短暫網路抖動
const MAX_POLLING_FAILURE_COUNT = 3;

const metroSyncItems: {
  key: MetroSyncKey;
  label: string;
  note?: string;
  sync?: () => Promise<ApiResponse>;
}[] = [
  { key: 'line', label: '路線', sync: syncAllLine },
  { key: 'lineTransfer', label: '路線換乘', sync: syncAllLineTransfer },
  { key: 'station', label: '車站', sync: syncAllStation },
  { key: 'lineStation', label: '路線車站', sync: syncAllLineStation },
  {
    key: 'lineStationCumulativeTime',
    label: '路線車站累計行駛時間',
    sync: syncAllLineStationCumulativeTime,
  },
  {
    key: 'stationFare',
    label: '票價',
    note: '背景同步約需數分鐘，期間可離開此頁',
  },
];

// 被中止的請求（元件卸載 / 登出）經 api interceptor 轉為字串 'Canceled'
const isCanceledError = (error: unknown): boolean => error === 'Canceled';

export const MetroSyncSection = () => {
  const [syncingKey, setSyncingKey] = useState<MetroSyncKey | null>(null);
  const [fareSyncStatus, setFareSyncStatus] =
    useState<StationFareSyncStatus | null>(null);

  const pollingIntervalRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const failureCountRef = useRef(0);

  const isFareRunning = fareSyncStatus?.status === 'RUNNING';

  const syncingLabel = metroSyncItems.find(
    (item) => item.key === syncingKey,
  )?.label;

  // 停止輪詢：清除計時器並中止進行中的請求
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current !== null) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    abortRef.current?.abort();
    abortRef.current = null;
    failureCountRef.current = 0;
  }, []);

  // 單次輪詢：查詢狀態並依結果更新畫面或停止
  const pollStatus = useCallback(async () => {
    try {
      const status = await getStationFareSyncStatus(abortRef.current?.signal);
      failureCountRef.current = 0;
      setFareSyncStatus(status);

      if (status.status === 'SUCCESS') {
        stopPolling();
        enqueueSnackbar(status.message || '票價資料同步成功！', {
          variant: 'success',
        });
      } else if (status.status === 'FAILED') {
        stopPolling();
        enqueueSnackbar(status.message || '票價資料同步失敗！', {
          variant: 'error',
        });
      } else if (status.status === 'IDLE') {
        stopPolling();
      }
    } catch (error) {
      if (isCanceledError(error)) return;

      failureCountRef.current += 1;
      if (failureCountRef.current >= MAX_POLLING_FAILURE_COUNT) {
        stopPolling();
        setFareSyncStatus(null);
        enqueueSnackbar('無法取得同步狀態，請重新整理後再試', {
          variant: 'error',
        });
      }
    }
  }, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    abortRef.current = new AbortController();
    failureCountRef.current = 0;

    void pollStatus();
    pollingIntervalRef.current = window.setInterval(() => {
      void pollStatus();
    }, POLLING_INTERVAL_MS);
  }, [pollStatus, stopPolling]);

  // 票價：觸發背景同步 → 顯示已開始 → 進入輪詢
  const handleFareSync = async () => {
    try {
      const response = await syncAllStationFare();
      enqueueSnackbar(response.successMessage || '已開始背景同步票價資料', {
        variant: 'success',
      });
    } catch (error) {
      if (isCanceledError(error)) return;

      const response = await getStationFareSyncStatus();
      if (response.status === 'RUNNING') {
        setFareSyncStatus(response);
        startPolling();
        return;
      }

      enqueueSnackbar((error as string) || '票價同步觸發失敗！', {
        variant: 'error',
      });
    }

    startPolling();
  };

  const handleSync = async (item: (typeof metroSyncItems)[number]) => {
    if (!item.sync) return;

    setSyncingKey(item.key);

    try {
      const response = await item.sync();
      enqueueSnackbar(response.successMessage || `${item.label}同步成功！`, {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar((error as string) || `${item.label}同步失敗！`, {
        variant: 'error',
      });
    } finally {
      setSyncingKey(null);
    }
  };

  // 進頁時查一次狀態，若正在同步中則接手輪詢（重新整理 / 重登後可續顯示進度）
  useEffect(() => {
    const controller = new AbortController();

    const fetchStatus = async () => {
      try {
        const response = await getStationFareSyncStatus(controller.signal);
        if (response.status === 'RUNNING') {
          setFareSyncStatus(response);
          startPolling();
        }
      } catch {
        // 進頁時的狀態查詢失敗不干擾使用者
      }
    };

    void fetchStatus();

    return () => {
      controller.abort();
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  // beforeunload 警告僅保留給其他五項的同步請求；票價為背景同步，可離開此頁
  useEffect(() => {
    if (!syncingKey) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncingKey]);

  return (
    <Stack sx={{ gap: '0.625rem' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
        捷運資訊同步
      </Typography>
      {syncingKey && (
        <Alert severity='warning' sx={{ maxWidth: '33.375rem' }}>
          正在同步「{syncingLabel}」，同步完成前請勿關閉或重新整理分頁
        </Alert>
      )}
      <Stack sx={{ gap: '1.125rem', maxWidth: '33.375rem' }}>
        {metroSyncItems.map((item) => {
          const isFareItem = item.key === STATION_FARE_KEY;

          return (
            <Stack key={item.key} sx={{ gap: '0.5rem' }}>
              <Stack
                direction='row'
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Stack>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {item.label}
                  </Typography>
                  {item.note && (
                    <Typography
                      variant='caption'
                      sx={{ color: 'text.disabled' }}
                    >
                      {item.note}
                    </Typography>
                  )}
                </Stack>
                {isFareItem ? (
                  <Button
                    variant='outlined'
                    size='small'
                    loading={isFareRunning}
                    disabled={syncingKey !== null}
                    onClick={handleFareSync}
                  >
                    同步
                  </Button>
                ) : (
                  <Button
                    variant='outlined'
                    size='small'
                    loading={syncingKey === item.key}
                    disabled={
                      (syncingKey !== null && syncingKey !== item.key) ||
                      isFareRunning
                    }
                    onClick={() => handleSync(item)}
                  >
                    同步
                  </Button>
                )}
              </Stack>
              {isFareItem && isFareRunning && (
                <Stack sx={{ gap: '0.25rem' }}>
                  <Typography
                    variant='caption'
                    sx={{ color: 'text.secondary' }}
                  >
                    {fareSyncStatus?.message ||
                      `同步中…（${fareSyncStatus?.progressPercentage ?? 0}%）`}
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={fareSyncStatus?.progressPercentage ?? 0}
                  />
                </Stack>
              )}
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};
