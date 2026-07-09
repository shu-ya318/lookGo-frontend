import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotAuthorizedPage = () => {
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
        權限不足
      </Typography>
      <Typography variant='body1' gutterBottom>
        您沒有足夠權限訪問此頁面
      </Typography>
      <Button component={Link} to='/' variant='contained' color='primary'>
        返回首頁
      </Button>
    </Box>
  );
};

export default NotAuthorizedPage;
