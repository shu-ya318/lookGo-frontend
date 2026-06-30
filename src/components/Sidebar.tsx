import { useNavigate } from 'react-router-dom';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

import type { NavItem } from '@/components/header/Header';

interface SidebarProps {
  isOpen: boolean;
  items: NavItem[];
  onClose: () => void;
};

export const Sidebar = ({ isOpen, items, onClose }: SidebarProps) => {
  const navigate = useNavigate();

  const onClickOption = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      hidden={!isOpen}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          display: { xs: 'block', md: 'none' },
        }
      }}
    >
      <Stack
        sx={{
          justifyContent: 'space-between',
          minWidth: '15.25rem',
          margin: '0 auto',
        }}
      >
        {/*Logo and Close button*/}
        <Stack
          direction='row'
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '4.375rem',
            padding: '0 2rem',
          }}
        >
          <Stack
            direction='row'
            sx={{
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <IconButton onClick={onClose}>
              <CloseOutlinedIcon fontSize='small' color='secondary' />
            </IconButton>
          </Stack>
        </Stack>
        {/* Navigation */}
        <List>
          {items.map(({ label, path, icon }) => (
            <ListItem key={path} disablePadding>
              <ListItemButton
                onClick={() => onClickOption(path)}
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    color: 'info.main',
                    '& .MuiListItemIcon-root': {
                      color: 'info.main',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'primary.dark', transition: 'color 0.2s' }}>
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '1rem',
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Stack>
    </Drawer>
  );
};
