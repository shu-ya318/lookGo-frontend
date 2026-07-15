import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DataGrid } from '@mui/x-data-grid';
import { enqueueSnackbar } from 'notistack';

import { StationAutocomplete } from '@/components/StationAutocomplete';
import { MetroSyncSection } from '@/components/admin/MetroSyncSection';
import { StationFacilityDialog } from '@/components/admin/StationFacilityDialog';
import { UpdateStationDialog } from '@/components/admin/UpdateStationDialog';
import { getAllStationPaginated } from '@/services/metro';
import { formatDateTime } from '@/utils/date';

import type {
  GridRenderCellParams,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import type { StationOption, StationSummary } from '@/services/metro/interface';

const exportColumnMap = {
  id: 'id',
  nameZhTw: '中文站名',
  nameEn: '英文站名',
  updatedAt: '更新時間',
};

const StationManagementPage = () => {
  const [rows, setRows] = useState<StationSummary[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [searchValue, setSearchValue] = useState<StationOption | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
  const [isStationsLoading, setIsStationsLoading] = useState(false);

  const [facilityDialogOpen, setFacilityDialogOpen] = useState(false);
  const [facilityStationId, setFacilityStationId] = useState<number | null>(
    null,
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStationId, setEditStationId] = useState<number | null>(null);

  const selectedRows =
    rowSelectionModel.type === 'include'
      ? rows.filter((row) => rowSelectionModel.ids.has(row.id))
      : rows.filter((row) => !rowSelectionModel.ids.has(row.id));
  const selectedCount = selectedRows.length;

  const exportStationsToExcel = (rows: StationSummary[]) => {
    if (rows.length === 0) return;

    const exportData = rows.map((row) => {
      const mapped: Record<string, unknown> = {};

      for (const [key, header] of Object.entries(exportColumnMap)) {
        mapped[header] = row[key as keyof StationSummary] ?? '-';
      }

      return mapped;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '車站資訊');
    XLSX.writeFile(workbook, '臺北捷運車站資訊.xlsx');
  };

  const handleEdit = (id: number) => {
    setEditStationId(id);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditStationId(null);
  };

  const handleOpenFacilityDialog = useCallback((id: number) => {
    setFacilityStationId(id);
    setFacilityDialogOpen(true);
  }, []);

  const handleCloseFacilityDialog = () => {
    setFacilityDialogOpen(false);
    setFacilityStationId(null);
  };

  const columns = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'id',
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
        field: 'updatedAt',
        headerName: '更新時間',
        flex: 1,
        minWidth: 160,
        valueGetter: (value: string) => formatDateTime(value) || '-',
      },
      {
        field: 'facilities',
        headerName: '設備資訊',
        flex: 0.6,
        minWidth: 90,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<StationSummary>) => (
          <IconButton
            size='small'
            onClick={() => handleOpenFacilityDialog(params.row.id)}
          >
            <InfoOutlinedIcon fontSize='small' />
          </IconButton>
        ),
      },
      {
        field: 'actions',
        headerName: '編輯資訊',
        flex: 0.6,
        minWidth: 80,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<StationSummary>) => (
          <IconButton size='small' onClick={() => handleEdit(params.row.id)}>
            <EditOutlinedIcon fontSize='small' />
          </IconButton>
        ),
      },
    ],
    [handleOpenFacilityDialog],
  );

  const fetchAllStation = useCallback(async () => {
    setIsStationsLoading(true);

    try {
      const response = await getAllStationPaginated({
        keyword: searchValue?.nameZhTw,
        page: paginationModel.page,
        size: paginationModel.pageSize,
      });
      setRows(response.content);
      setRowCount(response.totalElements);
    } catch (error) {
      enqueueSnackbar((error as string) || '取得車站列表失敗', {
        variant: 'error',
      });
    } finally {
      setIsStationsLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchValue]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllStation();
  }, [fetchAllStation]);

  const handleSearchChange = (newValue: StationOption | null) => {
    setSearchValue(newValue);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: '1280px',
        margin: '3.75rem auto',
        px: 2,
        gap: '2rem',
        justifyContent: 'center',
      }}
    >
      <Typography variant='h5'>車站資訊管理</Typography>
      {/* 捷運資訊同步 */}
      <MetroSyncSection />
      {/* 車站資訊編輯 */}
      <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
        車站資訊編輯
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <StationAutocomplete
          value={searchValue}
          onChange={handleSearchChange}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
        <Stack
          direction='row'
          sx={{
            gap: '1rem',
            alignItems: 'center',
            justifyContent: { xs: 'space-between', sm: 'flex-start' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {selectedCount === 0 && (
            <Stack
              direction='row'
              sx={{
                alignItems: 'center',
                gap: '0.25rem',
                color: 'text.secondary',
              }}
            >
              <InfoOutlinedIcon fontSize='small' />
              <Typography variant='body2'>請先勾選要匯出的車站</Typography>
            </Stack>
          )}
          <Button
            variant='contained'
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={() => exportStationsToExcel(selectedRows)}
            disabled={selectedCount === 0}
          >
            匯出 Excel（{selectedCount}）
          </Button>
        </Stack>
      </Stack>
      {/* 車站資訊表格 */}
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isStationsLoading}
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
      {/* 設備資訊對話框 */}
      <StationFacilityDialog
        isOpen={facilityDialogOpen}
        onClose={handleCloseFacilityDialog}
        stationId={facilityStationId}
      />
      {/* 更新車站資訊對話框 */}
      <UpdateStationDialog
        isOpen={editDialogOpen}
        onClose={handleCloseEditDialog}
        stationId={editStationId}
        onSuccess={fetchAllStation}
      />
    </Stack>
  );
};

export default StationManagementPage;
