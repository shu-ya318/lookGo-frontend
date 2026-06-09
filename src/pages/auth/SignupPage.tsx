import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';

import { getCurrentUser } from '@/services/user';
import { signup } from '@/services/auth';

import type { SignupRequest } from '@/services/auth/interface';

const formSchema = z.object({
  email: z
    .email('請輸入有效格式的 Email!'),
  username: z
    .string()
    .min(1, '請輸入使用者名稱!'),
  password: z
    .string()
    .min(1, '請輸入密碼!')
    .min(8, '密碼長度必須為 8-20 個字元!')
    .max(20, '密碼長度必須為 8-20 個字元!'),
  birthDate: z
    .string()
    .min(1, '請輸入出生日期(yyyy-MM-dd)!')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '出生日期格式必須為 yyyy-MM-dd!')
    .refine((val) => {
      const parts = val.split('-');
      if (parts.length !== 3) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      const inputDate = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate <= today;
    }, '出生日期不得大於今日!'),
});

export type FormSchemaData = z.infer<typeof formSchema>;

const defaultValues = {
  email: '',
  username: '',
  password: '',
  birthDate: '',
};

const SignupPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaData>({
    defaultValues: defaultValues,
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<FormSchemaData> = async data => {
    await handleSignup(data);
  };

  const handleSignup = async (request: SignupRequest) => {
    try {
      const { accessToken, refreshToken } = await signup(request);
      useAuthStore.setState({ accessToken: accessToken, refreshToken: refreshToken });

      const response = await getCurrentUser();
      useUserStore.setState({ userInfo: response });

      navigate('/');
      enqueueSnackbar('註冊成功，歡迎加入', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error as string, { variant: 'error' });
    }
  };

  return (
    <Stack
      component='form'
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: '100%',
        maxWidth: '22rem',
        gap: '2rem',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Title */}
      <Typography variant='h4' sx={{ mb: 1, fontWeight: 700, textAlign: 'center', width: '100%' }}>註冊</Typography>
      <Stack sx={{ gap: '1.25rem', width: '100%' }}>
        {/* Email */}
        <FormControl fullWidth>
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type='text'
                placeholder="請輸入電子郵件"
                error={!!errors.email}
                helperText={errors.email?.message}
                variant='outlined'
              />
            )}
          />
        </FormControl>
        {/* Username */}
        <FormControl fullWidth>
          <Controller
            name='username'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type='text'
                placeholder="請輸入使用者名稱"
                error={!!errors.username}
                helperText={errors.username?.message}
                variant='outlined'
              />
            )}
          />
        </FormControl>
        {/* Birth Date */}
        <FormControl fullWidth>
          <Controller
            name='birthDate'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type='date'
                label="出生日期"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                error={!!errors.birthDate}
                helperText={errors.birthDate?.message}
                variant='outlined'
              />
            )}
          />
        </FormControl>
        {/* Password */}
        <FormControl fullWidth>
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type={showPassword ? 'text' : 'password'}
                placeholder="請輸入密碼"
                error={!!errors.password}
                helperText={errors.password?.message}
                variant='outlined'
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </FormControl>
        {/* Login link */}
        <Stack sx={{ mt: 1, alignItems: 'center' }}>
          <Typography variant='body2' color="text.secondary">已經有帳號了嗎？</Typography>
          <Button
            fullWidth
            variant='text'
            onClick={() => navigate('/auth/login')}
            sx={{ fontWeight: 600 }}
          >
            登入
          </Button>
        </Stack>
      </Stack>
      {/* Submit button */}
      <Button
        type='submit'
        variant='contained'
        disabled={isSubmitting}
        fullWidth
        sx={{
          height: '3rem',
          padding: '.75rem .9375rem',
          borderRadius: '4px',
          backgroundColor: '#007AFF',
          color: '#FFFFFF',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#0056b3',
            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
          },
        }}
      >
        註冊
      </Button>
    </Stack>

  );
};

export default SignupPage;
