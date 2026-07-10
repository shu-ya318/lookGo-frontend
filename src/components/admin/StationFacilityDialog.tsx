import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Dialog } from '@/components/Dialog';
import { getStationById } from '@/services/metro';
import { FACILITY_DETAIL_LABELS } from '@/services/metro/types';

import type { Station } from '@/services/metro/interface';

interface StationFacilityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stationId: number | null;
}

export const StationFacilityDialog = ({
  isOpen,
  onClose,
  stationId,
}: StationFacilityDialogProps) => {
  const [station, setStation] = useState<Station | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!isOpen || !stationId) return;

    const fetchStation = async () => {
      setIsFetching(true);

      try {
        const response = await getStationById({ id: stationId });
        setStation(response);
      } catch (error) {
        enqueueSnackbar((error as string) || '取得車站資訊失敗', {
          variant: 'error',
        });
        onClose();
      } finally {
        setIsFetching(false);
      }
    };

    fetchStation();
  }, [isOpen, stationId]);

  const handleClose = () => {
    onClose();
    setStation(null);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={station ? `${station.nameZhTw} 設備資訊` : '設備資訊'}
      width='24rem'
    >
      {isFetching || !station ? (
        <Typography>載入中...</Typography>
      ) : (
        <Stack sx={{ gap: '0.75rem' }}>
          {FACILITY_DETAIL_LABELS.map(({ key, label }) => (
            <Stack
              key={key}
              direction='row'
              sx={{ justifyContent: 'space-between' }}
            >
              <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
              <Typography>{station[key] || '-'}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Dialog>
  );
};
