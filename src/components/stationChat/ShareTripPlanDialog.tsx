import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { Dialog } from '@/components/Dialog';

import { getAllTripPlanName, getTripPlan } from '@/services/tripPlan';

import type { TripPlan } from '@/services/tripPlan/interface';

interface ShareTripPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (tripPlan: TripPlan) => void;
}

export const ShareTripPlanDialog = ({
  isOpen,
  onClose,
  onShare,
}: ShareTripPlanDialogProps) => {
  const [tripPlanNames, setTripPlanNames] = useState<string[]>([]);
  const [isTripPlanNamesLoading, setIsTripPlanNamesLoading] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const fetchTripPlanNames = async () => {
      setIsTripPlanNamesLoading(true);

      try {
        const response = await getAllTripPlanName();
        if (isMounted) setTripPlanNames(response);
      } catch (error) {
        if (isMounted) {
          enqueueSnackbar((error as string) || '取得旅程名稱失敗', {
            variant: 'error',
          });
        }
      } finally {
        if (isMounted) setIsTripPlanNamesLoading(false);
      }
    };

    fetchTripPlanNames();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleShare = async () => {
    if (!selectedName) return;

    setIsSharing(true);

    try {
      const response = await getTripPlan({ keyword: selectedName });
      onShare(response);
    } catch (error) {
      enqueueSnackbar((error as string) || '取得旅程資料失敗', {
        variant: 'error',
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title='分享旅程規劃'
      width='24rem'
      action={
        <Button
          variant='contained'
          loading={isSharing}
          disabled={!selectedName}
          onClick={handleShare}
        >
          確定分享
        </Button>
      }
    >
      <Autocomplete
        value={selectedName}
        onChange={(_event, newValue) => setSelectedName(newValue)}
        options={tripPlanNames}
        loading={isTripPlanNamesLoading}
        size='small'
        noOptionsText='尚無旅程規劃'
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder='請輸入或選擇旅程名稱'
            size='small'
          />
        )}
      />
    </Dialog>
  );
};
