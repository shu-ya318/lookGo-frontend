import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Dialog } from '@/components/Dialog';
import { StationAutocomplete } from '@/components/StationAutocomplete';
import { TripRouteFilterSection } from '@/components/tripPlan/TripRouteFilterSection';
import { RequiredFieldLabel } from '@/components/tripPlan/RequiredFieldLabel';

import { useMetroMapStore } from '@/stores/metroMapStore';

import {
  createTripPlan,
  getAllTripPlanName,
  updateTripPlan,
  updateTripPlanName,
} from '@/services/tripPlan';

import { useTripRouteQuery } from './hooks/useTripRouteQuery';

import type { FareType, RoutingStrategy } from '@/services/metro/types';
import type { StationOption } from '@/services/metro/interface';
import type { TripPlan } from '@/services/tripPlan/interface';
import type { TripRouteFilters } from '@/components/tripPlan/TripRouteFilterSection';

const defaultTripQueryFilters: TripRouteFilters = {
  fare: null,
  routingStrategy: null,
};

interface TripPlanEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripPlan: TripPlan | null;
  onSaved: (tripPlan: TripPlan, isNew: boolean) => void;
}

export const TripPlanEditorDialog = ({
  isOpen,
  onClose,
  tripPlan,
  onSaved,
}: TripPlanEditorDialogProps) => {
  const stationOptions = useMetroMapStore((state) => state.stationOptions);
  const fetchAllStationOption = useMetroMapStore(
    (state) => state.fetchAllStationOption,
  );

  const [tripTitle, setTripTitle] = useState(tripPlan?.name ?? '');
  const [existingNames, setExistingNames] = useState<string[]>([]);

  const [fromStation, setFromStation] = useState<StationOption | null>(null);
  const [toStation, setToStation] = useState<StationOption | null>(null);
  const [tripQueryFilters, setTripQueryFilters] = useState<TripRouteFilters>(
    tripPlan
      ? {
          fare: tripPlan.fareType as FareType,
          routingStrategy: tripPlan.routingStrategy as RoutingStrategy,
        }
      : defaultTripQueryFilters,
  );
  const { tripResult, isSearching } = useTripRouteQuery(
    fromStation,
    toStation,
    tripQueryFilters.fare,
    tripQueryFilters.routingStrategy,
  );

  const [note, setNote] = useState(tripPlan?.notes ?? '');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAllStationOption();
  }, [fetchAllStationOption]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchNames = async () => {
      try {
        const response = await getAllTripPlanName();
        setExistingNames(response);
      } catch {
        setExistingNames([]);
      }
    };

    void fetchNames();
  }, [isOpen]);

  // 如果是編輯模式，依旅程紀錄的車站中文名稱比對出對應的車站選項
  useEffect(() => {
    if (!tripPlan || stationOptions.length === 0) return;

    const fromStationOption =
      stationOptions.find(
        (station) => station.nameZhTw === tripPlan.fromStationNameZhTw,
      ) ?? null;
    const toStationOption =
      stationOptions.find(
        (station) => station.nameZhTw === tripPlan.toStationNameZhTw,
      ) ?? null;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFromStation(fromStationOption);
    setToStation(toStationOption);
  }, [tripPlan, stationOptions]);

  const handleFareChange = (value: FareType | null) => {
    setTripQueryFilters((prev) => ({ ...prev, fare: value }));
  };

  const handleRoutingStrategyChange = (value: RoutingStrategy | null) => {
    setTripQueryFilters((prev) => ({ ...prev, routingStrategy: value }));
  };

  // 依照是否有 tripPlan 判斷執行新增或更新旅程
  const handleSave = async () => {
    if (!tripResult) return;

    setIsSaving(true);

    try {
      if (tripPlan) {
        let updated = tripPlan;

        if (tripTitle.trim() && tripTitle !== tripPlan.name) {
          updated = await updateTripPlanName({
            tripPlanId: tripPlan.id,
            name: tripTitle,
          });
        }

        updated = await updateTripPlan({
          tripPlanId: tripPlan.id,
          fareType: tripResult.fareType,
          farePrice: tripResult.farePrice,
          transferCount: tripResult.transferCount,
          routingStrategy: tripResult.routingStrategy,
          notes: note || undefined,
        });
        enqueueSnackbar('旅程更新成功！', { variant: 'success' });
        onSaved(updated, false);
      } else {
        const created = await createTripPlan({
          name: tripTitle,
          fromStationId: tripResult.fromStationId,
          toStationId: tripResult.toStationId,
          fareType: tripResult.fareType,
          farePrice: tripResult.farePrice,
          transferCount: tripResult.transferCount,
          routingStrategy: tripResult.routingStrategy,
          notes: note || undefined,
        });
        enqueueSnackbar('旅程新增成功！', { variant: 'success' });
        onSaved(created, true);
      }
    } catch (error) {
      enqueueSnackbar((error as string) || '旅程儲存失敗', {
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isEditMode = tripPlan !== null;
  const hasToStation = toStation !== null;

  // 名稱是否與既有旅程重複（排除原名，存回原名視為合法；先 trim、不分大小寫，與後端邏輯一致）
  const trimmedTitle = tripTitle.trim();
  const isDuplicateName =
    trimmedTitle !== '' &&
    (!tripPlan ||
      trimmedTitle.toLowerCase() !== tripPlan.name.trim().toLowerCase()) &&
    existingNames.some(
      (name) => name.trim().toLowerCase() === trimmedTitle.toLowerCase(),
    );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? '編輯旅程' : '新增旅程'}
      width='32rem'
      action={
        <Button
          variant='contained'
          loading={isSaving}
          disabled={!tripResult || !tripTitle.trim() || isDuplicateName}
          onClick={handleSave}
        >
          {isEditMode ? '更新旅程' : '儲存旅程'}
        </Button>
      }
    >
      <Stack sx={{ gap: 2 }}>
        {/* 旅程名稱 */}
        <Stack sx={{ gap: 0.5 }}>
          <RequiredFieldLabel label='旅程名稱' />
          <Typography variant='caption' sx={{ color: 'info.main', mb: 0.5 }}>
            名稱不能與既有的旅程規劃重複
          </Typography>
          <TextField
            value={tripTitle}
            onChange={(event) => setTripTitle(event.target.value)}
            size='small'
            fullWidth
            placeholder='請輸入旅程名稱'
            error={isDuplicateName}
            helperText={isDuplicateName ? '此名稱已存在' : undefined}
          />
        </Stack>
        {/* 起始車站 / 終點車站 */}
        <Stack direction='row' sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Stack sx={{ gap: 0.5 }}>
            <RequiredFieldLabel label='起始車站' disabled={isEditMode} />
            <StationAutocomplete
              value={fromStation}
              onChange={setFromStation}
              disabled={isEditMode}
              sx={{ width: 200 }}
            />
          </Stack>
          <Stack sx={{ gap: 0.5 }}>
            <RequiredFieldLabel label='終點車站' disabled={isEditMode} />
            <StationAutocomplete
              value={toStation}
              onChange={setToStation}
              disabled={isEditMode}
              sx={{ width: 200 }}
            />
          </Stack>
        </Stack>
        {/* 查詢票價與車程時間 */}
        <TripRouteFilterSection
          filters={tripQueryFilters}
          disabled={!hasToStation}
          isSearching={isSearching}
          tripResult={tripResult}
          onFareChange={handleFareChange}
          onRoutingStrategyChange={handleRoutingStrategyChange}
        />
        {/* 筆記（選填 */}
        <Stack sx={{ gap: 0.5 }}>
          <Typography variant='body2' color='text.secondary'>
            筆記
          </Typography>
          <TextField
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            fullWidth
            placeholder='輸入您的旅程筆記...'
            multiline
            sx={{
              '& .MuiInputBase-root': {
                height: '100px',
              },
            }}
          />
        </Stack>
      </Stack>
    </Dialog>
  );
};
