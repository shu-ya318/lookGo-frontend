import { useEffect } from "react";
import { z } from "zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import dayjs from "dayjs";

import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Stack from "@mui/material/Stack";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { Dialog } from "@/components/Dialog";
import { updateBirthDate } from "@/services/user";
import { isValidDateFormat, isValidBirthDate } from "@/utils/validation";

const formSchema = z.object({
  birthDate: z
    .string()
    .min(1, "請選擇出生日期!")
    .refine(isValidDateFormat, "出生日期格式必須為 yyyy-MM-dd!")
    .refine(isValidBirthDate, "出生日期必須有效且不得大於今日!"),
});

type FormData = z.infer<typeof formSchema>;

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
    defaultValues: { birthDate: "" },
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      reset({ birthDate: defaultBirthDate });
    }
  }, [isOpen]);

  const handleClose = (): void => {
    onClose();
    reset({ birthDate: "" });
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const { successMessage } = await updateBirthDate({
        birthDate: data.birthDate,
      });
      enqueueSnackbar(successMessage || "出生日期修改成功！", {
        variant: "success",
      });
      onClose();
      await onSuccess();
    } catch (error) {
      enqueueSnackbar((error as string) || "出生日期修改失敗！", {
        variant: "error",
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
            sx={{ color: "neutral.dark", borderColor: "neutral.light" }}
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
      <Stack sx={{ gap: "1.5rem", pt: 1 }}>
        <FormControl fullWidth>
          <FormLabel
            htmlFor='BirthDate'
            required
            sx={{
              color: "neutral.dark",
              "& .MuiFormLabel-asterisk": { color: "error.main" },
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
                      newValue?.isValid() ? newValue.format("YYYY-MM-DD") : ""
                    )
                  }
                  format='YYYY-MM-DD'
                  disableFuture
                  slotProps={{
                    textField: {
                      id: "BirthDate",
                      variant: "outlined",
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
