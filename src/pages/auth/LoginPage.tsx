import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";

import FormLabel from "@mui/material/FormLabel";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";

import { getCurrentUser } from "@/services/user";
import { login } from "@/services/auth";

import type { LoginRequest } from "@/services/auth/interface";

const formSchema = z.object({
  email: z.email("請輸入有效格式的電子郵件!"),
  password: z
    .string()
    .min(1, "請輸入密碼!")
    .min(8, "密碼長度必須為 8-20 個字!")
    .max(20, "密碼長度必須為 8-20 個字!"),
});

export type FormSchemaData = z.infer<typeof formSchema>;

const defaultValues = {
  email: "",
  password: "",
};

const LoginPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaData>({
    defaultValues: defaultValues,
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<FormSchemaData> = async (data) => {
    await handleLogin(data);
  };

  const handleLogin = async (request: LoginRequest) => {
    try {
      const { accessToken, refreshToken } = await login(request);
      useAuthStore.setState({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });

      const response = await getCurrentUser();
      useUserStore.setState({ userInfo: response });

      navigate("/", { replace: true });
      enqueueSnackbar("登入成功，歡迎回來", { variant: "success" });
    } catch (error) {
      enqueueSnackbar((error as string) || "登入失敗", { variant: "error" });
    }
  };

  return (
    <Stack
      component='form'
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: "100%",
        maxWidth: "20rem",
        height: "100%",
        minHeight: "34rem",
        gap: "2rem",
      }}
    >
      {/* Title */}
      <Stack>
        <Typography
          variant='h4'
          sx={{ color: "neutral.dark", textAlign: "center" }}
        >
          歡迎您回來
        </Typography>
        <Typography
          variant='caption'
          sx={{ color: "neutral.main", mt: 1, textAlign: "center" }}
        >
          請輸入電子郵件和密碼登入
        </Typography>
      </Stack>
      <Stack sx={{ gap: "1.5rem" }}>
        {/* Email */}
        <FormControl fullWidth>
          <FormLabel
            htmlFor='Email'
            required
            sx={{
              color: "neutral.dark",
              "& .MuiFormLabel-asterisk": { color: "error.main" },
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
        {/* Password */}
        <FormControl fullWidth>
          <FormLabel
            htmlFor='Password'
            required
            sx={{
              color: "neutral.dark",
              "& .MuiFormLabel-asterisk": { color: "error.main" },
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
                id='password'
                type={showPassword ? "text" : "password"}
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
        {/* Forget password Link */}
        <Link
          component='button'
          type='button'
          variant='button'
          underline='hover'
          color='secondary'
          sx={{ textAlign: "left" }}
          onClick={() => navigate("/auth/forget-password")}
        >
          忘記密碼?
        </Link>
      </Stack>
      {/* Submit button */}
      <Button
        aria-label=''
        type='submit'
        variant='contained'
        disabled={isSubmitting}
        sx={{
          height: "2.75rem",
          padding: ".625rem .875rem",
          borderRadius: "6px",
          backgroundColor: "neutral.light",
          color: "primary.contrastText",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "neutral.dark",
          },
        }}
      >
        登入
      </Button>
      {/* Sign up Link */}
      <Link
        component='button'
        type='button'
        variant='button'
        underline='hover'
        color='secondary'
        onClick={() => navigate("/auth/sign-up")}
      >
        還沒有帳號?
        <span style={{ color: "#828282", fontWeight: 700 }}>點此註冊</span>
      </Link>
    </Stack>
  );
};

export default LoginPage;
