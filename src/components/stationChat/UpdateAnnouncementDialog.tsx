import { useEffect } from 'react';
import { z } from 'zod';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { Dialog } from '@/components/Dialog';
import { updateAnnouncement } from '@/services/stationChat';

import type { StationChatAnnouncement } from '@/services/stationChat/interface';

const formSchema = z.object({
    content: z.string().min(1, '請輸入公告內容!'),
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = { content: '' };

interface UpdateAnnouncementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    announcement: StationChatAnnouncement | null;
    onSuccess: () => Promise<void>;
}

export const UpdateAnnouncementDialog = ({
    isOpen,
    onClose,
    announcement,
    onSuccess,
}: UpdateAnnouncementDialogProps) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        defaultValues,
        resolver: zodResolver(formSchema),
        mode: 'onChange',
    });

    useEffect(() => {
        if (isOpen) {
            reset({ content: announcement?.content ?? '' });
        }
    }, [isOpen]);

    const handleClose = (): void => {
        onClose();
        reset(defaultValues);
    };

    const onSubmit: SubmitHandler<FormData> = async data => {
        if (!announcement) return;

        try {
            const response = await updateAnnouncement({
                announcementId: announcement.id,
                content: data.content,
            });
            enqueueSnackbar(response.message || '公告修改成功！', {
                variant: 'success',
            });
            onClose();
            await onSuccess();
        } catch (error) {
            enqueueSnackbar((error as string) || '公告修改失敗！', {
                variant: 'error',
            });
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            title='編輯公告'
            width='28rem'
            action={
                <>
                    <Button
                        variant='outlined'
                        onClick={handleClose}
                        sx={{ color: 'neutral.dark', borderColor: 'neutral.light' }}
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
            <Stack sx={{ pt: 1 }}>
                <FormControl fullWidth>
                    <FormLabel
                        htmlFor='UpdateAnnouncementContent'
                        required
                        sx={{
                            color: 'neutral.dark',
                            '& .MuiFormLabel-asterisk': { color: 'error.main' },
                        }}
                    >
                        公告內容
                    </FormLabel>
                    <Controller
                        name='content'
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                id='UpdateAnnouncementContent'
                                placeholder='請輸入公告內容'
                                error={!!errors.content}
                                helperText={errors.content?.message}
                                variant='outlined'
                            />
                        )}
                    />
                </FormControl>
            </Stack>
        </Dialog>
    );
};
