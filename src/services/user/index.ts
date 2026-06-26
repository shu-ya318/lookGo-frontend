import postRequest from '../api';

import type { ApiResponse, PageResponse } from '../common/interface';
import type {
    GetCurrentUserResponse,
    UpdateBirthDateRequest,
    UpdatePasswordRequest,
    UpdateStatusRequest,
    UpdateUsernameRequest,
} from './interface';

export const getCurrentUser = async (): Promise<GetCurrentUserResponse> => {
    return await postRequest<GetCurrentUserResponse>('/user/get-current-user');
};

export const getAllUser = async (): Promise<PageResponse<GetCurrentUserResponse>> => {
    return await postRequest<PageResponse<GetCurrentUserResponse>>('/user/get-all-user');
};

export const updateUsername = async (
    request: UpdateUsernameRequest
): Promise<ApiResponse> => {
    return await postRequest<ApiResponse>('/user/update-username', request);
};

export const updatePassword = async (
    request: UpdatePasswordRequest
): Promise<ApiResponse> => {
    return await postRequest<ApiResponse>('/user/update-password', request);
};

export const updateBirthDate = async (
    request: UpdateBirthDateRequest
): Promise<ApiResponse> => {
    return await postRequest<ApiResponse>('/user/update-birth-date', request);
};

export const updateStatus = async (
    request: UpdateStatusRequest
): Promise<ApiResponse> => {
    return await postRequest<ApiResponse>('/user/update-status', request);
};
