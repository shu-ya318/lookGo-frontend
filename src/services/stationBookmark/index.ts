import postRequest from '../api';

import type {
    CreateBookmarkRequest,
    DeleteBookmarkRequest,
    DeleteBookmarkResponse,
    GetAllBookmarkPaginatedRequest,
    GetAllBookmarkPaginatedResponse,
    StationBookmark,
} from './interface';

export const getAllBookmarkPaginated = async (
    request: GetAllBookmarkPaginatedRequest = {}
): Promise<GetAllBookmarkPaginatedResponse> => {
    return await postRequest<GetAllBookmarkPaginatedResponse>(
        '/station-bookmark/get-all-bookmark-paginated',
        undefined,
        { params: request }
    );
};

export const createBookmark = async (
    request: CreateBookmarkRequest
): Promise<StationBookmark> => {
    return await postRequest<StationBookmark>(
        '/station-bookmark/create-bookmark',
        request
    );
};

export const deleteBookmark = async (
    request: DeleteBookmarkRequest
): Promise<DeleteBookmarkResponse> => {
    return await postRequest<DeleteBookmarkResponse>(
        '/station-bookmark/delete-bookmark',
        request
    );
};

export const getBookmarkExcel = async (): Promise<Blob> => {
    return await postRequest<Blob>(
        '/station-bookmark/get-excel',
        undefined,
        { responseType: 'blob' }
    );
};
