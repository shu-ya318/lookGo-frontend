import postRequest from '../api';

import type {
    CreateStationBookmarkRequest,
    DeleteStationBookmarkRequest,
    DeleteStationBookmarkResponse,
    GetAllStationBookmarkPaginatedRequest,
    GetAllStationBookmarkPaginatedResponse,
    GetStationBookmarkByStationNameRequest,
    StationBookmark,
    StationBookmarkResponse,
} from './interface';

export const createStationBookmark = async (
    request: CreateStationBookmarkRequest
): Promise<StationBookmark> => {
    return await postRequest<StationBookmark>(
        '/station-bookmark/create-bookmark',
        request
    );
};

export const getAllStationBookmarkPaginated = async (
    request: GetAllStationBookmarkPaginatedRequest = {}
): Promise<GetAllStationBookmarkPaginatedResponse> => {
    return await postRequest<GetAllStationBookmarkPaginatedResponse>(
        '/station-bookmark/get-all-bookmark-paginated',
        {},
        { params: request }
    );
};

export const getStationBookmarkExcel = async (): Promise<Blob> => {
    return await postRequest<Blob>(
        '/station-bookmark/get-excel',
        {},
        { responseType: 'blob' }
    );
};

export const getStationBookmarkByStationName = async (
    request: GetStationBookmarkByStationNameRequest
): Promise<StationBookmarkResponse> => {
    return await postRequest<StationBookmarkResponse>(
        '/station-bookmark/get-bookmark-by-station-name',
        {},
        { params: request }
    );
};

export const deleteStationBookmark = async (
    request: DeleteStationBookmarkRequest
): Promise<DeleteStationBookmarkResponse> => {
    return await postRequest<DeleteStationBookmarkResponse>(
        '/station-bookmark/delete-bookmark',
        request
    );
};
