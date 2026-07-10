import { useEffect } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { Dialog } from '@/components/Dialog';
import { updateUsername } from '@/services/user';

const formSchema = z.object({
  username: z.string().min(1, '請輸入使用者名稱!'),
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = { username: '' };

interface UpdateUsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUsername: string;
  onSuccess: () => Promise<void>;
}

export const UpdateUsernameDialog = ({
  isOpen,
  onClose,
  defaultUsername,
  onSuccess,
}: UpdateUsernameDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues,
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) {
      reset({ username: defaultUsername });
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    reset(defaultValues);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const { successMessage } = await updateUsername({
        username: data.username,
      });
      enqueueSnackbar(successMessage || '使用者名稱修改成功！', {
        variant: 'success',
      });
      onClose();
      await onSuccess();
    } catch (error) {
      enqueueSnackbar((error as string) || '使用者名稱修改失敗！', {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title='修改使用者名稱'
      width='28rem'
      action={
        <>
          <Button
            variant='outlined'
            onClick={handleClose}
            sx={{ color: 'neutral.dark', borderColor: 'neutral.light' }}
          >
            取消
          </Button>
          <Button
            variant='contained'
            color='primary'
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            確認修改
          </Button>
        </>
      }
    >
      <Stack sx={{ gap: '1.5rem', pt: 1 }}>
        <FormControl fullWidth>
          <FormLabel
            htmlFor='Username'
            required
            sx={{
              color: 'neutral.dark',
              '& .MuiFormLabel-asterisk': { color: 'error.main' },
            }}
          >
            使用者名稱
          </FormLabel>
          <Controller
            name='username'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id='Username'
                type='text'
                placeholder='請輸入新的使用者名稱'
                error={!!errors.username}
                helperText={errors.username?.message}
                variant='outlined'
              />
            )}
          />
        </FormControl>
      </Stack>
    </Dialog>
  );
};
