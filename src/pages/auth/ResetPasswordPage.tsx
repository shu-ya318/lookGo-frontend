import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';

import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { resetPassword } from '@/services/auth';

const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, '請輸入新密碼!')
      .min(8, '密碼長度必須為 8-20 個字元!')
      .max(20, '密碼長度必須為 8-20 個字元!'),
    confirmPassword: z.string().min(1, '請再次輸入新密碼!'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '新密碼與確認密碼不符!',
    path: ['confirmPassword'],
  });

export type FormSchemaData = z.infer<typeof formSchema>;

const defaultValues = {
  newPassword: '',
  confirmPassword: '',
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetPasswordToken =
    (location.state as { resetPasswordToken?: string })?.resetPasswordToken ??
    '';

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaData>({
    defaultValues: defaultValues,
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<FormSchemaData> = async (data) => {
    await handleResetPassword(data.newPassword);
  };

  const handleResetPassword = async (newPassword: string) => {
    try {
      if (!resetPasswordToken) {
        enqueueSnackbar('重設驗證碼無效！', {
          variant: 'error',
        });

        return;
      }

      const response = await resetPassword({
        resetPasswordToken,
        newPassword,
      });
      enqueueSnackbar(response.successMessage || '密碼重設成功！', {
        variant: 'success',
      });
      navigate('/auth/login', { replace: true });
    } catch (error) {
      enqueueSnackbar((error as string) || '密碼重設失敗！', {
        variant: 'error',
      });
    }
  };

  return (
    <Stack
      component='form'
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: '100%',
        maxWidth: '20rem',
        height: '100%',
        minHeight: '34rem',
        gap: '6rem',
      }}
    >
      {/* 標題 */}
      <Stack>
        <Typography
          variant='h4'
          sx={{ color: 'neutral.dark', textAlign: 'center' }}
        >
          重設您的密碼
        </Typography>
        <Typography
          variant='caption'
          sx={{ color: 'neutral.main', mt: 1, textAlign: 'center' }}
        >
          請輸入新的密碼
        </Typography>
      </Stack>
      <Stack sx={{ gap: '2rem' }}>
        {/* 新密碼 */}
        <FormControl fullWidth>
          <FormLabel
            htmlFor='NewPassword'
            required
            sx={{
              color: 'neutral.dark',
              '& .MuiFormLabel-asterisk': { color: 'error.main' },
            }}
          >
            新密碼
          </FormLabel>
          <Controller
            name='newPassword'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id='NewPassword'
                type={showNewPassword ? 'text' : 'password'}
                placeholder='請輸入新密碼'
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                variant='outlined'
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge='end'
                        >
                          {showNewPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </FormControl>
        {/* 確認新密碼 */}
        <FormControl fullWidth>
          <FormLabel
            htmlFor='ConfirmPassword'
            required
            sx={{
              color: 'neutral.dark',
              '& .MuiFormLabel-asterisk': { color: 'error.main' },
            }}
          >
            確認新密碼
          </FormLabel>
          <Controller
            name='confirmPassword'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id='ConfirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='請再次輸入新密碼'
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                variant='outlined'
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge='end'
                        >
                          {showConfirmPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </FormControl>
        {/* 提交按鈕 */}
        <Button
          aria-label=''
          type='submit'
          variant='contained'
          disabled={isSubmitting}
          sx={{
            height: '2.75rem',
            padding: '.625rem .875rem',
            borderRadius: '6px',
            backgroundColor: 'neutral.light',
            color: 'primary.contrastText',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'neutral.dark',
            },
          }}
        >
          重設密碼
        </Button>
      </Stack>
      {/* 返回登入的導航連結 */}
      <Link
        component='button'
        type='button'
        variant='button'
        underline='hover'
        color='secondary'
        onClick={() => navigate('/auth/login')}
      >
        返回登入
      </Link>
    </Stack>
  );
};

export default ResetPasswordPage;
