import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

export const PageLoader = () => {
  return (
    <Stack sx={{ height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress size='3rem' />
    </Stack>
  );
};
