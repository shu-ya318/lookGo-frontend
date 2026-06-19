import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import type { ComponentType, ReactNode } from 'react';

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

export const UserProfileMenuList = ({ items }: UserProfileMenuListProps) => {

  return (
    <>
      {items.map((item, index) => {
        const { icon, text = '', props, action, Component } = item;

        if (Component) {
          return <Component key={`user-menu-${index}`} {...props} />;
        }

        return (
          <MenuItem key={`user-menu-${index}`} onClick={action} {...props}>
            {icon && <ListItemIcon>{icon}</ListItemIcon>}
            {text && <ListItemText primary={<Typography variant='body2'>{text}</Typography>} />}
          </MenuItem>
        );
      })}
    </>
  );
};
