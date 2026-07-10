import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';
import dayjs from 'dayjs';

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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';

import { getCurrentUser } from '@/services/user';
import { signup } from '@/services/auth';
import {
  isValidDateFormat,
  isValidBirthDate,
  isValidCellphone,
} from '@/utils/validation';

import type { SignupRequest } from '@/services/auth/interface';

const formSchema = z.object({
  email: z.email('請輸入有效格式的電子郵件!'),
  username: z.string().min(1, '請輸入使用者名稱!'),
  password: z
    .string()
    .min(1, '請輸入密碼!')
    .min(8, '密碼長度必須為 8-20 個字!')
    .max(20, '密碼長度必須為 8-20 個字!'),
  cellphone: z
    .string()
    .min(1, '請輸入手機號碼!')
    .refine(isValidCellphone, '請輸入 09 開頭的 10 碼手機號碼!'),
  birthDate: z
    .string()
    .refine(isValidDateFormat, '出生日期格式必須為 yyyy-MM-dd!')
    .refine(isValidBirthDate, '出生日期必須有效且不得大於今日!')
    .optional(),
});

export type FormSchemaData = z.infer<typeof formSchema>;

const defaultValues = {
  email: '',
  username: '',
  password: '',
  cellphone: '',
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

  const onSubmit: SubmitHandler<FormSchemaData> = async (data) => {
    const submitData: SignupRequest = {
      email: data.email,
      username: data.username,
      password: data.password,
      cellphone: data.cellphone,
    };

    if (data.birthDate) {
      submitData.birthDate = data.birthDate;
    }

    await handleSignup(submitData);
  };

  const handleSignup = async (request: SignupRequest) => {
    try {
      const { accessToken, refreshToken } = await signup(request);
      useAuthStore.setState({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });

      const response = await getCurrentUser();
      useUserStore.setState({ userInfo: response });
      navigate('/');
      enqueueSnackbar('註冊成功，歡迎加入會員', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar((error as string) || '註冊失敗', { variant: 'error' });
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
        gap: '2rem',
      }}
    >
      {/* 標題 */}
      <Stack>
        <Typography
          variant='h4'
          sx={{ color: 'neutral.dark', textAlign: 'center' }}
        >
          歡迎您的加入
        </Typography>
        <Typography
          variant='caption'
          sx={{ color: 'neutral.main', mt: 1, textAlign: 'center' }}
        >
          請填寫完整資訊以完成註冊
        </Typography>
      </Stack>
      <Stack sx={{ gap: '1.5rem' }}>
        {/* 電子郵件 */}
        <FormControl fullWidth>
          <FormLabel
            htmlFor='Email'
            required
            sx={{
              color: 'neutral.dark',
              '& .MuiFormLabel-asterisk': { color: 'error.main' },
            }}
          >
            電子郵件
          </FormLabel>
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id='Email'
                type='text'
                placeholder='請輸入電子郵件'
                error={!!errors.email}
                helperText={errors.email?.message}
                variant='outlined'
              />
            )}
          />
        </FormControl>
        {/* 使用者名稱 */}
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
                placeholder='請輸入使用者名稱'
                error={!!errors.username}
                helperText={errors.username?.message}
                variant='outlined'
              />
            )}
          />
        </FormControl>
        {/* 手機號碼 */}
        <FormControl fullWidth>
          <FormLabel
            htmlFor='cellphone'
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
                id='cellphone'
                type='tel'
                placeholder='請輸入手機號碼'
                error={!!errors.cellphone}
                helperText={errors.cellphone?.message}
                variant='outlined'
              />
            )}
          />
        </FormControl>
        {/* 出生日期 */}
        <FormControl fullWidth>
          <FormLabel
            htmlFor='BirthDate'
            sx={{
              color: 'neutral.dark',
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
                  disableFuture
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
        {/* 密碼 */}
        <FormControl fullWidth>
          <FormLabel
            htmlFor='Password'
            required
            sx={{
              color: 'neutral.dark',
              '& .MuiFormLabel-asterisk': { color: 'error.main' },
            }}
          >
            密碼
          </FormLabel>
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id='Password'
                type={showPassword ? 'text' : 'password'}
                placeholder='請輸入密碼'
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
      </Stack>
      {/* 提交按鈕 */}
      <Button
        aria-label='註冊'
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
        註冊
      </Button>
      {/* 登入的跳轉連結 */}
      <Link
        component='button'
        type='button'
        variant='button'
        underline='hover'
        color='secondary'
        onClick={() => navigate('/auth/login')}
      >
        已經有帳號?
        <span style={{ color: '#828282', fontWeight: 700 }}>點此登入</span>
      </Link>
    </Stack>
  );
};

export default SignupPage;
