import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { useUserStore } from '@/stores/userStore';
import { getCurrentUser, updateBirthDate, updateCellphone, updatePassword, updateUsername } from '@/services/user';

import { Dialog } from '@/components/Dialog';

import type { MembershipTier } from '@/services/user/interface';

const membershipTierLabel: Record<MembershipTier, string> = {
    BASIC: '基本',
    PREMIUM: '進階',
};

interface FieldConfig {
    label: string;
    key: string;
    editable: boolean;
}

const profileFields: FieldConfig[] = [
    { label: '電子郵件', key: 'email', editable: false },
    { label: '密碼', key: 'password', editable: true },
    { label: '會員等級', key: 'membershipTier', editable: false },
    { label: '手機號碼 (可選)', key: 'cellphone', editable: true },
    { label: '生日 (可選)', key: 'birthDate', editable: true },
    { label: '最後登入時間', key: 'lastLoginAt', editable: false },
];

const updatePasswordFormSchema = z
    .object({
        oldPassword: z
            .string()
            .min(1, '請輸入舊密碼!'),
        newPassword: z
            .string()
            .min(1, '請輸入新密碼!')
            .min(8, '密碼長度必須為 8-20 個字元!')
            .max(20, '密碼長度必須為 8-20 個字元!'),
        confirmPassword: z
            .string()
            .min(1, '請再次輸入新密碼!'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: '新密碼與確認密碼不符!',
        path: ['confirmPassword'],
    });

type UpdatePasswordFormData = z.infer<typeof updatePasswordFormSchema>;

const passwordDefaultValues: UpdatePasswordFormData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
};

const updateUsernameFormSchema = z.object({
    username: z
        .string()
        .min(1, '請輸入使用者名稱!'),
});

type UpdateUsernameFormData = z.infer<typeof updateUsernameFormSchema>;

const updateCellphoneFormSchema = z.object({
    cellphone: z
        .string()
        .min(1, '請輸入手機號碼!')
        .regex(/^0\d{9}$/, '請輸入 0 開頭的 10 碼手機號碼!'),
});

type UpdateCellphoneFormData = z.infer<typeof updateCellphoneFormSchema>;

const updateBirthDateFormSchema = z.object({
    birthDate: z
        .string()
        .min(1, '請選擇出生日期(西元年份)!')
        .refine((val) => {
            if (!val) return true;
            return /^\d{4}-\d{2}-\d{2}$/.test(val);
        }, '出生日期格式必須為 yyyy-MM-dd!')
        .refine((val) => {
            if (!val) return true;
            const parts = val.split('-');

            if (parts.length !== 3) return false;

            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);

            const inputDate = new Date(year, month, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return inputDate <= today;
        }, '出生日期不得大於今日!'),
});

type UpdateBirthDateFormData = z.infer<typeof updateBirthDateFormSchema>;

