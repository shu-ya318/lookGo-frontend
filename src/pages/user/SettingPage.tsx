import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

import { useUserStore } from '@/stores/userStore';

interface FieldConfig {
    label: string;
    key: string;
    editable: boolean;
}

const fields: FieldConfig[] = [
    { label: '使用者名稱', key: 'username', editable: true },
    { label: '電子郵件', key: 'email', editable: false },
    { label: '會員等級', key: 'membershipTier', editable: true },
    { label: '生日', key: 'birthDate', editable: true },
    { label: '角色', key: 'role', editable: false },
    { label: '狀態', key: 'status', editable: false },
    { label: '建立時間', key: 'createdAt', editable: false },
    { label: '更新時間', key: 'updatedAt', editable: false },
    { label: '最後登入時間', key: 'lastLoginAt', editable: false },
];

const SettingPage = () => {
    const userInfo = useUserStore(state => state.userInfo);

    const getFieldValue = (key: string): string => {
        if (!userInfo) return '-';
        const value = userInfo[key as keyof typeof userInfo];
        if (value === null || value === undefined) return '-';
        return String(value);
    };

    const handleEdit = (_field: string) => {
        // TODO
    };

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '1280px',
                margin: '3.75rem auto',
                gap: '2rem',
            }}
        >
            <Stack
                sx={{
                    alignItems: 'center',
                    gap: '1rem',
                    py: 3,
                    backgroundColor: 'quaternary.dark',
                    borderRadius: 2,
                }}
            >
                <Typography variant='h5'>個人檔案</Typography>
                <Avatar sx={{ width: 48, height: 48, bgcolor: '#C5CAE9' }}>
                    <PersonOutlinedIcon
                        sx={{ fontSize: 32, color: '#3F51B5' }}
                    />
                </Avatar>
            </Stack>

            <Stack
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                }}
            >
                {fields.map((field, index) => (
                    <Stack key={field.key}>
                        {index > 0 && (
                            <Divider sx={{ borderColor: 'tertiary.dark' }} />
                        )}
                        <Stack
                            direction='row'
                            sx={{
                                alignItems: 'center',
                                px: 4,
                                py: 3,
                                backgroundColor: 'tertiary.dark',
                            }}
                        >
                            <Typography
                                variant='body2'
                                sx={{
                                    width: '120px',
                                    flexShrink: 0,
                                    fontWeight: 500,
                                }}
                            >
                                {field.label}
                            </Typography>
                            <Typography
                                variant='body2'
                                sx={{ flex: 1 }}
                            >
                                {getFieldValue(field.key)}
                            </Typography>
                            {field.editable && (
                                <IconButton
                                    size='small'
                                    onClick={() => handleEdit(field.key)}
                                >
                                    <EditOutlinedIcon fontSize='small' />
                                </IconButton>
                            )}
                        </Stack>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    );
};

export default SettingPage;
