import postRequest from '../api';

import type {
    DeleteBookmarkRequest,
    DeleteBookmarkResponse,
    GetAllBookmarkPaginatedRequest,
    GetAllBookmarkPaginatedResponse,
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
