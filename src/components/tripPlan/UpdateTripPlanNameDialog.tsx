import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Dialog } from '@/components/Dialog';

import { getAllTripPlanName, updateTripPlanName } from '@/services/tripPlan';

import type { TripPlan } from '@/services/tripPlan/interface';

const baseFormSchema = z.object({
  name: z.string().trim().min(1, '請輸入旅程名稱!'),
});

type FormData = z.infer<typeof baseFormSchema>;

const defaultValues: FormData = { name: '' };

interface UpdateTripPlanNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripPlan: TripPlan;
  onSaved: (tripPlan: TripPlan) => void;
}

export const UpdateTripPlanNameDialog = ({
  isOpen,
  onClose,
  tripPlan,
  onSaved,
}: UpdateTripPlanNameDialogProps) => {
  const [existingNames, setExistingNames] = useState<string[]>([]);

  // 即時預檢名稱是否與既有旅程重複（排除原名，存回原名視為合法，與後端邏輯一致）
  const formSchema = useMemo(
    () =>
      baseFormSchema.refine(
        (data) =>
          data.name.toLowerCase() === tripPlan.name.trim().toLowerCase() ||
          !existingNames.some(
            (name) => name.trim().toLowerCase() === data.name.toLowerCase(),
          ),
        { message: '此名稱已存在', path: ['name'] },
      ),
    [existingNames, tripPlan.name],
  );

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
      reset({ name: tripPlan.name });

      const fetchNames = async () => {
        try {
          const response = await getAllTripPlanName();
          setExistingNames(response);
        } catch {
          setExistingNames([]);
        }
      };

      void fetchNames();
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    reset(defaultValues);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await handleUpdateTripPlanName(data.name);
  };

  const handleUpdateTripPlanName = async (name: string) => {
    try {
      const nameVo = await updateTripPlanName({
        tripPlanId: tripPlan.id,
        name,
      });
      enqueueSnackbar('旅程名稱更新成功！', { variant: 'success' });
      // 後端只回傳異動欄位（id、name、updatedAt），merge 回完整 tripPlan
      onSaved({ ...tripPlan, ...nameVo });
    } catch (error) {
      enqueueSnackbar((error as string) || '旅程名稱更新失敗', {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title='編輯旅程名稱'
      width='24rem'
      action={
        <Button
          variant='contained'
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          儲存
        </Button>
      }
    >
      <Stack sx={{ gap: '1.5rem', pt: 1 }}>
        {/* 旅程名稱 */}
        <FormControl fullWidth>
          <FormLabel
            htmlFor='TripPlanName'
            required
            sx={{
              color: 'neutral.dark',
              '& .MuiFormLabel-asterisk': { color: 'error.main' },
            }}
          >
            旅程名稱
          </FormLabel>
          <Typography variant='caption' sx={{ color: 'info.main', mb: 0.5 }}>
            名稱不能與既有的旅程規劃重複
          </Typography>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id='TripPlanName'
                type='text'
                size='small'
                placeholder='請輸入旅程名稱'
                error={!!errors.name}
                helperText={errors.name?.message}
                variant='outlined'
              />
            )}
          />
        </FormControl>
      </Stack>
    </Dialog>
  );
};
