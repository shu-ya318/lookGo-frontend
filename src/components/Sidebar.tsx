import { useNavigate } from 'react-router-dom';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

interface SidebarItem {
  name: string;
  path: string;
}

interface SidebarProps {
  isOpen: boolean;
  items: SidebarItem[];
  onClose: () => void;
};

export const Sidebar = ({ isOpen, items, onClose }: SidebarProps) => {
  const navigate = useNavigate();

  const onClickOption = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer open={isOpen} onClose={onClose} hidden={!isOpen}>
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
        <List
          sx={{
            fontSize: '1.125rem',
            fontWeight: 500,
          }}
        >
          {items.map(({ name, path }) => (
            <ListItem key={name} disablePadding>
              <ListItemButton onClick={() => onClickOption(path)}>
                <ListItemText primary={name} sx={{ paddingLeft: '1rem' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Stack>
    </Drawer>
  );
};
