import Button from "@mui/material/Button";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import type { CSSProperties, ReactNode } from "react";

interface CreateButtonProps {
  onCreate: () => void;
  text?: string;
}
export const CreateButton = ({
  onCreate,
  text = "建立",
}: CreateButtonProps) => {
  return (
    <Button
      onClick={onCreate}
      sx={{
        height: "2.6875rem",
        padding: ".625rem .875rem",
        borderRadius: "6px",
        color: "primary.contrastText",
        backgroundColor: "primary.light",
        "&:hover": {
          backgroundColor: "primary.dark",
        },
      }}
    >
      {text}
    </Button>
  );
};

interface UpdateButtonProps {
  onUpdate: () => void;
  disabled?: boolean;
  startIcon?: ReactNode;
  minWidth?: string;
  text?: string;
}
export const UpdateButton = ({
  onUpdate,
  startIcon = <RefreshOutlinedIcon sx={{ color: "primary.light" }} />,
  minWidth = "unset",
  disabled = false,
}: UpdateButtonProps) => {
  return (
    <Button
      type='button'
      disabled={disabled}
      startIcon={startIcon}
      onClick={onUpdate}
      sx={{
        minWidth: minWidth,
        height: "2.75rem",
        padding: ".625rem .875rem",
        borderRadius: "6px",
        fontSize: "1rem",
        color: "primary.light",
        backgroundColor: "quaternary.dark",
        "&:hover": {
          backgroundColor: "tertiary.main",
        },
        "& .MuiButton-startIcon": { marginRight: ".375rem" },
      }}
    >
      更新
    </Button>
  );
};

interface DeleteButtonProps {
  width: string;
  height: string;
  buttonHeight: string;
  padding: string;
  fontSize: string;
  onClick: () => void;
  extraStyles?: CSSProperties;
}
export const DeleteButton = ({
  padding,
  fontSize,
  width,
  height,
  buttonHeight,
  onClick,
  extraStyles = {},
}: DeleteButtonProps) => {
  return (
    <Button
      aria-label='delete button'
      startIcon={
        <DeleteOutlinedIcon
          sx={{
            width: width,
            height: height,
            marginBottom: ".1875rem",
            color: "error.main",
          }}
        />
      }
      sx={{
        height: buttonHeight,
        padding: padding,
        borderRadius: "6px",
        color: "error.main",
        backgroundColor: "quaternary.dark",
        fontSize: fontSize,
        "& .MuiButton-startIcon": { marginRight: ".125rem" },
        ...extraStyles,
      }}
      onClick={onClick}
    >
      刪除
    </Button>
  );
};
