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
        Not Authorized
      </Typography>
      <Typography variant='body1' gutterBottom>
        You do not have permission to access this page.
      </Typography>
      <Button component={Link} to='/' variant='contained' color='primary'>
        Back to Homepage
      </Button>
    </Box>
  );
};

export default NotAuthorizedPage;
