import { useState } from 'react';
import { z } from 'zod';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { Dialog } from '@/components/Dialog';
import { updatePassword } from '@/services/user';

const formSchema = z
    .object({
        oldPassword: z.string().min(1, '請輸入舊密碼!'),
        newPassword: z
            .string()
            .min(1, '請輸入新密碼!')
            .min(8, '密碼長度必須為 8-20 個字元!')
            .max(20, '密碼長度必須為 8-20 個字元!'),
        confirmPassword: z.string().min(1, '請再次輸入新密碼!'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: '新密碼與確認密碼不符!',
        path: ['confirmPassword'],
    });

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
};

interface UpdatePasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpdatePasswordDialog = ({ isOpen, onClose }: UpdatePasswordDialogProps) => {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const handleClose = (): void => {
        onClose();
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        reset(defaultValues);
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            const { successMessage } = await updatePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
            enqueueSnackbar(successMessage || '密碼修改成功！', { variant: 'success' });
            handleClose();
        } catch (error) {
            enqueueSnackbar(error as string || '密碼修改失敗！', { variant: 'error' });
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            title='修改密碼'
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
            <Stack sx={{ gap: '1.5rem', pt: 1 }}>
                <FormControl fullWidth>
                    <FormLabel
                        htmlFor='OldPassword'
                        required
                        sx={{
                            color: 'neutral.dark',
                            '& .MuiFormLabel-asterisk': { color: 'error.main' },
                        }}
                    >
                        舊密碼
                    </FormLabel>
                    <Controller
                        name='oldPassword'
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                id='OldPassword'
                                type={showOldPassword ? 'text' : 'password'}
                                placeholder='請輸入舊密碼'
                                error={!!errors.oldPassword}
                                helperText={errors.oldPassword?.message}
                                variant='outlined'
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                                    edge='end'
                                                >
                                                    {showOldPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        )}
                    />
                </FormControl>

                <FormControl fullWidth>
                    <FormLabel
                        htmlFor='NewPassword'
                        required
                        sx={{
                            color: 'neutral.dark',
                            '& .MuiFormLabel-asterisk': { color: 'error.main' },
                        }}
                    >
                        新密碼
                    </FormLabel>
                    <Controller
                        name='newPassword'
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                id='NewPassword'
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder='請輸入新密碼'
                                error={!!errors.newPassword}
                                helperText={errors.newPassword?.message}
                                variant='outlined'
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    edge='end'
                                                >
                                                    {showNewPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        )}
                    />
                </FormControl>

                <FormControl fullWidth>
                    <FormLabel
                        htmlFor='ConfirmPassword'
                        required
                        sx={{
                            color: 'neutral.dark',
                            '& .MuiFormLabel-asterisk': { color: 'error.main' },
                        }}
                    >
                        確認新密碼
                    </FormLabel>
                    <Controller
                        name='confirmPassword'
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                id='ConfirmPassword'
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder='請再次輸入新密碼'
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message}
                                variant='outlined'
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge='end'
                                                >
                                                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        )}
                    />
                </FormControl>
            </Stack>
        </Dialog>
    );
};
