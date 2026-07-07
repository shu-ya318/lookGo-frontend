import postRequest from '../api';

import type { MessageVO } from './interface';

// TDX 票價 API 有速率限制（需等待 60 秒才可請求，且分頁請求每分鐘最多 4 次），
// 同步時間可能長達數分鐘，故覆寫預設的 10 秒逾時設定
const SYNC_ALL_STATION_FARE_TIMEOUT_MS = 15 * 60 * 1000;

export const syncAllLine = async (): Promise<MessageVO> => {
    return await postRequest<MessageVO>('/metro/sync/sync-all-line');
};

export const syncAllLineTransfer = async (): Promise<MessageVO> => {
    return await postRequest<MessageVO>('/metro/sync/sync-all-line-transfer');
};

export const syncAllStation = async (): Promise<MessageVO> => {
    return await postRequest<MessageVO>('/metro/sync/sync-all-station');
};

export const syncAllLineStation = async (): Promise<MessageVO> => {
    return await postRequest<MessageVO>('/metro/sync/sync-all-line-station');
};

export const syncAllLineStationCumulativeTime =
    async (): Promise<MessageVO> => {
        return await postRequest<MessageVO>(
            '/metro/sync/sync-all-line-station-cumulative-time'
        );
    };

export const syncAllStationFare = async (): Promise<MessageVO> => {
    return await postRequest<MessageVO>(
        '/metro/sync/sync-all-station-fare',
        undefined,
        { timeout: SYNC_ALL_STATION_FARE_TIMEOUT_MS }
    );
};
