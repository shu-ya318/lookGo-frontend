import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { FACILITY_DETAIL_LABELS } from '@/services/metro/types';

import type { ReactNode } from 'react';
import type { FacilityDetailKey } from '@/services/metro/types';
import type { StationDetails } from '@/services/metro/interface';

interface StationFacilityListProps {
  facilities: Pick<StationDetails, FacilityDetailKey>;
  // 無可用設備時顯示的內容，預設不顯示任何內容（含標題）
  emptyFallback?: ReactNode;
}

export function StationFacilityList({
  facilities,
  emptyFallback = null,
}: StationFacilityListProps): React.ReactElement | null {
  const availableFacilities = FACILITY_DETAIL_LABELS.filter(({ key }) => {
    const value = facilities[key];
    return value != null && value !== '';
  });

  if (availableFacilities.length === 0) return <>{emptyFallback}</>;

  return (
    <>
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ display: 'block', mb: 0.75 }}
      >
        站內設施
      </Typography>
      <Stack spacing={0.5}>
        {availableFacilities.map(({ key, label }) => {
          const note = facilities[key] as string;
          return (
            <Stack
              key={key}
              direction='row'
              sx={{
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: 11, flexShrink: 0 }}
              >
                {label}
              </Typography>
              {note.trim() !== '' && (
                <Typography
                  variant='caption'
                  sx={{
                    fontSize: 11,
                    fontWeight: 500,
                    textAlign: 'right',
                    ml: 1,
                  }}
                >
                  {note}
                </Typography>
              )}
            </Stack>
          );
        })}
      </Stack>
    </>
  );
}
