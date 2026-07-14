import { useRef, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';

import { Dialog } from '@/components/Dialog';
import {
  ALLOWED_AVATAR_MIME_TYPES,
  DEFAULT_AVATAR_URL,
  MAX_AVATAR_BYTES,
} from '@/constants/user';
import { removeAvatar, updateAvatar } from '@/services/user';

import type { UpdateAvatarResponse } from '@/services/user/interface';

interface UpdateAvatarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string | null;
  onSuccess: (patch: UpdateAvatarResponse) => void;
}

export const UpdateAvatarDialog = ({
  isOpen,
  onClose,
  currentAvatar,
  onSuccess,
}: UpdateAvatarDialogProps) => {
  // 待上傳的 base64 data URI；null 表示尚未選擇新圖片
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const displayAvatar = previewAvatar ?? currentAvatar ?? DEFAULT_AVATAR_URL;

  // 關閉時清空預覽，讓下次開啟從目前頭像重新開始
  const handleClose = () => {
    setPreviewAvatar(null);
    onClose();
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 清空 value，讓使用者可重複選擇同一個檔案觸發 onChange
    event.target.value = '';

    if (!file) return;

    // MIME 類型
    if (
      !ALLOWED_AVATAR_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number],
      )
    ) {
      enqueueSnackbar('僅支援 PNG、JPEG、WEBP 圖片格式!', { variant: 'error' });
      return;
    }

    // 檔案大小
    if (file.size > MAX_AVATAR_BYTES) {
      enqueueSnackbar('頭像圖片大小不得超過 1MB!', { variant: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewAvatar(reader.result as string);
    };
    reader.onerror = () => {
      enqueueSnackbar('讀取圖片失敗，請重新選擇!', { variant: 'error' });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewAvatar) return;

    setIsSubmitting(true);

    try {
      const response = await updateAvatar({ avatar: previewAvatar });
      onSuccess(response);
      enqueueSnackbar('頭像更新成功！', { variant: 'success' });
      handleClose();
    } catch (error) {
      enqueueSnackbar((error as string) || '頭像更新失敗！', {
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setIsSubmitting(true);

    try {
      const response = await removeAvatar();
      onSuccess(response);
      enqueueSnackbar('已恢復為預設頭像！', { variant: 'success' });
      handleClose();
    } catch (error) {
      enqueueSnackbar((error as string) || '移除頭像失敗！', {
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      title='修改頭像'
      width='28rem'
      onClose={handleClose}
      action={
        <>
          <Button
            variant='outlined'
            onClick={handleRemove}
            disabled={isSubmitting}
            sx={{ color: 'neutral.dark', borderColor: 'neutral.light' }}
          >
            移除頭像
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleUpload}
            disabled={isSubmitting || !previewAvatar}
          >
            確認上傳
          </Button>
        </>
      }
    >
      <Stack sx={{ alignItems: 'center', gap: 2, pt: 1 }}>
        <Avatar
          src={displayAvatar}
          sx={{
            width: 120,
            height: 120,
            bgcolor: '#C5CAE9',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <PersonOutlinedIcon sx={{ fontSize: 64, color: '#3F51B5' }} />
        </Avatar>
        <Button
          variant='outlined'
          startIcon={<PhotoCameraOutlinedIcon />}
          onClick={handleSelectClick}
          disabled={isSubmitting}
        >
          選擇圖片
        </Button>
        {/* 隱藏的檔案選擇 input */}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/png,image/jpeg,image/webp'
          hidden
          onChange={handleFileChange}
        />
        <Typography variant='caption' color='text.secondary'>
          支援 PNG、JPEG、WEBP，檔案大小上限 1MB
        </Typography>
      </Stack>
    </Dialog>
  );
};
