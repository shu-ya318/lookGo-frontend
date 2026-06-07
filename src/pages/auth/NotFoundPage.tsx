import { Box, Typography, Button } from '@mui/material';

const NotFoundPage = () => {
  const handleBackToHomepage = () => {
    window.location.href = '/';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        gap: '32px',
      }}
    >
      <Typography variant='h4' gutterBottom>
        Not Found
      </Typography>
      <Typography variant='body1' gutterBottom>
        The page you are looking for does not exist.
      </Typography>
      <Button variant='contained' color='primary' onClick={handleBackToHomepage}>
        Back to Homepage
      </Button>
    </Box>
  );
};

export default NotFoundPage;
