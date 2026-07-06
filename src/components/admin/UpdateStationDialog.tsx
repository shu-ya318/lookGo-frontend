import { useEffect, useState } from "react";
import { z } from "zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";

import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { Dialog } from "@/components/Dialog";
import { getStationById, updateStation } from "@/services/metro";

const formSchema = z.object({
  nameZhTw: z.string().min(1, "請輸入中文站名!"),
  nameEn: z.string().min(1, "請輸入英文站名!"),
  atm: z.string(),
  nursingRoom: z.string(),
  diaperTable: z.string(),
  chargingStation: z.string(),
  ticketMachine: z.string(),
  drinkingWater: z.string(),
  restroom: z.string(),
  elevator: z.string(),
  escalator: z.string(),
});

type FormData = z.infer<typeof formSchema>;

const defaultFormValues: FormData = {
  nameZhTw: "",
  nameEn: "",
  atm: "",
  nursingRoom: "",
  diaperTable: "",
  chargingStation: "",
  ticketMachine: "",
  drinkingWater: "",
  restroom: "",
  elevator: "",
  escalator: "",
};

const fieldLabelMap: { name: keyof FormData; label: string; required: boolean; disabled?: boolean }[] = [
  { name: "nameZhTw", label: "中文站名", required: true, disabled: true },
  { name: "nameEn", label: "英文站名", required: true, disabled: true },
  { name: "atm", label: "ATM", required: false },
  { name: "nursingRoom", label: "哺乳室", required: false },
  { name: "diaperTable", label: "尿布台", required: false },
  { name: "chargingStation", label: "充電站", required: false },
  { name: "ticketMachine", label: "售票機", required: false },
  { name: "drinkingWater", label: "飲水機", required: false },
  { name: "restroom", label: "廁所", required: false },
  { name: "elevator", label: "電梯", required: false },
  { name: "escalator", label: "手扶梯", required: false },
];

interface UpdateStationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stationId: string | null;
  onSuccess: () => Promise<void>;
}

export const UpdateStationDialog = ({
  isOpen,
  onClose,
  stationId,
  onSuccess,
}: UpdateStationDialogProps) => {
  const [isFetching, setIsFetching] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: defaultFormValues,
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen || !stationId) return;

    const fetchStation = async () => {
      setIsFetching(true);
      try {
        const station = await getStationById({ id: stationId });
        reset({
          nameZhTw: station.nameZhTw,
          nameEn: station.nameEn,
          atm: station.atm,
          nursingRoom: station.nursingRoom,
          diaperTable: station.diaperTable,
          chargingStation: station.chargingStation,
          ticketMachine: station.ticketMachine,
          drinkingWater: station.drinkingWater,
          restroom: station.restroom,
          elevator: station.elevator,
          escalator: station.escalator,
        });
      } catch (error) {
        enqueueSnackbar((error as string) || "取得車站資訊失敗", {
          variant: "error",
        });
        onClose();
      } finally {
        setIsFetching(false);
      }
    };

    fetchStation();
  }, [isOpen, stationId]);

  const handleClose = (): void => {
    onClose();
    reset(defaultFormValues);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!stationId) return;

    try {
      const { message } = await updateStation({
        id: Number(stationId),
        ...data,
      });
      enqueueSnackbar(message || "車站資訊修改成功！", {
        variant: "success",
      });
      onClose();
      await onSuccess();
    } catch (error) {
      enqueueSnackbar((error as string) || "車站資訊修改失敗！", {
        variant: "error",
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title='編輯車站資訊'
      width='32rem'
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
            disabled={isSubmitting || isFetching}
            onClick={handleSubmit(onSubmit)}
          >
            確認修改
          </Button>
        </>
      }
    >
      {isFetching ? (
        <Typography>載入中...</Typography>
      ) : (
        <Stack sx={{ pt: 1, gap: "1rem" }}>
          {fieldLabelMap.map(({ name, label, required, disabled }) => (
            <FormControl key={name} fullWidth>
              <FormLabel
                htmlFor={name}
                required={required}
                sx={{
                  color: "neutral.dark",
                  "& .MuiFormLabel-asterisk": { color: "error.main" },
                }}
              >
                {label}
              </FormLabel>
              <Controller
                name={name}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id={name}
                    placeholder={`請輸入${label}`}
                    error={!!errors[name]}
                    helperText={errors[name]?.message}
                    variant='outlined'
                    size='small'
                    disabled={disabled}
                  />
                )}
              />
            </FormControl>
          ))}
        </Stack>
      )}
    </Dialog>
  );
};
