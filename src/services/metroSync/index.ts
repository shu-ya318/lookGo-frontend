import postRequest from '../api';

import type { ApiResponse } from '../common/interface';

// TDX 票價 API 有速率限制，同步時間可能長達數分鐘，覆寫預設 10 秒逾時設定
const SYNC_ALL_STATION_FARE_TIMEOUT_MS = 15 * 60 * 1000;

export const syncAllLine = async (): Promise<ApiResponse> => {
    return await postRequest<ApiResponse>('/metro/sync/sync-all-line');
};

export const syncAllLineTransfer = async (): Promise<ApiResponse> => {
    return await postRequest<ApiResponse>('/metro/sync/sync-all-line-transfer');
};

export const syncAllStation = async (): Promise<ApiResponse> => {
    return await postRequest<ApiResponse>('/metro/sync/sync-all-station');
};

export const syncAllLineStation = async (): Promise<ApiResponse> => {
    return await postRequest<ApiResponse>('/metro/sync/sync-all-line-station');
};

export const syncAllLineStationCumulativeTime =
    async (): Promise<ApiResponse> => {
        return await postRequest<ApiResponse>(
            '/metro/sync/sync-all-line-station-cumulative-time'
        );
    };

export const syncAllStationFare = async (): Promise<ApiResponse> => {
    return await postRequest<ApiResponse>(
        '/metro/sync/sync-all-station-fare',
        {},
        { timeout: SYNC_ALL_STATION_FARE_TIMEOUT_MS }
    );
};
