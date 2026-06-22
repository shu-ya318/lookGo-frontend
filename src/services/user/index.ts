import postRequest from '../api';

import type { ApiResponse } from '../common/interface';
import type {
    GetCurrentUserResponse,
    UpdateBirthDateRequest,
    UpdatePasswordRequest,
    UpdateUsernameRequest,
} from './interface';

export const getCurrentUser = async (): Promise<GetCurrentUserResponse> => {
    return await postRequest<GetCurrentUserResponse>('/user/get-current-user');
};

export const getAllUsers = async (): Promise<GetCurrentUserResponse[]> => {
    return await postRequest<GetCurrentUserResponse[]>('/user/get-all-user');
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
