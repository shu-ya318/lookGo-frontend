import postRequest from '../api';

import type { ApiResponse, PaginatedResponse } from '../common/interface';
import type {
    GetAllUserRequest,
    GetCurrentUserResponse,
    UpdateAvatarRequest,
    UpdateBirthDateRequest,
    UpdateCellphoneRequest,
    UpdatePasswordRequest,
    UpdateStatusRequest,
    UpdateUsernameRequest,
} from './interface';

export const getCurrentUser = async (): Promise<GetCurrentUserResponse> => {
    return await postRequest<GetCurrentUserResponse>('/user/get-current-user');
};

export const getAllUser = async (request: GetAllUserRequest = {}): Promise<PaginatedResponse<GetCurrentUserResponse>> => {
    return await postRequest<PaginatedResponse<GetCurrentUserResponse>>('/user/get-all-user', {}, { params: request });
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

export const updateCellphone = async (
    request: UpdateCellphoneRequest
): Promise<ApiResponse> => {
    return await postRequest<ApiResponse>('/user/update-cellphone', request);
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

export const updateAvatar = async (
    request: UpdateAvatarRequest
): Promise<GetCurrentUserResponse> => {
    return await postRequest<GetCurrentUserResponse>('/user/update-avatar', request);
};

export const removeAvatar = async (): Promise<GetCurrentUserResponse> => {
    return await postRequest<GetCurrentUserResponse>('/user/remove-avatar');
};
