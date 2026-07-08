import { useState } from "react";
import { enqueueSnackbar } from "notistack";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

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

  const handleSave = async (): Promise<void> => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const updated = await updateTripPlanName({
        tripPlanId: tripPlan.id,
        name: name.trim(),
      });
      enqueueSnackbar("旅程名稱更新成功！", { variant: "success" });
      onSaved(updated);
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
      <TextField
        label='旅程名稱'
        value={name}
        onChange={(event) => setName(event.target.value)}
        size='small'
        fullWidth
        required
        placeholder='請輸入旅程名稱'
      />
    </Dialog>
  );
}
