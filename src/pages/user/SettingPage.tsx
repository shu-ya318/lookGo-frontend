import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useUserStore } from "@/stores/userStore";
import { getCurrentUser } from "@/services/user";

import { UpdatePasswordDialog } from "@/components/user/UpdatePasswordDialog";
import { UpdateUsernameDialog } from "@/components/user/UpdateUsernameDialog";
import { UpdateCellphoneDialog } from "@/components/user/UpdateCellphoneDialog";
import { UpdateBirthDateDialog } from "@/components/user/UpdateBirthDateDialog";

import type { MembershipTier } from "@/services/user/interface";
import { formatDateTime } from "@/utils/date";

const membershipTierLabel: Record<MembershipTier, string> = {
  BASIC: "基本",
  PREMIUM: "進階",
};

interface FieldConfig {
  label: string;
  key: string;
  editable: boolean;
}

const profileFields: FieldConfig[] = [
  { label: "電子郵件", key: "email", editable: false },
  { label: "密碼", key: "password", editable: true },
  { label: "會員等級", key: "membershipTier", editable: false },
  { label: "手機號碼", key: "cellphone", editable: true },
  { label: "出生日期 (選填)", key: "birthDate", editable: true },
  { label: "最後登入時間", key: "lastLoginAt", editable: false },
];

const SettingPage = () => {
  const userInfo = useUserStore((state) => state.userInfo);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        useUserStore.setState({ userInfo: user });
      } catch (error) {
        enqueueSnackbar((error as string) || "取得使用者資訊失敗！", {
          variant: "error",
        });
      }
    };

    fetchUserInfo();
  }, []);

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);
  const [isCellphoneDialogOpen, setIsCellphoneDialogOpen] = useState(false);
  const [isBirthDateDialogOpen, setIsBirthDateDialogOpen] = useState(false);

  const refreshUserInfo = async () => {
    const user = await getCurrentUser();
    useUserStore.setState({ userInfo: user });
  };

  const getFieldValue = (key: string): string => {
    if (key === "password") return "••••••••";

    if (!userInfo) return "-";

    if (key === "membershipTier") {
      return (
        membershipTierLabel[userInfo.membershipTier] || userInfo.membershipTier
      );
    }

    if (key === "lastLoginAt") {
      return userInfo.lastLoginAt ? formatDateTime(userInfo.lastLoginAt) : "-";
    }

    const value = userInfo[key as keyof typeof userInfo];
    if (value === null || value === undefined) return "-";

    return String(value);
  };

  const handleEdit = (field: string): void => {
    if (field === "password") {
      setIsPasswordDialogOpen(true);
    } else if (field === "username") {
      setIsUsernameDialogOpen(true);
    } else if (field === "cellphone") {
      setIsCellphoneDialogOpen(true);
    } else if (field === "birthDate") {
      setIsBirthDateDialogOpen(true);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1280px",
        mx: "auto",
        mt: "3.75rem",
        mb: "3.75rem",
      }}
    >
      {/* Gradient Banner */}
      <Box
        sx={{
          height: "130px",
          borderRadius: 2,
          background: "linear-gradient(to right, #5fa6f0, #6de69d)",
        }}
      />
      {/* Profile*/}
      <Stack
        direction='row'
        sx={{
          alignItems: "center",
          px: 3,
          py: 3,
          gap: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          mb: 4,
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: "#C5CAE9",
            border: "3px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            mt: -5,
          }}
        >
          <PersonOutlinedIcon sx={{ fontSize: 48, color: "#3F51B5" }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            {userInfo?.username || "-"}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {userInfo?.email || "-"}
          </Typography>
        </Box>
        <Button
          variant='contained'
          onClick={() => handleEdit("username")}
          sx={{ px: 3 }}
        >
          修改使用者名稱
        </Button>
      </Stack>
      {/* Fields Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
          px: 3,
          pb: 4,
        }}
      >
        {profileFields.map((field) => (
          <Box key={field.key}>
            <Typography variant='body2' sx={{ mb: 1, fontWeight: 700 }}>
              {field.label}
            </Typography>
            <Stack
              direction='row'
              sx={{
                alignItems: "center",
                backgroundColor: "#F5F5F5",
                borderRadius: 1,
                px: 2,
                py: 1.5,
                minHeight: "48px",
              }}
            >
              <Typography
                variant='body2'
                sx={{ flex: 1, color: "text.secondary" }}
              >
                {getFieldValue(field.key)}
              </Typography>
              {field.editable && (
                <IconButton size='small' onClick={() => handleEdit(field.key)}>
                  <EditOutlinedIcon fontSize='small' />
                </IconButton>
              )}
            </Stack>
            {field.key === "membershipTier" &&
              userInfo?.membershipTier === "BASIC" && (
                <Stack
                  direction='row'
                  spacing={0.5}
                  sx={{ alignItems: "center", color: "info.main", mt: 0.5 }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                  <Typography variant='caption' sx={{ color: "info.main" }}>
                    完整填寫個人資料即可升級
                  </Typography>
                </Stack>
              )}
          </Box>
        ))}
      </Box>
      {/* Dialog */}
      <UpdatePasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
      />
      <UpdateUsernameDialog
        isOpen={isUsernameDialogOpen}
        onClose={() => setIsUsernameDialogOpen(false)}
        defaultUsername={userInfo?.username || ""}
        onSuccess={refreshUserInfo}
      />
      <UpdateCellphoneDialog
        isOpen={isCellphoneDialogOpen}
        onClose={() => setIsCellphoneDialogOpen(false)}
        defaultCellphone={userInfo?.cellphone || ""}
        onSuccess={refreshUserInfo}
      />
      <UpdateBirthDateDialog
        isOpen={isBirthDateDialogOpen}
        onClose={() => setIsBirthDateDialogOpen(false)}
        defaultBirthDate={userInfo?.birthDate || ""}
        onSuccess={refreshUserInfo}
      />
    </Box>
  );
};

export default SettingPage;
