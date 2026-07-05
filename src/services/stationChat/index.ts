import postRequest from '../api';

import type {
    CreateAnnouncementRequest,
    DeleteAnnouncementRequest,
    GetAnnouncementByStationIdRequest,
    GetAnnouncementByStationIdResponse,
    GetExcelByStationIdRequest,
    GetMessageByStationIdRequest,
    GetMessageByStationIdResponse,
    MessageResponse,
    UpdateAnnouncementRequest,
} from './interface';

export const getMessageByStationId = async (
    request: GetMessageByStationIdRequest
): Promise<GetMessageByStationIdResponse> => {
    return await postRequest<GetMessageByStationIdResponse>(
        '/station-chat/get-message-by-station-id',
        undefined,
        { params: request }
    );
};

export const getAnnouncementByStationId = async (
    request: GetAnnouncementByStationIdRequest
): Promise<GetAnnouncementByStationIdResponse> => {
    return await postRequest<GetAnnouncementByStationIdResponse>(
        '/station-chat/get-announcement-by-station-id',
        undefined,
        { params: request }
    );
};

export const createAnnouncement = async (
    request: CreateAnnouncementRequest
): Promise<MessageResponse> => {
    return await postRequest<MessageResponse>(
        '/station-chat/create-announcement',
        request
    );
};

export const updateAnnouncement = async (
    request: UpdateAnnouncementRequest
): Promise<MessageResponse> => {
    return await postRequest<MessageResponse>(
        '/station-chat/update-announcement',
        request
    );
};

export const deleteAnnouncement = async (
    request: DeleteAnnouncementRequest
): Promise<MessageResponse> => {
    return await postRequest<MessageResponse>(
        '/station-chat/delete-announcement',
        request
    );
};

export const getExcelByStationId = async (
    request: GetExcelByStationIdRequest
): Promise<Blob> => {
    return await postRequest<Blob>(
        '/station-chat/get-excel-by-station-id',
        request,
        { responseType: 'blob' }
    );
};
