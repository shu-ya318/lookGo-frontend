import { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import TrainOutlinedIcon from '@mui/icons-material/TrainOutlined';
import Button from '@mui/material/Button';

import { ImageBox } from '../ImageBox';
import { UserProfileMenu } from './UserProfileMenu';

import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';

import { logout } from '@/services/auth';

import logo from '@/assets/logo_transparent.png';
import { enqueueSnackbar } from 'notistack';

interface HeaderProps {
  onToggle: () => void;
}

export const Header = ({ onToggle }: HeaderProps) => {
  const navigate = useNavigate();

  const { userInfo } = useUserStore();
  const isAdmin = userInfo?.role === 'ADMIN';

  const userProfileMenuItem = useMemo(
    () => [
      {
        icon: <PersonOutlinedIcon fontSize='small' sx={{ color: 'primary.dark' }} />,
        text: '設定',
        props: {
          component: NavLink,
          to: `/user-setting`,  // /${userInfo?.id}
        },
      },
      {
        icon: <LogoutOutlinedIcon fontSize='small' sx={{ color: 'primary.dark' }} />,
        text: '登出',
        action: async () => {
          try {
            await logout();
            useAuthStore.getState().clearAuth();
            navigate('/auth/login');
            enqueueSnackbar('登出成功!', { variant: 'success' });
          } catch (error) {
            enqueueSnackbar(error as string, { variant: 'error' });
          }
        },
      },
    ],
    [userInfo, navigate]
  );

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
          maxWidth: '1280px',
          height: '100%',
          margin: '0 auto',
        }}
      >
        {/* Menu */}
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* LeftMenu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            {/* MenuButton */}
            <IconButton
              edge='start'
              aria-label='open sidebar'
              sx={{
                color: 'primary.dark',
                display: { xs: 'inline-flex', md: 'none' },
                '&:hover': { backgroundColor: 'action.hover' }
              }}
              onClick={onToggle}
            >
              <MenuIcon fontSize='small' />
            </IconButton>
            {/* Logo */}
            <NavLink to={'/'} style={{ textDecoration: 'none', marginRight: '.25rem' }}>
              <ImageBox
                width='5.25rem'
                height='1.1875rem'
                src={logo}
                alt='logo'
                objectFit='cover'

              />
            </NavLink>
            {/* Navigation Buttons */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', ml: 3 }}>
              {[
                {
                  to: '/network-map', icon: <MapOutlinedIcon />,
                  label: '路網圖查詢'
                },
                {
                  to: '/station-bookmark', icon: <BookmarkBorderIcon />,
                  label: '車站書籤'
                },
                {
                  to: '/trip-planner', icon: <RouteOutlinedIcon />,
                  label: '旅程規劃'
                },
                {
                  to: '/station-chat-room', icon: <ChatBubbleOutlineOutlined />,
                  label: '車站聊天室'
                },
                ...(isAdmin ? [
                  {
                    to: '/admin/user-management', icon: <PeopleOutlinedIcon />,
                    label: '使用者管理'
                  },
                  {
                    to: '/admin/station-management', icon: <TrainOutlinedIcon />,
                    label: '車站管理'
                  },
                ] : []),
              ].map(({ to, icon, label }) => (
                <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                  {() => (
                    <Button
                      startIcon={icon}
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        fontSize: '1rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        color: 'primary.main',
                        '&:hover': {
                          color: 'info.main',
                        },
                      }}
                    >
                      {label}
                    </Button>
                  )}
                </NavLink>
              ))}
            </Box>
          </Box>
          {/* RightMenu */}
          {/* User Profile Menu */}
          <UserProfileMenu items={userProfileMenuItem} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};