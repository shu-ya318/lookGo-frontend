import { useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

import { logout } from '@/services/auth';

import { useAuthStore } from '@/stores/authStore';

interface HeaderProps {
  onToggle: () => void;
}

export const Header = ({ onToggle }: HeaderProps) => {
  const navigate = useNavigate();

  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    logout();
    clearAuth();
    navigate('/auth/login');
  };

  return (
    <AppBar
      position='fixed'
      sx={{
        height: '4.375rem',
        backgroundColor: 'background.paper',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          width: '100%',
          height: '100%',
          padding: '0 2.375rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <IconButton
              edge='start'
              aria-label='open sidebar'
              sx={{
                color: 'primary.dark',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
              onClick={onToggle}
            >
              <MenuIcon fontSize='small' />
            </IconButton>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 700,
                color: 'primary.dark',
                marginLeft: '.5rem',
                letterSpacing: 1,
                userSelect: 'none'
              }}
            >
              LookGo
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: '8px',
                textTransform: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  color: 'error.main',
                  backgroundColor: 'error.lighter',
                  transform: 'translateY(-1px)'
                },
              }}
            >
              登出
            </Button>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};