import { Outlet } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import logo from '../assets/logo_transparent.png';

export const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default',
      }}
    >
      {/* Left Block (50% Width) */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          minHeight: { xs: '40vh', md: '100vh' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to right, #007AFF, #2AC769)',
          color: '#FFFFFF',
          p: { xs: 4, sm: 6, md: 8 },
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            maxWidth: '460px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="LookGo Logo"
            sx={{
              width: '100%',
              maxWidth: { xs: '160px', md: '400px' },
              mb: 4,
              height: 'auto',
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1rem', md: '1.5rem' },
              fontWeight: 700,
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            一個可以快速搜尋臺北捷運
            <br />
            並且客製化規劃旅程的平台
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              fontWeight: 400,
              lineHeight: 1.6,
              opacity: 0.85,
            }}
          >
            看完即可出發!
          </Typography>
        </Box>
      </Box>

      {/* Right Block (50% Width) */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          minHeight: { xs: '60vh', md: '100vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: { xs: 3, sm: 6, md: 8 },
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '26rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};


