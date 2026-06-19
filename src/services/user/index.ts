import postRequest from '../api';

import type {
    GetCurrentUserResponse,
    GetUsersRequest,
    GetUsersResponse,
} from './interface';

export const getCurrentUser = async (): Promise<GetCurrentUserResponse> => {
    return await postRequest<GetCurrentUserResponse>('/user/get-current-user');
};

export const getUsers = async (
    request: GetUsersRequest
): Promise<GetUsersResponse> => {
    return await postRequest<GetUsersResponse>('/user/get-users', request);
};
