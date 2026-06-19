import { useState } from 'react';

import AccountCircle from '@mui/icons-material/AccountCircle';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';

import { UserProfileMenuList } from './UserProfileMenuList';
import { useUserStore } from '@/stores/userStore';

import type { ComponentType, MouseEvent, ReactNode } from 'react';

interface UserProfileMenuItem {
  text: string;
  icon: ReactNode;
  props?: Record<string, unknown>;
  action?: () => void;
  Component?: ComponentType;
};

interface UserProfileMenuListProps {
  items: UserProfileMenuItem[];
};

export const UserProfileMenu = ({ items }: UserProfileMenuListProps) => {
  const { userInfo } = useUserStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openUserMenu = Boolean(anchorEl);

  const handleUserMenuToggle = (event: MouseEvent<HTMLElement>) => {
    if (openUserMenu) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  return (
    <>
      <Button
        aria-label='current user'
        aria-controls={openUserMenu ? 'user-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={openUserMenu ? 'true' : undefined}
        id='user-menu-button'
        component='label'
        tabIndex={-1}
        startIcon={<AccountCircle fontSize='small' />}
        onClick={event => handleUserMenuToggle(event)}
        sx={{
          color: 'primary.main',
          '&:hover': {
            color: 'info.main',
          },
        }}
      >
        <Typography
          variant='subtitle2'
          sx={{
            maxWidth: '8rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textTransform: 'none',
          }}
        >
          {userInfo?.username}
        </Typography>
      </Button>
      <Menu
        id='user-menu'
        anchorEl={anchorEl}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        elevation={1}
        open={openUserMenu}
        onClose={() => setAnchorEl(null)}
        slotProps={{ list: { 'aria-labelledby': 'user-menu-button' } }}
      >
        <UserProfileMenuList items={items} />
      </Menu>
    </>
  );
};
