import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { PositionedLine } from './computeLayout';

interface Props {
  lines: PositionedLine[];
}

function normalize(raw: string): string {
  return raw.startsWith('#') ? raw : `#${raw}`;
}

export function MetroMapLegend({ lines }: Props): React.ReactElement {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        p: 1.5,
        borderRadius: 2,
        minWidth: 160,
        zIndex: 10,
      }}
    >
      <Typography variant='caption' sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
        路線圖例
      </Typography>
      <Stack spacing={0.75}>
        {lines.map((line) => (
          <Stack key={line.letter} direction='row' alignItems='center' spacing={1}>
            <Box
              sx={{
                width: 28,
                height: 10,
                borderRadius: 1,
                flexShrink: 0,
                backgroundColor: normalize(line.color),
              }}
            />
            <Box>
              <Typography variant='caption' sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                {line.nameZhTw}
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: 10, lineHeight: 1.2 }}>
                {line.nameEn}
              </Typography>
            </Box>
          </Stack>
        ))}

        {/* 圖示說明 */}
        <Box sx={{ pt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction='row' alignItems='center' spacing={0.75}>
            <svg width={18} height={18}>
              <circle cx={9} cy={9} r={5} fill='#666' />
            </svg>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              一般站
            </Typography>
          </Stack>
          <Stack direction='row' alignItems='center' spacing={0.75} sx={{ mt: 0.5 }}>
            <svg width={18} height={18}>
              <circle cx={9} cy={9} r={6} fill='#fff' stroke='#666' strokeWidth={2.5} />
            </svg>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              轉乘站
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
