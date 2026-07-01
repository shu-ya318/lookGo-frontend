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

import { forgetPassword } from "@/services/auth";

import type { ForgetPasswordRequest } from "@/services/auth/interface";

const formSchema = z.object({
  email: z.email("請輸入有效格式的電子郵件!"),
  cellphone: z
    .string()
    .min(1, "請輸入手機號碼!")
    .regex(/^0\d{9}$/, "請輸入 0 開頭的 10 碼臺灣手機號碼!"),
});

export type FormSchemaData = z.infer<typeof formSchema>;

const defaultValues = {
  email: "",
  cellphone: "",
};

const ForgetPasswordPage = () => {
  const navigate = useNavigate();

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
    await handleForgetPassword(data);
  };

  const handleForgetPassword = async (request: ForgetPasswordRequest) => {
    try {
      const response = await forgetPassword(request);
      navigate("/auth/reset-password", {
        state: { resetPasswordToken: response.resetPasswordToken },
      });
    } catch (error) {
      enqueueSnackbar((error as string) || "發送失敗!", { variant: "error" });
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
        gap: "6rem",
      }}
    >
      {/* Title */}
      <Stack>
        <Typography
          variant='h4'
          sx={{ color: "neutral.dark", textAlign: "center" }}
        >
          忘記您的密碼?
        </Typography>
        <Typography
          variant='caption'
          sx={{ color: "neutral.main", mt: 1, textAlign: "center" }}
        >
          請輸入帳號註冊的電子郵件與手機號碼
        </Typography>
      </Stack>
      <Stack sx={{ gap: "2rem" }}>
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
        {/* Phone Number */}
        <FormControl fullWidth>
          <FormLabel
            htmlFor='cellphone'
            required
            sx={{
              color: "neutral.dark",
              "& .MuiFormLabel-asterisk": { color: "error.main" },
            }}
          >
            臺灣手機號碼
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
          發送重設密碼信件
        </Button>
      </Stack>
      {/* Return to Login Link */}
      <Link
        component='button'
        type='button'
        variant='button'
        underline='hover'
        color='secondary'
        onClick={() => navigate("/auth/login")}
      >
        返回登入
      </Link>
    </Stack>
  );
};

export default ForgetPasswordPage;
