import { useEffect } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';
import dayjs from 'dayjs';

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Dialog } from '@/components/Dialog';
import { updateBirthDate } from '@/services/user';
import {
  isValidDateFormat,
  isValidBirthDate,
  isValidBirthDateRange,
} from '@/utils/validation';

const formSchema = z.object({
  birthDate: z
    .string()
    .min(1, '請選擇出生日期!')
    .refine(isValidDateFormat, '出生日期格式必須為 yyyy-MM-dd!')
    .refine(isValidBirthDate, '出生日期必須有效且不得大於今日!')
    .refine(isValidBirthDateRange, '出生日期年齡必須介於 6 歲至 150 歲之間!'),
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = { birthDate: '' };

interface UpdateBirthDateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBirthDate: string;
  onSuccess: () => Promise<void>;
}

export const UpdateBirthDateDialog = ({
  isOpen,
  onClose,
  defaultBirthDate,
  onSuccess,
}: UpdateBirthDateDialogProps) => {
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
      reset({ birthDate: defaultBirthDate });
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    reset(defaultValues);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await updateBirthDate({
        birthDate: data.birthDate,
      });
      enqueueSnackbar('出生日期修改成功！', {
        variant: 'success',
      });
      handleClose();
      await onSuccess();
    } catch (error) {
      enqueueSnackbar((error as string) || '出生日期修改失敗！', {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title='修改出生日期'
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
            htmlFor='BirthDate'
            required
            sx={{
              color: 'neutral.dark',
              '& .MuiFormLabel-asterisk': { color: 'error.main' },
            }}
          >
            出生日期
          </FormLabel>
          <Controller
            name='birthDate'
            control={control}
            render={({ field }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(newValue) =>
                    field.onChange(
                      newValue?.isValid() ? newValue.format('YYYY-MM-DD') : '',
                    )
                  }
                  format='YYYY-MM-DD'
                  minDate={dayjs().subtract(150, 'year')}
                  maxDate={dayjs().subtract(6, 'year')}
                  slotProps={{
                    textField: {
                      id: 'BirthDate',
                      variant: 'outlined',
                      error: !!errors.birthDate,
                      helperText: errors.birthDate?.message,
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />
        </FormControl>
      </Stack>
    </Dialog>
  );
};
