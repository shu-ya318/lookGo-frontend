import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { StationAutocomplete } from '@/components/StationAutocomplete';

import type { StationOption } from '@/services/metro/interface';

interface LabeledStationFieldProps {
    label: string;
    value: StationOption | null;
    onChange: (station: StationOption | null) => void;
    disabled?: boolean;
    width?: number | string;
    controlHeight?: string;
}

export const LabeledStationField = ({
    label,
    value,
    onChange,
    disabled = false,
    width = 200,
    controlHeight,
}: LabeledStationFieldProps) => (
    <Stack direction='row' sx={{ alignItems: 'center', gap: 1 }}>
        <Typography
            variant='body2'
            sx={{ color: 'primary.contrastText', flexShrink: 0 }}
        >
            {label}
        </Typography>
        <StationAutocomplete
            value={value}
            onChange={onChange}
            disabled={disabled}
            sx={{
                width,
                '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    ...(controlHeight && { height: controlHeight }),
                },
            }}
        />
    </Stack>
);
