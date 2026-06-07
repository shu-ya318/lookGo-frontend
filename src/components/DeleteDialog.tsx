import Button from '@mui/material/Button';

import { Dialog } from './Dialog';

import type { ReactNode } from 'react';

interface DeleteDialogProps {
  title: string;
  isOpen: boolean;
  isSubmitting: boolean;
  children: ReactNode;
  onClose: () => void;
  onDeleteItems?: () => void;
  onDeleteItem?: () => void;
};

export const DeleteDialog = ({
  title,
  isOpen,
  children,
  onClose,
  isSubmitting,
  onDeleteItems,
  onDeleteItem,
}: DeleteDialogProps) => {
  const handleDeleteClick = () => {
    if (onDeleteItems) {
      onDeleteItems();
    } else if (onDeleteItem) {
      onDeleteItem();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title={title}
      width='55rem'
      extraStyles={{ padding: '0 1.5rem 3.625rem 1.5rem' }}
      action={
        <>
          <Button
            type='button'
            variant='contained'
            sx={{
              height: '2.6875rem',
              padding: '.625rem .875rem',
              borderRadius: '6px',
              color: 'primary.light',
              backgroundColor: 'quaternary.dark',
              '&:hover': {
                backgroundColor: 'tertiary.main',
              },
            }}
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            type='button'
            variant='contained'
            disabled={isSubmitting}
            sx={{
              height: '2.6875rem',
              padding: '.625rem .875rem',
              borderRadius: '6px',
              color: 'quaternary.light',
              backgroundColor: 'error.main',
            }}
            onClick={handleDeleteClick}
          >
            刪除
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
};
