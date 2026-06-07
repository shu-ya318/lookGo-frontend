import MuiDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import type { ReactNode } from 'react';
import type { SxProps } from '@mui/material/styles';

interface ExtendedDialogProps {
  isOpen: boolean;
  title: string;
  content?: string;
  children?: ReactNode;
  extraStyles?: SxProps;
  action?: ReactNode;
  width?: string;
};

export const Dialog = ({
  isOpen,
  title,
  content,
  children,
  extraStyles = {},
  action,
  width = '40.5rem',
}: ExtendedDialogProps) => {
  return (
    <MuiDialog
      open={isOpen}
      closeAfterTransition={false}
      sx={{
        border: 1,
        borderColor: 'primary.light',
        '& .MuiDialog-paper': {
          minWidth: width,
          maxWidth: 'none',
        },
      }}
    >
      <DialogTitle variant='h5' sx={{ padding: '1.5rem', color: 'text.primary' }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ ...extraStyles }}>
        {children ?? (content && <DialogContentText>{content}</DialogContentText>)}
      </DialogContent>
      <DialogActions sx={{ padding: '1.5rem', gap: '1rem' }}>{action}</DialogActions>
    </MuiDialog>
  );
};
