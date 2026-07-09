import { useState } from "react";
import { enqueueSnackbar } from "notistack";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { Dialog } from "@/components/Dialog";

import { updateTripPlanName } from "@/services/tripPlan";

import type { TripPlan } from "@/services/tripPlan/interface";

interface UpdateTripPlanNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripPlan: TripPlan;
  onSaved: (tripPlan: TripPlan) => void;
}

export function UpdateTripPlanNameDialog({
  isOpen,
  onClose,
  tripPlan,
  onSaved,
}: UpdateTripPlanNameDialogProps): React.ReactElement {
  const [name, setName] = useState(tripPlan.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);

    try {
      const response = await updateTripPlanName({
        tripPlanId: tripPlan.id,
        name: name.trim(),
      });
      enqueueSnackbar("旅程名稱更新成功！", { variant: "success" });
      onSaved(response);
    } catch (error) {
      enqueueSnackbar((error as string) || "旅程名稱更新失敗", {
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title='編輯旅程名稱'
      width='24rem'
      action={
        <Button
          variant='contained'
          loading={isSaving}
          disabled={!name.trim()}
          onClick={handleSave}
        >
          儲存
        </Button>
      }
    >
      <Stack sx={{ gap: 0.5 }}>
        <Typography variant='body2' color='text.secondary'>
          旅程名稱
          <Box component='span' sx={{ color: "error.main", ml: 0.25 }}>
            *
          </Box>
        </Typography>
        <TextField
          value={name}
          onChange={(event) => setName(event.target.value)}
          size='small'
          fullWidth
          placeholder='請輸入旅程名稱'
        />
      </Stack>
    </Dialog>
  );
}
