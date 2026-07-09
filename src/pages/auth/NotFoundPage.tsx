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
        查無頁面
      </Typography>
      <Typography variant='body1' gutterBottom>
        您要找的頁面不存在
      </Typography>
      <Button variant='contained' color='primary' onClick={handleBackToHomepage}>
        返回首頁
      </Button>
    </Box>
  );
};

export default NotFoundPage;
