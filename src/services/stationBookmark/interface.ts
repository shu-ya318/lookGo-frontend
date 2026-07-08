import type { PageResponse } from '../common/interface';

// All Bookmark Paginated

export interface GetAllBookmarkPaginatedRequest {
    keyword?: string;
    page?: number;
    size?: number;
}

export interface StationBookmark {
    id: number;
    stationId: number;
    stationNameZhTw: string;
    stationNameEn: string;
    userId: number;
    username: string;
    email: string;
    createdAt: string;
}

export type GetAllBookmarkPaginatedResponse = PageResponse<StationBookmark>;

// Create Bookmark

export interface CreateBookmarkRequest {
    stationId: number;
}

// Delete Bookmark

export interface DeleteBookmarkRequest {
    bookmarkId: string;
}

export interface DeleteBookmarkResponse {
    message: string;
}

// Get Bookmark By Station Name

/**
 * 取得單一車站書籤 API 的請求參數
 */
export interface GetBookmarkByStationNameRequest {
    /**
     * 車站中文名稱關鍵字 (必填)
     */
    stationName: string;
}

/**
 * 取得單一車站書籤 API 的回傳結果 (對應 StationBookmarkVO)
 */
export interface StationBookmarkResponse {
    /**
     * 書籤 ID
     * @example 1
     */
    id: number;
    /**
     * 車站 ID
     * @example 3
     */
    stationId: number;
    /**
     * 車站中文名稱
     * @example "淡水站"
     */
    stationNameZhTw: string;
    /**
     * 車站英文名稱
     * @example "Tamsui"
     */
    stationNameEn: string;
    /**
     * 使用者 ID
     * @example 10
     */
    userId: number;
    /**
     * 使用者名稱
     * @example "小明"
     */
    username: string;
    /**
     * 使用者 Email
     * @example "user@example.com"
     */
    email: string;
    /**
     * 收藏時間 (UTC, ISO 8601 格式字串)
     * @example "2026-07-01T08:00:00Z"
     */
    createdAt: string;
}