const SettingPage = () => {
    const userInfo = useUserStore(state => state.userInfo);

    useEffect(() => {
        const fetchUserInfo = async (): Promise<void> => {
            try {
                const user = await getCurrentUser();
                useUserStore.setState({ userInfo: user });
            } catch (error) {
                enqueueSnackbar(error as string || '取得使用者資訊失敗！', { variant: 'error' });
            }
        };

        fetchUserInfo();
    }, []);

    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);
    const [isCellphoneDialogOpen, setIsCellphoneDialogOpen] = useState(false);
    const [isBirthDateDialogOpen, setIsBirthDateDialogOpen] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        control: passwordControl,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    } = useForm<UpdatePasswordFormData>({
        defaultValues: passwordDefaultValues,
        resolver: zodResolver(updatePasswordFormSchema),
        mode: 'onChange',
    });

    const {
        control: usernameControl,
        handleSubmit: handleUsernameSubmit,
        reset: resetUsername,
        formState: { errors: usernameErrors, isSubmitting: isUsernameSubmitting },
    } = useForm<UpdateUsernameFormData>({
        defaultValues: { username: '' },
        resolver: zodResolver(updateUsernameFormSchema),
        mode: 'onChange',
    });

    const {
        control: cellphoneControl,
        handleSubmit: handleCellphoneSubmit,
        reset: resetCellphone,
        formState: { errors: cellphoneErrors, isSubmitting: isCellphoneSubmitting },
    } = useForm<UpdateCellphoneFormData>({
        defaultValues: { cellphone: '' },
        resolver: zodResolver(updateCellphoneFormSchema),
        mode: 'onChange',
    });

    const {
        control: birthDateControl,
        handleSubmit: handleBirthDateSubmit,
        reset: resetBirthDate,
        formState: { errors: birthDateErrors, isSubmitting: isBirthDateSubmitting },
    } = useForm<UpdateBirthDateFormData>({
        defaultValues: { birthDate: '' },
        resolver: zodResolver(updateBirthDateFormSchema),
        mode: 'onChange',
    });

    const refreshUserInfo = async (): Promise<void> => {
        const user = await getCurrentUser();
        useUserStore.setState({ userInfo: user });
    };

    const getFieldValue = (key: string): string => {
        if (key === 'password') return '••••••••';

        if (!userInfo) return '-';

        if (key === 'membershipTier') {
            return membershipTierLabel[userInfo.membershipTier] || userInfo.membershipTier;
        }

        const value = userInfo[key as keyof typeof userInfo];

        if (value === null || value === undefined) return '-';

        return String(value);
    };

    const handleEdit = (field: string): void => {
        if (field === 'password') {
            setIsPasswordDialogOpen(true);
        } else if (field === 'username') {
            resetUsername({ username: userInfo?.username || '' });
            setIsUsernameDialogOpen(true);
        } else if (field === 'cellphone') {
            resetCellphone({ cellphone: userInfo?.cellphone || '' });
            setIsCellphoneDialogOpen(true);
        } else if (field === 'birthDate') {
            resetBirthDate({ birthDate: userInfo?.birthDate || '' });
            setIsBirthDateDialogOpen(true);
        }
    };

    const handleClosePasswordDialog = (): void => {
        setIsPasswordDialogOpen(false);
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        resetPassword(passwordDefaultValues);
    };

    const handleCloseUsernameDialog = (): void => {
        setIsUsernameDialogOpen(false);
        resetUsername({ username: '' });
    };

    const handleCloseCellphoneDialog = (): void => {
        setIsCellphoneDialogOpen(false);
        resetCellphone({ cellphone: '' });
    };

    const handleCloseBirthDateDialog = (): void => {
        setIsBirthDateDialogOpen(false);
        resetBirthDate({ birthDate: '' });
    };

    const onSubmitPassword: SubmitHandler<UpdatePasswordFormData> = async (data) => {
        await handleUpdatePassword(data);
    };

    const handleUpdatePassword = async (data: UpdatePasswordFormData): Promise<void> => {
        try {
            const { successMessage } = await updatePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
            enqueueSnackbar(successMessage || '密碼修改成功！', { variant: 'success' });
            handleClosePasswordDialog();
        } catch (error) {
            enqueueSnackbar(error as string || '密碼修改失敗！', { variant: 'error' });
        }
    };

    const onSubmitUsername: SubmitHandler<UpdateUsernameFormData> = async (data) => {
        await handleUpdateUsername(data);
    };

    const handleUpdateUsername = async (data: UpdateUsernameFormData): Promise<void> => {
        try {
            const { successMessage } = await updateUsername({
                username: data.username,
            });
            enqueueSnackbar(successMessage || '使用者名稱修改成功！', { variant: 'success' });
            handleCloseUsernameDialog();
            await refreshUserInfo();
        } catch (error) {
            enqueueSnackbar(error as string || '使用者名稱修改失敗！', { variant: 'error' });
        }
    };

    const onSubmitCellphone: SubmitHandler<UpdateCellphoneFormData> = async (data) => {
        await handleUpdateCellphone(data);
    };

    const handleUpdateCellphone = async (data: UpdateCellphoneFormData): Promise<void> => {
        try {
            const { successMessage } = await updateCellphone({ cellphone: data.cellphone });
            enqueueSnackbar(successMessage || '手機號碼修改成功！', { variant: 'success' });
            handleCloseCellphoneDialog();
            await refreshUserInfo();
        } catch (error) {
            enqueueSnackbar(error as string || '手機號碼修改失敗！', { variant: 'error' });
        }
    };

    const onSubmitBirthDate: SubmitHandler<UpdateBirthDateFormData> = async (data) => {
        await handleUpdateBirthDate(data);
    };

    const handleUpdateBirthDate = async (data: UpdateBirthDateFormData): Promise<void> => {
        try {
            const { successMessage } = await updateBirthDate({
                birthDate: data.birthDate,
            });
            enqueueSnackbar(successMessage || '出生日期修改成功！', { variant: 'success' });
            handleCloseBirthDateDialog();
            await refreshUserInfo();
        } catch (error) {
            enqueueSnackbar(error as string || '出生日期修改失敗！', { variant: 'error' });
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: '1280px', mx: 'auto', mt: '3.75rem', mb: '3.75rem' }}>
            {/* Gradient Banner */}
            <Box
                sx={{
                    height: '130px',
                    borderRadius: 2,
                    background: 'linear-gradient(to right, #5fa6f0, #6de69d)',
                }}
            />

            {/* Profile Section */}
            <Stack
                direction='row'
                sx={{
                    alignItems: 'center',
                    px: 3,
                    py: 3,
                    gap: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    mb: 4,
                }}
            >
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#C5CAE9',
                        border: '3px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        mt: -5,
                    }}
                >
                    <PersonOutlinedIcon sx={{ fontSize: 48, color: '#3F51B5' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>
                        {userInfo?.username || '-'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        {userInfo?.email || '-'}
                    </Typography>
                </Box>
                <Button
                    variant='contained'
                    onClick={() => handleEdit('username')}
                    sx={{ px: 3 }}
                >
                    編輯使用者名稱
                </Button>
            </Stack>

            {/* Fields Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
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
                                alignItems: 'center',
                                backgroundColor: '#F5F5F5',
                                borderRadius: 1,
                                px: 2,
                                py: 1.5,
                                minHeight: '48px',
                            }}
                        >
                            <Typography variant='body2' sx={{ flex: 1, color: 'text.secondary' }}>
                                {getFieldValue(field.key)}
                            </Typography>
                            {field.editable && (
                                <IconButton size='small' onClick={() => handleEdit(field.key)}>
                                    <EditOutlinedIcon fontSize='small' />
                                </IconButton>
                            )}
                        </Stack>
                        {field.key === 'membershipTier' && userInfo?.membershipTier === 'BASIC' && (
                            <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center', color: 'info.main', mt: 0.5 }}>
                                <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                                <Typography variant='caption' sx={{ color: 'info.main' }}>
                                    完整填寫個人資料即可升級
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                ))}
            </Box>

            {/* Update Password Dialog */}
            <Dialog
                isOpen={isPasswordDialogOpen}
                title='修改密碼'
                width='28rem'
                action={
                    <>
                        <Button
                            variant='outlined'
                            onClick={handleClosePasswordDialog}
                            sx={{ color: 'neutral.dark', borderColor: 'neutral.light' }}
                        >
                            取消
                        </Button>
                        <Button
                            variant='contained'
                            disabled={isPasswordSubmitting}
                            onClick={handlePasswordSubmit(onSubmitPassword)}
                            sx={{
                                backgroundColor: 'neutral.light',
                                color: 'primary.contrastText',
                                boxShadow: 'none',
                                '&:hover': { backgroundColor: 'neutral.dark' },
                            }}
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
                            control={passwordControl}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id='OldPassword'
                                    type={showOldPassword ? 'text' : 'password'}
                                    placeholder='請輸入舊密碼'
                                    error={!!passwordErrors.oldPassword}
                                    helperText={passwordErrors.oldPassword?.message}
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
                            control={passwordControl}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id='NewPassword'
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder='請輸入新密碼'
                                    error={!!passwordErrors.newPassword}
                                    helperText={passwordErrors.newPassword?.message}
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
                            control={passwordControl}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id='ConfirmPassword'
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder='請再次輸入新密碼'
                                    error={!!passwordErrors.confirmPassword}
                                    helperText={passwordErrors.confirmPassword?.message}
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

            {/* Update Username Dialog */}
            <Dialog
                isOpen={isUsernameDialogOpen}
                title='修改使用者名稱'
                width='28rem'
                action={
                    <>
                        <Button
                            variant='outlined'
                            onClick={handleCloseUsernameDialog}
                            sx={{ color: 'neutral.dark', borderColor: 'neutral.light' }}
                        >
                            取消
                        </Button>
                        <Button
                            variant='contained'
                            disabled={isUsernameSubmitting}
                            onClick={handleUsernameSubmit(onSubmitUsername)}
                            sx={{
                                backgroundColor: 'neutral.light',
                                color: 'primary.contrastText',
                                boxShadow: 'none',
                                '&:hover': { backgroundColor: 'neutral.dark' },
                            }}
                        >
                            確認修改
                        </Button>
                    </>
                }
            >
                <Stack sx={{ gap: '1.5rem', pt: 1 }}>
                    <FormControl fullWidth>
                        <FormLabel
                            htmlFor='Username'
                            required
                            sx={{
                                color: 'neutral.dark',
                                '& .MuiFormLabel-asterisk': { color: 'error.main' },
                            }}
                        >
                            使用者名稱
                        </FormLabel>
                        <Controller
                            name='username'
                            control={usernameControl}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id='Username'
                                    type='text'
                                    placeholder='請輸入新的使用者名稱'
                                    error={!!usernameErrors.username}
                                    helperText={usernameErrors.username?.message}
                                    variant='outlined'
                                />
                            )}
                        />
                    </FormControl>
                </Stack>
            </Dialog>

            {/* Update Cellphone Dialog */}
            <Dialog
                isOpen={isCellphoneDialogOpen}
                title='修改手機號碼'
                width='28rem'
                action={
                    <>
                        <Button
                            variant='outlined'
                            onClick={handleCloseCellphoneDialog}
                            sx={{ color: 'neutral.dark', borderColor: 'neutral.light' }}
                        >
                            取消
                        </Button>
                        <Button
                            variant='contained'
                            disabled={isCellphoneSubmitting}
                            onClick={handleCellphoneSubmit(onSubmitCellphone)}
                            sx={{
                                backgroundColor: 'neutral.light',
                                color: 'primary.contrastText',
                                boxShadow: 'none',
                                '&:hover': { backgroundColor: 'neutral.dark' },
                            }}
                        >
                            確認修改
                        </Button>
                    </>
                }
            >
                <Stack sx={{ gap: '1.5rem', pt: 1 }}>
                    <FormControl fullWidth>
                        <FormLabel
                            htmlFor='Cellphone'
                            required
                            sx={{
                                color: 'neutral.dark',
                                '& .MuiFormLabel-asterisk': { color: 'error.main' },
                            }}
                        >
                            手機號碼
                        </FormLabel>
                        <Controller
                            name='cellphone'
                            control={cellphoneControl}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id='Cellphone'
                                    type='tel'
                                    placeholder='請輸入手機號碼'
                                    error={!!cellphoneErrors.cellphone}
                                    helperText={cellphoneErrors.cellphone?.message}
                                    variant='outlined'
                                />
                            )}
                        />
                    </FormControl>
                </Stack>
            </Dialog>

            {/* Update Birth Date Dialog */}
            <Dialog
                isOpen={isBirthDateDialogOpen}
                title='修改出生西元年份日期'
                width='28rem'
                action={
                    <>
                        <Button
                            variant='outlined'
                            onClick={handleCloseBirthDateDialog}
                            sx={{ color: 'neutral.dark', borderColor: 'neutral.light' }}
                        >
                            取消
                        </Button>
                        <Button
                            variant='contained'
                            disabled={isBirthDateSubmitting}
                            onClick={handleBirthDateSubmit(onSubmitBirthDate)}
                            sx={{
                                backgroundColor: 'neutral.light',
                                color: 'primary.contrastText',
                                boxShadow: 'none',
                                '&:hover': { backgroundColor: 'neutral.dark' },
                            }}
                        >
                            確認修改
                        </Button>
                    </>
                }
            >
                <Stack sx={{ gap: '1.5rem', pt: 1 }}>
                    <FormControl fullWidth>
                        <FormLabel
                            htmlFor='BirthDate'
                            required
                            sx={{
                                color: 'neutral.dark',
                                '& .MuiFormLabel-asterisk': { color: 'error.main' },
                            }}
                        >
                            出生日期
                        </FormLabel>
                        <Controller
                            name='birthDate'
                            control={birthDateControl}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id='BirthDate'
                                    type='date'
                                    error={!!birthDateErrors.birthDate}
                                    helperText={birthDateErrors.birthDate?.message}
                                    variant='outlined'
                                />
                            )}
                        />
                    </FormControl>
                </Stack>
            </Dialog>
        </Box>
    );
};

export default SettingPage;
