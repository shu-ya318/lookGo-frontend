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
    id: number;
}

export interface DeleteBookmarkResponse {
    message: string;
}
