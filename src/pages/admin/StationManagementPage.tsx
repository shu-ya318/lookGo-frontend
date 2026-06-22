import { /* useCallback, useEffect, */ useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { DataGrid } from '@mui/x-data-grid';
// import { enqueueSnackbar } from 'notistack';

// import { getStations } from '@/services/station';

import type { GridColDef, GridRenderCellParams, GridRowSelectionModel } from '@mui/x-data-grid';
import type { StationInfo } from '@/services/station/interface';

const mockStations: StationInfo[] = [
    {
        id: 1,
        nameZhTw: '淡水',
        nameEn: 'Tamsui',
        status: 1,
        atm: '站內大廳',
        nursingRoom: '付費區內',
        diaperTable: '付費區內',
        chargingStation: '大廳',
        ticketMachine: '大廳',
        locker: '大廳',
        drinkingWater: '付費區內',
        restroom: '付費區內',
    },
    {
        id: 2,
        nameZhTw: '民權西路',
        nameEn: 'Minquan W. Rd.',
        status: 1,
        atm: '站內大廳',
        nursingRoom: '付費區內',
        diaperTable: '付費區內',
        chargingStation: '大廳',
        ticketMachine: '大廳',
        locker: '大廳',
        drinkingWater: '付費區內',
        restroom: '付費區內',
    },
];

const exportColumnMap: Record<string, string> = {
    id: 'ID',
    nameZhTw: '中文站名',
    nameEn: '英文站名',
    status: '狀態',
    atm: 'ATM',
    nursingRoom: '哺乳室',
    diaperTable: '尿布台',
    chargingStation: '充電站',
    ticketMachine: '售票機',
    locker: '置物櫃',
    drinkingWater: '飲水機',
    restroom: '廁所',
};

const StationManagementPage = () => {
    const [rows, /* setRows */] = useState<StationInfo[]>(mockStations);
    const [rowCount, /* setRowCount */] = useState(mockStations.length);
    const [isLoading, /* setIsLoading */] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [searchValue, setSearchValue] = useState<string | null>(null);
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });

    const selectedRows = rowSelectionModel.type === 'include'
        ? rows.filter(row => rowSelectionModel.ids.has(row.id))
        : rows.filter(row => !rowSelectionModel.ids.has(row.id));
    const selectedCount = selectedRows.length;

    const handleEdit = (_id: number) => {
        // TODO
    };

    const handleUploadCsv = () => {
        // TODO
    };

    const handleExportExcel = () => {
        if (selectedRows.length === 0) return;

        const exportData = selectedRows.map(row => {
            const mapped: Record<string, unknown> = {};
            for (const [key, header] of Object.entries(exportColumnMap)) {
                mapped[header] = row[key as keyof StationInfo] ?? '-';
            }
            return mapped;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '車站資訊');
        XLSX.writeFile(workbook, '車站資訊.xlsx');
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
                valueGetter: (value: number) => value === 1 ? '啟用' : '停用',
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
                <Stack direction='row' sx={{ gap: '1rem' }}>
                    {selectedCount > 0 && (
                        <Button
                            variant='contained'
                            color='neutral'
                            startIcon={<FileDownloadOutlinedIcon />}
                            onClick={handleExportExcel}
                        >
                            匯出 Excel（{selectedCount}）
                        </Button>
                    )}
                    <Button
                        variant='outlined'
                        color='neutral'
                        onClick={handleUploadCsv}
                    >
                        批次上傳 CSV
                    </Button>
                </Stack>
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
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={setRowSelectionModel}
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
