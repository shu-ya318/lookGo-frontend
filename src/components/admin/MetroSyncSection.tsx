import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { enqueueSnackbar } from 'notistack';

import {
  syncAllLine,
  syncAllLineStation,
  syncAllLineStationCumulativeTime,
  syncAllLineTransfer,
  syncAllStation,
  syncAllStationFare,
} from '@/services/metroSync';

import type { ApiResponse } from '@/services/common/interface';

type MetroSyncKey =
  | 'line'
  | 'lineTransfer'
  | 'station'
  | 'lineStation'
  | 'lineStationCumulativeTime'
  | 'stationFare';

const metroSyncItems: {
  key: MetroSyncKey;
  label: string;
  note?: string;
  sync: () => Promise<ApiResponse>;
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
    note: '同步時間較長，請耐心等候',
    sync: syncAllStationFare,
  },
];

export const MetroSyncSection = () => {
  const [syncingKey, setSyncingKey] = useState<MetroSyncKey | null>(null);

  const syncingLabel = metroSyncItems.find(
    (item) => item.key === syncingKey
  )?.label;

  const handleSync = async (item: (typeof metroSyncItems)[number]) => {
    setSyncingKey(item.key);
    try {
      const { successMessage } = await item.sync();
      enqueueSnackbar(successMessage || `${item.label}同步成功！`, {
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

  useEffect(() => {
    if (!syncingKey) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () =>
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
        {metroSyncItems.map((item) => (
          <Stack
            key={item.key}
            direction='row'
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Stack>
              <Typography sx={{ color: 'text.secondary' }}>
                {item.label}
              </Typography>
              {item.note && (
                <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                  {item.note}
                </Typography>
              )}
            </Stack>
            <Button
              variant='outlined'
              size='small'
              loading={syncingKey === item.key}
              disabled={syncingKey !== null && syncingKey !== item.key}
              onClick={() => handleSync(item)}
            >
              同步
            </Button>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
