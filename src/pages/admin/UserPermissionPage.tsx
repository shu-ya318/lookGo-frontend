import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { enqueueSnackbar } from "notistack";
import { debounce } from "lodash-es";

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";

import { SearchInput } from "@/components/SearchInput";
import { getAllUser, updateStatus } from "@/services/user";

import type { ChipProps } from "@mui/material/Chip";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type {
  GetCurrentUserResponse,
  MembershipTier,
  UserRole,
  UserStatus,
} from "@/services/user/interface";
import { formatDateTime } from "@/utils/date";

const roleColorMap: Record<UserRole, ChipProps["color"]> = {
  ADMIN: "primary",
  USER: "default",
};

const membershipTierColorMap: Record<MembershipTier, ChipProps["color"]> = {
  PREMIUM: "warning",
  BASIC: "default",
};

const statusColorMap: Record<UserStatus, ChipProps["color"]> = {
  ACTIVE: "success",
  DISABLED: "default",
};

const UserPermissionPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const [rows, setRows] = useState<GetCurrentUserResponse[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { content, totalElements } = await getAllUser({
        keyword,
        page: paginationModel.page,
        size: paginationModel.pageSize,
      });
      setRows(content);
      setRowCount(totalElements);
    } catch (error) {
      enqueueSnackbar((error as string) || "取得使用者列表失敗", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [keyword, paginationModel.page, paginationModel.pageSize]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
  }, [fetchUser]);

  const debouncedSetKeyword = useMemo(
    () =>
      debounce((value: string) => {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        setKeyword(value);
      }, 500),
    []
  );

  const handleUserListSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    debouncedSetKeyword(value);
  };

  const handleToggleStatus = useCallback(
    async (userId: number, currentStatus: UserStatus): Promise<void> => {
      const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";

      try {
        await updateStatus({ userId, status: newStatus });
        enqueueSnackbar("使用者狀態已更新", { variant: "success" });
        await fetchUser();
      } catch (error) {
        enqueueSnackbar((error as string) || "更新使用者狀態失敗", {
          variant: "error",
        });
      }
    },
    [fetchUser]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "email", headerName: "電子郵件", flex: 1.5, minWidth: 200 },
      { field: "username", headerName: "使用者名稱", flex: 1, minWidth: 120 },
      {
        field: "membershipTier",
        headerName: "會員等級",
        flex: 0.8,
        minWidth: 110,
        renderCell: (params: GridRenderCellParams<GetCurrentUserResponse>) => (
          <Chip
            label={params.row.membershipTier}
            color={membershipTierColorMap[params.row.membershipTier]}
            variant='filled'
            size='small'
            sx={{ borderRadius: "3px" }}
          />
        ),
      },
      {
        field: "role",
        headerName: "角色",
        flex: 0.6,
        minWidth: 100,
        renderCell: (params: GridRenderCellParams<GetCurrentUserResponse>) => (
          <Chip
            label={params.row.role}
            color={roleColorMap[params.row.role]}
            variant='filled'
            size='small'
            sx={{ borderRadius: "3px" }}
          />
        ),
      },
      {
        field: "birthDate",
        headerName: "生日",
        flex: 0.8,
        minWidth: 110,
        valueGetter: (value: string) => value ?? "-",
      },
      {
        field: "createdAt",
        headerName: "建立時間",
        flex: 1,
        minWidth: 160,
        valueGetter: (value: string) => formatDateTime(value) ?? "-",
      },
      {
        field: "updatedAt",
        headerName: "更新時間",
        flex: 1,
        minWidth: 160,
        valueGetter: (value: string) => formatDateTime(value) ?? "-",
      },
      {
        field: "lastLoginAt",
        headerName: "最後登入時間",
        flex: 1,
        minWidth: 160,
        valueGetter: (value: string) => formatDateTime(value) ?? "-",
      },
      {
        field: "status",
        headerName: "狀態",
        flex: 0.6,
        minWidth: 100,
        renderCell: (params: GridRenderCellParams<GetCurrentUserResponse>) => (
          <Chip
            label={params.row.status}
            color={statusColorMap[params.row.status]}
            variant='filled'
            size='small'
            sx={{ borderRadius: "3px" }}
          />
        ),
      },
      {
        field: "actions",
        headerName: "操作",
        flex: 0.8,
        minWidth: 100,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<GetCurrentUserResponse>) => {
          const isActive = params.row.status === "ACTIVE";
          const isAdmin = params.row.role === "ADMIN";
          return (
            <Button
              variant='contained'
              size='small'
              color={isActive ? "error" : "success"}
              disabled={isAdmin}
              onClick={() =>
                handleToggleStatus(params.row.id, params.row.status)
              }
            >
              {isActive ? "禁用" : "重啟"}
            </Button>
          );
        },
      },
    ],
    [handleToggleStatus]
  );

  return (
    <Stack
      spacing={3}
      sx={{
        width: "100%",
        maxWidth: "1280px",
        margin: "3.75rem auto",
        px: 2,
      }}
    >
      <Typography variant='h5'>使用者權限管理</Typography>
      <SearchInput searchTerm={inputValue} onChange={handleUserListSearch} placeholder="請輸入使用者名稱搜尋" />
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        rowCount={rowCount}
        paginationMode='server'
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
        columnHeaderHeight={64}
        initialState={{
          columns: {
            columnVisibilityModel: { id: false },
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
    </Stack>
  );
};

export default UserPermissionPage;
