import { useCallback, useEffect, useMemo, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';

import { getAllUsers } from '@/services/user';

import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type {
    GetCurrentUserResponse,
    UserStatus,
} from '@/services/user/interface';

const UserPermissionPage = () => {
    const [rows, setRows] = useState<GetCurrentUserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const handleToggleStatus = (userId: number, currentStatus: UserStatus) => {
        // TODO: call API to toggle user status
        console.log('toggle status', userId, currentStatus);
    };

    const columns: GridColDef[] = useMemo(
        () => [
            {
                field: 'email',
                headerName: '電子郵件',
                flex: 1.5,
                minWidth: 200,
            },
            {
                field: 'username',
                headerName: '使用者名稱',
                flex: 1,
                minWidth: 120,
            },
            {
                field: 'membershipTier',
                headerName: '會員等級',
                flex: 0.8,
                minWidth: 100,
            },
            {
                field: 'role',
                headerName: '角色',
                flex: 0.6,
                minWidth: 80,
            },
            {
                field: 'birthDate',
                headerName: '生日',
                flex: 0.8,
                minWidth: 110,
                valueGetter: (value: string | null) => value ?? '-',
            },
            {
                field: 'status',
                headerName: '狀態',
                flex: 0.6,
                minWidth: 80,
            },
            {
                field: 'createdAt',
                headerName: '建立時間',
                flex: 1,
                minWidth: 160,
            },
            {
                field: 'updatedAt',
                headerName: '更新時間',
                flex: 1,
                minWidth: 160,
            },
            {
                field: 'lastLoginAt',
                headerName: '最後登入時間',
                flex: 1,
                minWidth: 160,
                valueGetter: (value: string | null) => value ?? '-',
            },
            {
                field: 'actions',
                headerName: '操作',
                flex: 0.8,
                minWidth: 100,
                sortable: false,
                filterable: false,
                renderCell: (
                    params: GridRenderCellParams<GetCurrentUserResponse>
                ) => {
                    const isActive = params.row.status === 'ACTIVE';
                    return (
                        <Button
                            variant='contained'
                            size='small'
                            color={isActive ? 'error' : 'success'}
                            onClick={() =>
                                handleToggleStatus(
                                    params.row.id,
                                    params.row.status
                                )
                            }
                        >
                            {isActive ? '禁用' : '重啟'}
                        </Button>
                    );
                },
            },
        ],
        []
    );

    const fetchUser = useCallback(async () => {
        setIsLoading(true);

        try {
            const users = await getAllUsers();
            setRows(users);
        } catch (error) {
            enqueueSnackbar((error as string) || '取得使用者列表失敗', {
                variant: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '1280px',
                margin: '3.75rem auto',
                gap: '5.3125rem',
                justifyContent: 'center',
            }}
        >
            <Typography variant='h5'>使用者權限管理</Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={isLoading}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                columnHeaderHeight={64}
                initialState={{
                    columns: {
                        columnVisibilityModel: {
                            id: false,
                        },
                    },
                }}
                sx={{
                    '.MuiDataGrid-columnSeparator': { display: 'none' },
                    '.MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 700,
                        lineHeight: '1.2',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                    },
                    '.MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                    },
                }}
            />
        </Stack>
    );
};

export default UserPermissionPage;
