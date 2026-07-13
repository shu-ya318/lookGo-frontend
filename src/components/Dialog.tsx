import MuiDialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';

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
  onClose?: () => void;
}

export const Dialog = ({
  isOpen,
  title,
  content,
  children,
  extraStyles = {},
  action,
  width = '40.5rem',
  onClose,
}: ExtendedDialogProps) => {
  return (
    <MuiDialog
      open={isOpen}
      onClose={onClose}
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
      <Stack
        direction='row'
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        {/* 標題 */}
        <DialogTitle
          variant='h5'
          sx={{ padding: '1.5rem', color: 'text.primary' }}
        >
          {title}
        </DialogTitle>
        {/* 關閉按鈕 */}
        {onClose && (
          <IconButton onClick={onClose} sx={{ marginRight: '1rem' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Stack>
      {/* 內容 */}
      <DialogContent sx={{ ...extraStyles }}>
        {children ??
          (content && <DialogContentText>{content}</DialogContentText>)}
      </DialogContent>
      {/* 操作 */}
      {action && (
        <DialogActions sx={{ padding: '1.5rem', gap: '1rem' }}>
          {action}
        </DialogActions>
      )}
    </MuiDialog>
  );
};
