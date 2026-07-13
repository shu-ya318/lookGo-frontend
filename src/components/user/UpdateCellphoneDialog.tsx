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
import { updateCellphone } from '@/services/user';
import { isValidCellphone } from '@/utils/validation';

const formSchema = z.object({
  cellphone: z
    .string()
    .min(1, '請輸入手機號碼!')
    .refine(isValidCellphone, '請輸入 09 開頭的 10 碼手機號碼!'),
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = { cellphone: '' };

interface UpdateCellphoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCellphone: string;
  onSuccess: () => Promise<void>;
}

export const UpdateCellphoneDialog = ({
  isOpen,
  onClose,
  defaultCellphone,
  onSuccess,
}: UpdateCellphoneDialogProps) => {
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
      reset({ cellphone: defaultCellphone });
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    reset(defaultValues);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await updateCellphone({
        cellphone: data.cellphone,
      });
      enqueueSnackbar(response.successMessage || '手機號碼修改成功！', {
        variant: 'success',
      });
      onClose();
      await onSuccess();
    } catch (error) {
      enqueueSnackbar((error as string) || '手機號碼修改失敗！', {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title='修改手機號碼'
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
      <Stack sx={{ pt: 1 }}>
        <FormControl fullWidth>
          <FormLabel
            htmlFor='Cellphone'
            required
            sx={{
              color: 'neutral.dark',
              '& .MuiFormLabel-asterisk': { color: 'error.main' },
            }}
          >
            手機號碼
          </FormLabel>
          <Controller
            name='cellphone'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id='Cellphone'
                type='tel'
                placeholder='請輸入手機號碼'
                error={!!errors.cellphone}
                helperText={errors.cellphone?.message}
                variant='outlined'
              />
            )}
          />
        </FormControl>
      </Stack>
    </Dialog>
  );
};
