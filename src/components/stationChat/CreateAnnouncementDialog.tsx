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
import { createAnnouncement } from '@/services/stationChat';

const formSchema = z.object({
    content: z.string().min(1, '請輸入公告內容!'),
});

type FormData = z.infer<typeof formSchema>;

interface CreateAnnouncementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    stationId: number;
    onSuccess: () => Promise<void>;
}

export const CreateAnnouncementDialog = ({
    isOpen,
    onClose,
    stationId,
    onSuccess,
}: CreateAnnouncementDialogProps) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        defaultValues: { content: '' },
        resolver: zodResolver(formSchema),
        mode: 'onChange',
    });

    useEffect(() => {
        if (isOpen) {
            reset({ content: '' });
        }
    }, [isOpen]);

    const handleClose = (): void => {
        onClose();
        reset({ content: '' });
    };

    const onSubmit: SubmitHandler<FormData> = async data => {
        try {
            const { message } = await createAnnouncement({
                stationId,
                content: data.content,
            });
            enqueueSnackbar(message || '公告新增成功！', {
                variant: 'success',
            });
            onClose();
            await onSuccess();
        } catch (error) {
            enqueueSnackbar((error as string) || '公告新增失敗！', {
                variant: 'error',
            });
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            title='新增公告'
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
                        確認新增
                    </Button>
                </>
            }
        >
            <Stack sx={{ gap: '1.5rem', pt: 1 }}>
                <FormControl fullWidth>
                    <FormLabel
                        htmlFor='AnnouncementContent'
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
                                id='AnnouncementContent'
                                placeholder='請輸入公告內容'
                                multiline
                                minRows={3}
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
