import { useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";

import { Dialog } from "@/components/Dialog";
import { StationAutocomplete } from "@/components/StationAutocomplete";
import { UpdateStationDialog } from "@/components/admin/UpdateStationDialog";
import { getAllStationPaginated, getStationById } from "@/services/metro";
import {
  syncAllLine,
  syncAllLineStation,
  syncAllLineStationCumulativeTime,
  syncAllLineTransfer,
  syncAllStation,
  syncAllStationFare,
} from "@/services/metroSync";
import { formatDateTime } from "@/utils/date";

import type {
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import type { MessageVO } from "@/services/metroSync/interface";
import type {
  Station,
  StationOption,
  StationSummary,
} from "@/services/metro/interface";

const exportColumnMap: Record<string, string> = {
  id: "ID",
  nameZhTw: "中文站名",
  nameEn: "英文站名",
  updatedAt: "更新時間",
};

const facilityFieldMap: { key: keyof Station; label: string }[] = [
  { key: "atm", label: "ATM" },
  { key: "nursingRoom", label: "哺乳室" },
  { key: "diaperTable", label: "尿布台" },
  { key: "chargingStation", label: "充電站" },
  { key: "ticketMachine", label: "售票機" },
  { key: "drinkingWater", label: "飲水機" },
  { key: "restroom", label: "廁所" },
  { key: "elevator", label: "電梯" },
  { key: "escalator", label: "手扶梯" },
];

type MetroSyncKey =
  | "line"
  | "lineTransfer"
  | "station"
  | "lineStation"
  | "lineStationCumulativeTime"
  | "stationFare";

const metroSyncItems: {
  key: MetroSyncKey;
  label: string;
  note?: string;
  sync: () => Promise<MessageVO>;
}[] = [
    { key: "line", label: "路線", sync: syncAllLine },
    { key: "lineTransfer", label: "路線換乘", sync: syncAllLineTransfer },
    { key: "station", label: "車站", sync: syncAllStation },
    { key: "lineStation", label: "路線車站", sync: syncAllLineStation },
    {
      key: "lineStationCumulativeTime",
      label: "路線車站累計行駛時間",
      sync: syncAllLineStationCumulativeTime,
    },
    {
      key: "stationFare",
      label: "票價",
      note: "同步時間較長，請耐心等候",
      sync: syncAllStationFare,
    },
  ];

const StationManagementPage = () => {
  const [rows, setRows] = useState<StationSummary[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = useState<StationOption | null>(null);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({ type: "include", ids: new Set() });
  const [facilityDialogOpen, setFacilityDialogOpen] = useState(false);
  const [facilityStation, setFacilityStation] = useState<Station | null>(
    null
  );
  const [isFacilityLoading, setIsFacilityLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStationId, setEditStationId] = useState<string | null>(null);
  const [syncingKey, setSyncingKey] = useState<MetroSyncKey | null>(null);

  const selectedRows =
    rowSelectionModel.type === "include"
      ? rows.filter((row) => rowSelectionModel.ids.has(row.id))
      : rows.filter((row) => !rowSelectionModel.ids.has(row.id));
  const selectedCount = selectedRows.length;

  const handleEdit = (id: string) => {
    setEditStationId(id);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditStationId(null);
  };

  const handleOpenFacilityDialog = useCallback(async (id: string) => {
    setFacilityDialogOpen(true);
    setIsFacilityLoading(true);
    try {
      const station = await getStationById({ id });
      setFacilityStation(station);
    } catch (error) {
      enqueueSnackbar((error as string) || "取得設備資訊失敗", {
        variant: "error",
      });
      setFacilityDialogOpen(false);
    } finally {
      setIsFacilityLoading(false);
    }
  }, []);

  const handleCloseFacilityDialog = () => {
    setFacilityDialogOpen(false);
    setFacilityStation(null);
  };

  const handleSync = async (item: (typeof metroSyncItems)[number]) => {
    setSyncingKey(item.key);
    try {
      const { message } = await item.sync();
      enqueueSnackbar(message || `${item.label}同步成功！`, {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar((error as string) || `${item.label}同步失敗！`, {
        variant: "error",
      });
    } finally {
      setSyncingKey(null);
    }
  };

  useEffect(() => {
    if (!syncingKey) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [syncingKey]);

  const syncingLabel = metroSyncItems.find(
    (item) => item.key === syncingKey
  )?.label;

  const handleExportExcel = () => {
    if (selectedRows.length === 0) return;

    const exportData = selectedRows.map((row) => {
      const mapped: Record<string, unknown> = {};
      for (const [key, header] of Object.entries(exportColumnMap)) {
        mapped[header] = row[key as keyof StationSummary] ?? "-";
      }
      return mapped;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "車站資訊");
    XLSX.writeFile(workbook, "車站資訊.xlsx");
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "id",
        headerName: "ID",
      },
      {
        field: "nameZhTw",
        headerName: "中文站名",
        flex: 1,
        minWidth: 120,
      },
      {
        field: "nameEn",
        headerName: "英文站名",
        flex: 1.2,
        minWidth: 150,
      },
      {
        field: "updatedAt",
        headerName: "更新時間",
        flex: 1,
        minWidth: 160,
        valueGetter: (value: string) => formatDateTime(value) || "-",
      },
      {
        field: "facilities",
        headerName: "設備資訊",
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
        field: "actions",
        headerName: "編輯資訊",
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
    [handleOpenFacilityDialog]
  );

  const fetchStations = useCallback(async () => {
    setIsLoading(true);
    try {
      const { content, totalElements } = await getAllStationPaginated({
        keyword: searchValue?.nameZhTw,
        page: paginationModel.page,
        size: paginationModel.pageSize,
      });
      setRows(content);
      setRowCount(totalElements);
    } catch (error) {
      enqueueSnackbar((error as string) || "取得車站列表失敗", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchValue]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStations();
  }, [fetchStations]);

  const handleSearchChange = (newValue: StationOption | null) => {
    setSearchValue(newValue);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <Stack
      sx={{
        width: "100%",
        maxWidth: "1280px",
        margin: "3.75rem auto",
        gap: "2rem",
        justifyContent: "center",
      }}
    >
      <Typography variant='h5'>車站資訊管理</Typography>
      {/* 捷運資訊同步 */}
      <Stack sx={{ gap: "0.625rem" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
          捷運資訊同步
        </Typography>
        {syncingKey && (
          <Alert severity='warning' sx={{ maxWidth: "33.375rem" }}>
            正在同步「{syncingLabel}」，同步完成前請勿關閉或重新整理分頁
          </Alert>
        )}
        <Stack sx={{ gap: "1.125rem", maxWidth: "33.375rem" }}>
          {metroSyncItems.map((item) => (
            <Stack
              key={item.key}
              direction='row'
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Stack>
                <Typography sx={{ color: "text.secondary" }}>
                  {item.label}
                </Typography>
                {item.note && (
                  <Typography variant='caption' sx={{ color: "text.disabled" }}>
                    {item.note}
                  </Typography>
                )}
              </Stack>
              <Button
                variant='outlined'
                size='small'
                loading={syncingKey === item.key}
                disabled={syncingKey !== null && syncingKey !== item.key}
                onClick={() => handleSync(item)}
              >
                同步
              </Button>
            </Stack>
          ))}
        </Stack>
      </Stack>
      {/* 車站資訊編輯 */}
      <Typography sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
        車站資訊編輯
      </Typography>
      <Stack
        direction='row'
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <StationAutocomplete
          value={searchValue}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
        <Stack direction='row' sx={{ gap: "1rem", alignItems: "center" }}>
          {selectedCount === 0 && (
            <Stack
              direction='row'
              sx={{ alignItems: "center", gap: "0.25rem", color: "text.secondary" }}
            >
              <InfoOutlinedIcon fontSize='small' />
              <Typography variant='body2'>請先勾選要匯出的車站</Typography>
            </Stack>
          )}
          <Button
            variant='contained'
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={handleExportExcel}
            disabled={selectedCount === 0}
          >
            匯出 Excel（{selectedCount}）
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
          ".MuiDataGrid-columnSeparator": { display: "none" },
          ".MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
            lineHeight: "1.2",
            whiteSpace: "normal",
            wordBreak: "break-word",
          },
          ".MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
          },
        }}
      />

      <Dialog
        isOpen={facilityDialogOpen}
        onClose={handleCloseFacilityDialog}
        title={
          facilityStation ? `${facilityStation.nameZhTw} 設備資訊` : "設備資訊"
        }
        width='24rem'
      >
        {isFacilityLoading || !facilityStation ? (
          <Typography>載入中...</Typography>
        ) : (
          <Stack sx={{ gap: "0.75rem" }}>
            {facilityFieldMap.map(({ key, label }) => (
              <Stack
                key={key}
                direction='row'
                sx={{ justifyContent: "space-between" }}
              >
                <Typography sx={{ color: "text.secondary" }}>
                  {label}
                </Typography>
                <Typography>{facilityStation[key] || "-"}</Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Dialog>

      <UpdateStationDialog
        isOpen={editDialogOpen}
        onClose={handleCloseEditDialog}
        stationId={editStationId}
        onSuccess={fetchStations}
      />
    </Stack>
  );
};

export default StationManagementPage;
