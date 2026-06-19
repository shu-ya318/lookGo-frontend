import { useCallback, useEffect, useMemo, useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { DataGrid } from '@mui/x-data-grid';
import { enqueueSnackbar } from 'notistack';

import { getStations } from '@/services/station';

import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { StationInfo } from '@/services/station/interface';

const StationManagementPage = () => {
    const [rows, setRows] = useState<StationInfo[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [searchValue, setSearchValue] = useState<string | null>(null);

    const handleEdit = (_id: number) => {
        // TODO
    };

    const handleUploadCsv = () => {
        // TODO
    };

    const columns: GridColDef[] = useMemo(
        () => [
            {
                field: 'id',
                headerName: 'ID',
            },
            {
                field: 'nameZhTw',
                headerName: '中文站名',
                flex: 1,
                minWidth: 120,
            },
            {
                field: 'nameEn',
                headerName: '英文站名',
                flex: 1.2,
                minWidth: 150,
            },
            {
                field: 'status',
                headerName: '狀態',
                flex: 0.6,
                minWidth: 80,
            },
            {
                field: 'atm',
                headerName: 'ATM',
                flex: 0.8,
                minWidth: 100,
                valueGetter: (value: string | null) => value ?? '-',
            },
            {
                field: 'nursingRoom',
                headerName: '哺乳室',
                flex: 0.8,
                minWidth: 100,
                valueGetter: (value: string | null) => value ?? '-',
            },
            {
                field: 'diaperTable',
                headerName: '尿布台',
                flex: 0.8,
                minWidth: 100,
                valueGetter: (value: string | null) => value ?? '-',
            },
            {
                field: 'chargingStation',
                headerName: '充電站',
                flex: 0.8,
                minWidth: 100,
                valueGetter: (value: string | null) => value ?? '-',
            },
            {
                field: 'ticketMachine',
                headerName: '售票機',
                flex: 0.8,
                minWidth: 100,
                valueGetter: (value: string | null) => value ?? '-',
            },
            {
                field: 'locker',
                headerName: '置物櫃',
                flex: 0.8,
                minWidth: 100,
                valueGetter: (value: string | null) => value ?? '-',
            },
            {
                field: 'drinkingWater',
                headerName: '飲水機',
                flex: 0.8,
                minWidth: 100,
                valueGetter: (value: string | null) => value ?? '-',
            },
            {
                field: 'restroom',
                headerName: '廁所',
                flex: 0.8,
                minWidth: 100,
                valueGetter: (value: string | null) => value ?? '-',
            },
            {
                field: 'actions',
                headerName: '操作',
                flex: 0.6,
                minWidth: 80,
                sortable: false,
                filterable: false,
                renderCell: (
                    params: GridRenderCellParams<StationInfo>
                ) => (
                    <IconButton
                        size='small'
                        onClick={() => handleEdit(params.row.id)}
                    >
                        <EditOutlinedIcon fontSize='small' />
                    </IconButton>
                ),
            },
        ],
        []
    );

    // const fetchStations = useCallback(async () => {
    //     setIsLoading(true);
    //     try {
    //         const { content, totalElements } = await getStations({
    //             page: paginationModel.page,
    //             pageSize: paginationModel.pageSize,
    //         });
    //         setRows(content);
    //         setRowCount(totalElements);
    //     } catch (error) {
    //         enqueueSnackbar((error as string) || '取得車站列表失敗', {
    //             variant: 'error',
    //         });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, [paginationModel.page, paginationModel.pageSize]);

    // useEffect(() => {
    //     fetchStations();
    // }, [fetchStations]);

    return (
        <Stack
            sx={{
                width: '100%',
                maxWidth: '1280px',
                margin: '3.75rem auto',
                gap: '2rem',
                justifyContent: 'center',
            }}
        >
            <Typography variant='h5'>車站資訊管理</Typography>

            <Stack
                direction='row'
                sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Autocomplete
                    value={searchValue}
                    onChange={(_event, newValue) => setSearchValue(newValue)}
                    options={rows.map(row => row.nameZhTw)}
                    renderInput={params => (
                        <TextField
                            {...params}
                            placeholder='搜尋車站'
                            size='small'
                        />
                    )}
                    sx={{ width: 300 }}
                />
                <Button
                    variant='outlined'
                    color='neutral'
                    onClick={handleUploadCsv}
                >
                    批次上傳 CSV
                </Button>
            </Stack>

            <DataGrid
                rows={rows}
                columns={columns}
                loading={isLoading}
                paginationMode='server'
                rowCount={rowCount}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50, 100]}
                checkboxSelection
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

export default StationManagementPage;
