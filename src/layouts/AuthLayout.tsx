import { Outlet } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { ImageBox } from '@/components/ImageBox';

import logo from '../assets/logo_transparent.png';

export const AuthLayout = () => {
  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'quaternary.main',
        p: 0,
        [theme.breakpoints.up('xs')]: {
          p: { xs: 2, sm: 4, md: 6 },
        },
      })}
    >
      <Box
        sx={(theme) => ({
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: 'quaternary.light',
          borderRadius: '0px',
          overflow: 'hidden',
          [theme.breakpoints.up('xs')]: {
            minHeight: '820px',
            borderRadius: '24px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
          },
        })}
      >
        {/* Left Panel */}
        <Box
          sx={(theme) => ({
            display: 'none',
            [theme.breakpoints.up('xs')]: {
              display: 'flex',
              width: '45%',
            },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to right, #5fa6f0ff, #6de69dff)',
            color: '#FFFFFF',
            p: { xs: 4, sm: 6, md: 8 },
            boxSizing: 'border-box',
            textAlign: 'center',
          })}
        >
          <ImageBox src={logo} alt='logo' width='15rem' height='6.5rem' />
          <Typography
            variant="h5"
            sx={{
              maxWidth: '20rem',
              textAlign: 'left',
              mt: 2,
              mb: 2,
              lineHeight: 1.6,
              letterSpacing: '0.5px',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            }}
          >
            一個快速搜尋臺北捷運資訊和客製化規劃旅程的平台
          </Typography>
          <Typography
            variant="caption"
            sx={{
              maxWidth: '20rem',
              textAlign: 'left',
              letterSpacing: '2px',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
            }}
          >
            立即成為會員，蒐藏更多你最愛的車站、規劃專屬的旅程，並能和管理員及時互動!
          </Typography>
        </Box>
        {/* Right Panel */}
        <Box
          sx={(theme) => ({
            width: '100%',
            [theme.breakpoints.up('xs')]: {
              width: '55%',
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, sm: 6, md: 8 },
            boxSizing: 'border-box',
            backgroundColor: '#FFFFFF',
          })}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '26rem',
              minHeight: '34rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};


